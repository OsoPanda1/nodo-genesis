"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, Send, User, Sparkles, X, Shield, RefreshCw,
  Fingerprint, BrainCircuit, Gauge, ChevronDown, Wrench, AlertTriangle,
} from 'lucide-react';
import { EngineName, IsabellaDecision, IsabellaToolCall } from '@/lib/isabella/contracts';

interface Message {
  id: string;
  sender: 'isabella' | 'user';
  text: string;
  timestamp: string;
  decision?: IsabellaDecision;
  traceId?: string;
  responseMode?: 'answer' | 'clarification' | 'abstention' | 'safe-refusal' | 'degraded';
  isError?: boolean;
}

interface IsabellaChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const SESSION_KEY = 'yun:isabella:session';

const PIPELINE_STAGES = ['Percibiendo', 'Recordando', 'Decidiendo', 'Actuando', 'Auditando'];

const policyLabels: Record<string, { label: string; color: string }> = {
  allowed: { label: 'Permitida', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60' },
  denied: { label: 'Denegada', color: 'text-rose-300 border-rose-500/40 bg-rose-950/60' },
  degraded: { label: 'Degradada', color: 'text-amber-300 border-amber-500/40 bg-amber-950/60' },
  pending: { label: 'En aprobación', color: 'text-sky-300 border-sky-500/40 bg-sky-950/60' },
  requires_approval: { label: 'Requiere aprobación', color: 'text-amber-300 border-amber-500/40 bg-amber-950/60' },
};

const riskColors: Record<string, string> = {
  low: 'text-emerald-300',
  medium: 'text-amber-300',
  high: 'text-rose-300',
  critical: 'text-rose-400',
};

const responseModeBanner: Record<string, { label: string; color: string }> = {
  'safe-refusal': { label: 'Respuesta rechazada por política de seguridad', color: 'text-rose-300 border-rose-500/30 bg-rose-950/40' },
  degraded: { label: 'Isabella respondió en modo degradado', color: 'text-amber-300 border-amber-500/30 bg-amber-950/40' },
  abstention: { label: 'Isabella se abstuvo por falta de evidencia suficiente', color: 'text-sky-300 border-sky-500/30 bg-sky-950/40' },
  clarification: { label: 'Isabella necesita más contexto para continuar', color: 'text-purple-300 border-purple-500/30 bg-purple-950/40' },
};

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `sesion-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function TracePanel({ decision, traceId }: { decision?: IsabellaDecision; traceId?: string }) {
  const [open, setOpen] = useState(false);
  if (!decision) return null;

  const policy = policyLabels[decision.policyStatus] ?? {
    label: decision.policyStatus,
    color: 'text-slate-300 border-slate-600/40 bg-slate-900/60',
  };
  const engineOrder: EngineName[] = ['ORION', 'SOPHIA', 'ARGUS', 'MNEMOS', 'LUMEN', 'KERNEL', 'TOPOLOGY'];

  return (
    <div className="mt-2.5 rounded-xl border border-white/10 bg-slate-950/70 overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-2.5 flex items-center justify-between text-[10px] font-mono text-cyan-300 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5" />
          Traza cognitiva del Nodo Cero
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="p-3 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] font-mono px-2 py-1 rounded-md border ${policy.color}`}>
              Política: {policy.label}
            </span>
            <span className={`text-[9px] font-mono px-2 py-1 rounded-md border border-white/10 ${riskColors[decision.riskLevel] ?? 'text-slate-300'}`}>
              Riesgo: {decision.riskLevel}
            </span>
            <span className="text-[9px] font-mono px-2 py-1 rounded-md border border-white/10 text-slate-300">
              Confianza: {Math.round(decision.confidence * 100)}%
            </span>
          </div>

          <div>
            <div className="text-[9px] font-mono text-[#93a5ad] uppercase tracking-widest mb-1.5">Motores cognitivos</div>
            <div className="flex flex-wrap gap-1">
              {engineOrder.map(engine => (
                <span
                  key={engine}
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border transition-colors ${
                    decision.engines.includes(engine)
                      ? 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60'
                      : 'text-slate-600 border-slate-800'
                  }`}
                >
                  {engine}
                </span>
              ))}
            </div>
          </div>

          {decision.toolCalls.length > 0 && (
            <div>
              <div className="text-[9px] font-mono text-[#93a5ad] uppercase tracking-widest mb-1.5">Herramientas ejecutadas</div>
              <div className="space-y-1">
                {decision.toolCalls.map((call: IsabellaToolCall) => (
                  <div key={call.id} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Wrench className="w-3 h-3 text-[#d97832]" />
                      {call.tool}
                    </span>
                    <span className={call.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                      {call.status} {call.durationMs ? `· ${call.durationMs}ms` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {decision.sources && decision.sources.length > 0 && (
            <div>
              <div className="text-[9px] font-mono text-[#93a5ad] uppercase tracking-widest mb-1.5">Fuentes del territorio</div>
              <div className="space-y-1">
                {decision.sources.slice(0, 3).map((source, idx) => (
                  <p key={idx} className="text-[10px] font-mono text-slate-300 flex items-start gap-1.5">
                    <Fingerprint className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                    {source}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="text-[9px] font-mono text-[#93a5ad] flex items-center gap-1.5 pt-1 border-t border-white/5">
            <Fingerprint className="w-3 h-3 text-purple-400" />
            trace_id: {traceId ?? 'n/d'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IsabellaChat({ isOpen, onClose, initialPrompt }: IsabellaChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'isabella',
      text: '¡Saludos! Soy Isabella Villaseñor AI, núcleo cognitivo gobernado del Nodo Cero (YUN-01). Percibo, recuerdo, decido, actúo y audito cada consulta bajo la Constitución YUN. ¿En qué te asisto hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [lastTraceId, setLastTraceId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  const presets = [
    '¿Qué es la Arquitectura Heptafederada YUN?',
    'Recomiéndame una ruta de minas y pastes en RDM',
    '¿Cuándo es la Feria del Paste y la Semana Cornish?',
    'Dame un dicho tradicional de Real del Monte',
    '¿Cómo funciona la Criptografía Post-Cuántica Dilithium?',
  ];

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setStageIndex(i => (i + 1) % PIPELINE_STAGES.length), 650);
    return () => clearInterval(timer);
  }, [loading]);

  const handleSend = useCallback(async (textToSend?: string) => {
    const promptText = (textToSend ?? input).trim();
    if (!promptText || loading) return;

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);
    setStageIndex(0);

    const traceId = `trace-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const requestId = createRequestId();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      const res = await fetch('/api/isabella', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: promptText,
          sessionId: getSessionId(),
          traceId,
          requestId,
          context: {
            territory: 'Real del Monte, Hidalgo, México',
            status: 'Optimal',
            pois: 15,
            nodes: 35,
            geosite: 'Geoparque Mundial UNESCO Comarca Minera',
            altitude: 2710,
            center: [20.1398, -98.6738],
            federationId: 'Fed1',
            domain: 'knowledge',
          },
        }),
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Isabella respondió con estado ${res.status}`);
      }

      const data = await res.json();

      const aiMsg: Message = {
        id: `${Date.now()}-isa`,
        sender: 'isabella',
        text: data.text || data.content || 'Isabella AI ha procesado la solicitud con éxito.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        decision: data.decision,
        traceId: data.traceId ?? traceId,
        responseMode: data.responseMode,
      };

      setLastTraceId(aiMsg.traceId);
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('isabella.chat.request_failed', err);
      const fallbackMsg: Message = {
        id: `${Date.now()}-fallback`,
        sender: 'isabella',
        text: 'Isabella no pudo completar esta solicitud en este momento. El gemelo digital del Nodo Cero sigue sincronizado; inténtalo de nuevo en unos segundos.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        traceId,
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  useEffect(() => {
    if (messagesEndRef.current && nearBottomRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    nearBottomRef.current = distance < 140;
  };

  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  useEffect(() => {
    if (initialPrompt) {
      const timer = setTimeout(() => handleSendRef.current(initialPrompt), 50);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg h-[640px] glass-panel rounded-2xl border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="relative p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/90 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-[#d97832] p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 tracking-tight">
              Isabella Villaseñor AI
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Núcleo Cognitivo YUN-01 · Gobernado por la Constitución
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          {lastTraceId && (
            <span className="hidden sm:flex text-[9px] font-mono text-purple-300 items-center gap-1 px-2 py-1 rounded-md border border-purple-500/20 bg-purple-950/30">
              <Fingerprint className="w-3 h-3" />
              {lastTraceId.slice(0, 12)}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#93a5ad] hover:text-white transition-colors"
            aria-label="Cerrar chat de Isabella"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cuerpo de mensajes */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50" onScroll={handleScroll}>
        {messages.map(msg => {
          const banner = msg.responseMode ? responseModeBanner[msg.responseMode] : undefined;

          return (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : msg.isError
                      ? 'bg-rose-950 border border-rose-500/40 text-rose-300'
                      : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : msg.isError ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-purple-900/40 text-purple-100 border border-purple-500/30 rounded-tr-none'
                    : msg.isError
                      ? 'bg-rose-950/30 text-rose-100 border border-rose-500/30 rounded-tl-none'
                      : 'bg-white/[0.05] text-[#c9d0d4] border border-cyan-500/30 rounded-tl-none shadow-md'
                }`}
              >
                {banner && (
                  <div className={`mb-2 text-[9px] font-mono px-2 py-1 rounded-md border ${banner.color}`}>
                    {banner.label}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.sender === 'isabella' && msg.decision && (
                  <TracePanel decision={msg.decision} traceId={msg.traceId} />
                )}
                <div className={`text-[9px] font-mono mt-1.5 text-right ${msg.sender === 'user' ? 'text-purple-300' : 'text-[#93a5ad]'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Isabella · {PIPELINE_STAGES[stageIndex]}</span>
            <span className="flex gap-1">
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Franja de estado cognitivo */}
      <div className="px-4 py-1.5 bg-slate-950/90 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-[#93a5ad]">
        <span className="flex items-center gap-1">
          <BrainCircuit className="w-3 h-3 text-cyan-400" />
          Ciclo: Perceive → Remember → Decide → Act → Audit
        </span>
        <span className="hidden sm:flex items-center gap-1">
          <Gauge className="w-3 h-3 text-emerald-400" />
          Gobernanza activa
        </span>
      </div>

      {/* Atajos sugeridos */}
      <div className="px-4 py-2 border-t border-white/5 bg-slate-950/80 overflow-x-auto flex gap-2 no-scrollbar">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(preset)}
            disabled={loading}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-cyan-400 text-[10px] text-cyan-300 hover:text-white transition-colors whitespace-nowrap disabled:opacity-40"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Barra de entrada */}
      <div className="p-3 border-t border-white/10 bg-slate-950 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu consulta a Isabella AI..."
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#93a5ad] focus:outline-none transition-colors disabled:opacity-60"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-50 hover:opacity-90 transition-opacity shadow-md"
          aria-label="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
