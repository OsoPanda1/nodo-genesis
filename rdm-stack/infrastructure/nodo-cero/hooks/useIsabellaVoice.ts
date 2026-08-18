'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type IsabellaLocalVoiceState =
  | 'idle'
  | 'speaking'
  | 'paused'
  | 'unsupported';

function chooseMexicanVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const entries = voices.map((voice) => ({
    voice,
    lang: voice.lang.toLowerCase(),
  }));

  return (
    entries.find(({ lang }) => lang === 'es-mx')?.voice ??
    entries.find(({ lang }) => lang.startsWith('es-mx'))?.voice ??
    entries.find(({ lang }) => lang.startsWith('es'))?.voice ??
    null
  );
}

function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function useIsabellaVoice() {
  const [state, setState] = useState<IsabellaLocalVoiceState>(() =>
    isSpeechSynthesisSupported() ? 'idle' : 'unsupported',
  );
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return;

    const load = () => {
      setVoice(chooseMexicanVoice(window.speechSynthesis.getVoices()));
    };

    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setState('idle');
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!text.trim() || !('speechSynthesis' in window)) return false;

      cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.rate = 0.94;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (voice) utterance.voice = voice;

      utterance.onstart = () => setState('speaking');
      utterance.onend = () => {
        utteranceRef.current = null;
        setState('idle');
        onEnd?.();
      };
      utterance.onerror = () => {
        utteranceRef.current = null;
        setState('idle');
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

      return true;
    },
    [cancel, voice],
  );

  return {
    state,
    isSupported: state !== 'unsupported',
    selectedVoice: voice?.name ?? null,
    speak,
    cancel,
    pause: () => {
      window.speechSynthesis?.pause();
      setState('paused');
    },
    resume: () => {
      window.speechSynthesis?.resume();
      setState('speaking');
    },
  };
}
