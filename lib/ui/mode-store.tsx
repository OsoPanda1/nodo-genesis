"use client";

/* ================================================================== */
/* MODE STORE — Estado global del Switch Turístico / Territorio        */
/* ================================================================== */
/* Contexto de React que expone el modo activo del Nodo Cero y lo      */
/* sincroniza con el atributo data-mode del documento raíz para que    */
/* Tailwind / CSS variables apliquen el tema contextual.               */
/* ================================================================== */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Mode = 'tourist' | 'territory';

export interface ModeState {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeState | null>(null);

const MODE_STORAGE_KEY = 'rdm-mode';

function storedMode(): Mode {
  if (typeof window === 'undefined') return 'tourist';
  const saved = window.localStorage.getItem(MODE_STORAGE_KEY);
  return saved === 'territory' ? 'territory' : 'tourist';
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>(storedMode);

  /* Sincroniza el tema con el documento raíz y la preferencia. */
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    document.documentElement.classList.toggle('mode-territory', mode === 'territory');
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'tourist' ? 'territory' : 'tourist'));
  }, []);

  const value = useMemo<ModeState>(() => ({ mode, toggleMode, setMode }), [mode, toggleMode, setMode]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode(): ModeState {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode debe usarse dentro de <ModeProvider>');
  return ctx;
}
