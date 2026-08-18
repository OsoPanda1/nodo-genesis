import { useCallback, useRef, useState } from "react";

interface AudioQueueItem {
  soundUrl: string;
  volume: number;
  priority: "low" | "normal" | "high";
}

const PLAY_INTERVAL_MS = 300;

export function useNotificationAudio() {
  const [muted, setMuted] = useState(false);
  const queueRef = useRef<AudioQueueItem[]>([]);
  const playingRef = useRef(false);
  const lastPlayedRef = useRef<Record<string, number>>({});

  const playFromQueue = useCallback(async () => {
    if (playingRef.current || queueRef.current.length === 0) return;
    playingRef.current = true;

    const item = queueRef.current.shift()!;
    try {
      const audio = new Audio(item.soundUrl);
      audio.volume = item.volume;
      await audio.play();
      await new Promise((resolve) => {
        audio.onended = resolve;
      });
    } catch {
      // fallo silencioso — audio bloqueado por navegador o ruta inválida
    }

    await new Promise((r) => setTimeout(r, PLAY_INTERVAL_MS));
    playingRef.current = false;
    playFromQueue();
  }, []);

  const play = useCallback(
    (soundUrl: string, options?: { volume?: number; priority?: "low" | "normal" | "high"; soundId?: string }) => {
      if (muted) return;

      const volume = options?.volume ?? 0.6;
      const priority = options?.priority ?? "normal";
      const soundId = options?.soundId;

      if (soundId) {
        const lastPlayed = lastPlayedRef.current[soundId] ?? 0;
        const now = Date.now();
        if (now - lastPlayed < 1000) return;
        lastPlayedRef.current[soundId] = now;
      }

      const item: AudioQueueItem = { soundUrl, volume, priority };

      if (priority === "high") {
        queueRef.current.unshift(item);
      } else {
        queueRef.current.push(item);
      }

      playFromQueue();
    },
    [muted, playFromQueue],
  );

  const playSound = useCallback(
    (soundUrl: string, soundId?: string) => {
      play(soundUrl, { soundId });
    },
    [play],
  );

  return { play, playSound, muted, setMuted };
}
