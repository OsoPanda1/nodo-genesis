export const RDM_PALETTE = {
  bgDeep0: '#020617',
  bgDeep1: '#0a0b0e',
  gold: '#c8a356',
  goldLight: '#d4b26a',
  goldDark: '#b8944c',
  goldAmber: '#facc15',
  terracotta: '#b85c3c',
  navy: '#1e3a5f',
  silver: '#9ca3af',
  cream: '#f5f0e8',
  emerald: '#10b981',
  neblina: '#38bdf8',
  riskRed: '#b91c1c',
  textPrimary: '#eef2f7',
  textMuted: '#9ca3af',
} as const;

export type RDMColor = keyof typeof RDM_PALETTE;

export const RDM_FONTS = {
  display: 'Playfair Display',
  sans: 'DM Sans',
} as const;

export const RDM_MOTION = {
  durationFast: 150,
  durationBase: 250,
  durationSlow: 400,
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  radiusPanel: '1rem',
  radiusCard: '0.75rem',
} as const;

export const RDM_CHAT = {
  user: RDM_PALETTE.goldAmber,
  isabella: '#6d28d9',
} as const;

export function rdmColor(role: 'ok' | 'warn' | 'risk' | 'info'): string {
  switch (role) {
    case 'ok':
      return RDM_PALETTE.emerald;
    case 'warn':
      return RDM_PALETTE.goldAmber;
    case 'risk':
      return RDM_PALETTE.riskRed;
    default:
      return RDM_PALETTE.neblina;
  }
}
