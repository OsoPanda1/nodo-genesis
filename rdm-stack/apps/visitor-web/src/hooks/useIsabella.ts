/**
 * Hook para interactuar con Isabella AI
 * Triple Federado: Conceptual | Legal | Técnico
 */

import { useState, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateFederationHash } from "@/lib/federation";

export interface IsabellaMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  federationHash?: string;
  emotionalContext?: {
    sentiment: string;
    intensity: number;
  };
}

export interface IsabellaMeta {
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  activeProtocol: string | null;
  emotionalState: {
    sentiment: string;
    intensity: number;
  };
}

const ISABELLA_ENDPOINT =
  import.meta.env.VITE_ISABELLA_ENDPOINT ?? `/api/isa-ai`;

const INITIAL_META: IsabellaMeta = {
  isLoading: false,
  error: null,
  sessionId: generateFederationHash(),
  activeProtocol: null,
  emotionalState: { sentiment: "neutral", intensity: 0.5 },
};

function useIsabellaMessages() {
  return useState<IsabellaMessage[]>([]);
}

function useIsabellaMeta() {
  return useState<IsabellaMeta>(INITIAL_META);
}

export const useIsabella = () => {
  const [messages, setMessages] = useIsabellaMessages();
  const [meta, setMeta] = useIsabellaMeta();

  const messagesRef = useRef(messages);
  const sessionIdRef = useRef(meta.sessionId);
  const abortControllerRef = useRef<AbortController | null>(null);

  messagesRef.current = messages;
  sessionIdRef.current = meta.sessionId;

  const sendMessage = useCallback(
    async (
      content: string,
      options?: {
        protocol?: "fenix_rex" | "iniciacion" | "hoyo_negro";
        challengeResponse?: string;
      },
    ) => {
      if (!content.trim()) return;

      const userMessage: IsabellaMessage = {
        id: generateFederationHash(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
        federationHash: generateFederationHash(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMeta((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        activeProtocol: options?.protocol || null,
      }));

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentMessages = messagesRef.current;
        const currentSessionId = sessionIdRef.current;
        const apiMessages = currentMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        apiMessages.push({ role: "user", content });

        const token = session?.access_token;

        const response = await fetch(ISABELLA_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            messages: apiMessages,
            userId: session?.user?.id,
            sessionId: currentSessionId,
            protocol: options?.protocol,
            challengeResponse: options?.challengeResponse,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al comunicarse con Isabella");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        let textBuffer = "";

        const assistantMessageId = generateFederationHash();

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            federationHash: generateFederationHash(),
          },
        ]);

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content;

              if (deltaContent) {
                assistantContent += deltaContent;
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last) next[next.length - 1] = { ...last, content: assistantContent };
                  return next;
                });
              }
            } catch {
              //
            }
          }
        }

        setMeta((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setMeta((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        }));
      }
    },
    [],
  );

  const activateProtocol = useCallback(
    (protocol: "fenix_rex" | "iniciacion" | "hoyo_negro") => {
      setMeta((prev) => ({ ...prev, activeProtocol: protocol }));
      sendMessage(`[ACTIVACIÓN DE PROTOCOLO: ${protocol.toUpperCase()}]`, { protocol });
    },
    [sendMessage],
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setMeta(INITIAL_META);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setMeta((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const value = useMemo(
    () => ({
      messages,
      isLoading: meta.isLoading,
      error: meta.error,
      sessionId: meta.sessionId,
      activeProtocol: meta.activeProtocol,
      emotionalState: meta.emotionalState,
      sendMessage,
      activateProtocol,
      clearConversation,
      cancelRequest,
    }),
    [
      messages,
      meta.isLoading,
      meta.error,
      meta.sessionId,
      meta.activeProtocol,
      meta.emotionalState,
      sendMessage,
      activateProtocol,
      clearConversation,
      cancelRequest,
    ],
  );

  return value;
};


