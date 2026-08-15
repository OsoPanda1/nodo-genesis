'use client';

import { useState } from 'react';
import { useIsabellaVoice } from '@/hooks/useIsabellaVoice';
import { useIsabellaAudioQueue } from '@/hooks/useIsabellaAudioQueue';

interface IsabellaVoiceControlsProps {
  text: string;
  profile?: string;
}

export function IsabellaVoiceControls({
  text,
  profile = 'isabella.default',
}: IsabellaVoiceControlsProps) {
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const { speak, cancel, isSupported } = useIsabellaVoice();
  const { enqueue, cancelAll, isPlaying } = useIsabellaAudioQueue();

  async function play() {
    setLoading(true);
    setCaption(text);

    try {
      const response = await fetch('/api/isabella/voice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text,
          profile,
          priority: 'normal',
          allowCloud: true,
          userInitiated: true,
        }),
      });

      const payload = await response.json();

      if (payload.mode === 'cloud' && payload.audioUrl) {
        enqueue({
          id: payload.requestId,
          mode: 'cloud',
          priority: 'normal',
          text: payload.normalizedText,
          audioUrl: payload.audioUrl,
        });
        return;
      }

      if (isSupported) {
        speak(payload.normalizedText ?? text);
      }
    } finally {
      setLoading(false);
    }
  }

  function stop() {
    cancelAll();
    cancel();
  }

  return (
    <section aria-label="Controles de voz de Isabella">
      <button type="button" onClick={play} disabled={loading || !text.trim()}>
        {loading ? 'Preparando voz...' : 'Escuchar a Isabella'}
      </button>

      <button type="button" onClick={stop} disabled={!isPlaying}>
        Detener
      </button>

      <p aria-live="polite">{caption}</p>
    </section>
  );
}
