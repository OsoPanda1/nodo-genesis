'use client';

/* ------------------------------------------------------------------ */
/* ZOMBIE SPRITE — Silueta SVG procedimental con aura y estados        */
/* ------------------------------------------------------------------ */
/* Sprite vectorial por arquitectura: gradientes, heridas luminosas,   */
/* ojos brillantes con parpadeo, garra con garras y sello de captura   */
/* giratorio. Si el arquetipo define media (video/imagen) se usa esa   */
/* y se degrada a la silueta solo si falla la carga.                   */
/* ------------------------------------------------------------------ */

import { useState } from 'react';
import { ZombieArchetype } from '@/lib/data/zombies-data';

type SpriteState = 'idle' | 'hurt' | 'dodge' | 'captured';

const STATE_CLASS: Record<SpriteState, string> = {
  idle: 'zr-idle',
  hurt: 'zr-hurt',
  dodge: 'zr-dodge',
  captured: 'zr-captured',
};

const STYLE = `
@keyframes zr-limpL { 0%,100% { transform: rotate(9deg); } 50% { transform: rotate(-16deg); } }
@keyframes zr-limpR { 0%,100% { transform: rotate(-9deg); } 50% { transform: rotate(16deg); } }
@keyframes zr-sway  { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-4px) rotate(2deg); } }
@keyframes zr-hurt  { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes zr-dodge { 0%,100% { transform: rotate(0) translateX(0); } 50% { transform: rotate(-20deg) translateX(-10px); } }
@keyframes zr-captured { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes zr-eyeBlink { 0%, 90%, 100% { transform: scaleY(1); } 93%, 96% { transform: scaleY(.1); } }
@keyframes zr-eyeGlow { 0%,100% { opacity:.65; } 50% { opacity:1; } }
@keyframes zr-woundGlow { 0%,100% { opacity:.3; } 50% { opacity:.85; } }
@keyframes zr-shadowSquish { 0%,100% { transform: scale(1); opacity:.5; } 50% { transform: scale(.82); opacity:.32; } }
@keyframes zr-captured-ring { 0% { transform: rotate(0deg); opacity:0; } 25% { opacity:.9; } 100% { transform: rotate(360deg); opacity:.9; } }
@keyframes zr-mist { 0%,100% { transform: translateX(-5px); opacity:.45; } 50% { transform: translateX(5px); opacity:1; } }
.zr-idle .zr-root, .zr-hurt .zr-root, .zr-dodge .zr-root, .zr-captured .zr-root { transform-box: fill-box; transform-origin: 50% 100%; }
.zr-idle .zr-body { animation: zr-sway 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
.zr-idle .zr-arm-l { animation: zr-limpL 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: top right; }
.zr-idle .zr-arm-r { animation: zr-limpR 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: top left; }
.zr-idle .zr-leg-l { animation: zr-limpR 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom right; }
.zr-idle .zr-leg-r { animation: zr-limpL 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom left; }
.zr-hurt .zr-root { animation: zr-hurt 0.45s linear infinite; }
.zr-dodge .zr-root { animation: zr-dodge 0.5s ease-in-out; }
.zr-captured .zr-root { animation: zr-captured 1s ease-in-out infinite; }
.zr-eye { transform-box: fill-box; transform-origin: center; animation: zr-eyeBlink 3.4s ease-in-out infinite; }
.zr-eye-glow { animation: zr-eyeGlow 2.6s ease-in-out infinite; }
.zr-wound { animation: zr-woundGlow 2.2s ease-in-out infinite; }
.zr-shadow { transform-box: fill-box; transform-origin: center; animation: zr-shadowSquish 2.2s ease-in-out infinite; }
.zr-captured-ring { transform-box: fill-box; transform-origin: center; animation: zr-captured-ring 1.6s linear infinite; }
.zr-mist { animation: zr-mist 3.2s ease-in-out infinite; }
`;

interface ZombieSpriteProps {
  archetype: ZombieArchetype;
  size?: number;
  state?: SpriteState;
  className?: string;
}

export default function ZombieSprite({ archetype, size = 160, state = 'idle', className }: ZombieSpriteProps) {
  const [mediaError, setMediaError] = useState(false);
  const accent = archetype.color;
  const gid = `zr-g-${archetype.id}`;

  const renderMedia = !mediaError && (archetype.spriteVideo || archetype.sprite);

  return (
    <div className={`relative inline-block select-none ${className ?? ''}`} style={{ width: size, height: size * 1.25 }}>
      <style>{STYLE}</style>
      {renderMedia ? (
        archetype.spriteVideo ? (
          <video
            src={archetype.spriteVideo}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setMediaError(true)}
            className="w-full h-full object-contain"
            style={{ filter: `drop-shadow(0 0 14px ${accent}66)` }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={archetype.sprite}
            alt={archetype.name}
            onError={() => setMediaError(true)}
            className="w-full h-full object-contain"
            style={{ filter: `drop-shadow(0 0 14px ${accent}66)` }}
          />
        )
      ) : (
        <svg viewBox="0 0 120 160" className={STATE_CLASS[state]} style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity="0.6" />
              <stop offset="1" stopColor={accent} stopOpacity="0.15" />
            </linearGradient>
          </defs>

          <ellipse cx="60" cy="150" rx="34" ry="7" fill="rgba(0,0,0,0.5)" className="zr-shadow" />

          <g className="zr-root">
            <g className="zr-body">
              <ellipse cx="60" cy="102" rx="26" ry="30" fill={`url(#${gid})`} stroke={accent} strokeWidth="3" />
              <path
                d="M46 92 L40 104 L47 102 L42 116 L52 110 L56 124 L64 110 L70 124 L78 112 L82 118 L74 104 L80 96 Z"
                fill={accent}
                opacity="0.25"
              />
              <path d="M38 96 Q34 100 38 104" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.4" />
              <path d="M82 96 Q86 100 82 104" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.4" />
              <path d="M46 120 L74 120" stroke={accent} strokeWidth="1.5" opacity="0.45" />
              <circle cx="60" cy="106" r="6" fill="#ff5f56" opacity="0.5" className="zr-wound" style={{ filter: `drop-shadow(0 0 6px #ff5f56)` }} />
            </g>

            <g className="zr-arm-l">
              <path d="M42 88 L26 114 L18 130" stroke={accent} strokeWidth="7" strokeLinecap="round" fill="none" />
              <circle cx="27" cy="111" r="4.5" fill={accent} opacity="0.5" />
              <circle cx="18" cy="133" r="5.5" fill={`${accent}88`} />
              <path d="M14 137 l-2 7 M18 138 l0 7 M22 137 l2 7" stroke="#d9d9d9" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g className="zr-arm-r">
              <path d="M78 88 L94 114 L102 130" stroke={accent} strokeWidth="7" strokeLinecap="round" fill="none" />
              <circle cx="93" cy="111" r="4.5" fill={accent} opacity="0.5" />
              <circle cx="102" cy="133" r="5.5" fill={`${accent}88`} />
              <path d="M98 137 l-2 7 M102 138 l0 7 M106 137 l2 7" stroke="#d9d9d9" strokeWidth="2" strokeLinecap="round" />
            </g>

            <g className="zr-leg-l">
              <path d="M50 120 L42 139" stroke={accent} strokeWidth="9" strokeLinecap="round" />
              <path d="M36 146 L48 146 L46 155 L34 155 Z" fill={`${accent}77`} stroke={accent} strokeWidth="1.5" />
            </g>
            <g className="zr-leg-r">
              <path d="M70 120 L78 139" stroke={accent} strokeWidth="9" strokeLinecap="round" />
              <path d="M72 146 L84 146 L86 155 L74 155 Z" fill={`${accent}77`} stroke={accent} strokeWidth="1.5" />
            </g>

            <g className="zr-head">
              <circle cx="60" cy="58" r="23" fill={`url(#${gid})`} stroke={accent} strokeWidth="3" />
              <path d="M40 66 Q48 74 58 70" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.3" />
              <path d="M52 78 Q60 84 68 78" stroke={accent} strokeWidth="2.5" fill="none" />
              <path d="M54 78 Q60 82 66 78" stroke="#e8e8e8" strokeWidth="1.5" strokeDasharray="2 3" fill="none" />
              <path d="M58 58 L60 54 L62 58" stroke={accent} strokeWidth="1.5" fill="none" />
              <circle cx="37" cy="58" r="4" fill={accent} opacity="0.7" />
              <circle cx="83" cy="58" r="4" fill={accent} opacity="0.7" />
              <circle cx="50" cy="52" r="5.5" fill="#0a0a0f" />
              <circle cx="70" cy="52" r="5.5" fill="#0a0a0f" />
              <circle cx="50" cy="52" r="3" fill="#ff5f56" className="zr-eye" style={{ filter: 'drop-shadow(0 0 6px #ff5f56)' }} />
              <circle cx="70" cy="52" r="3" fill="#ff5f56" className="zr-eye" style={{ filter: 'drop-shadow(0 0 6px #ff5f56)' }} />
              <circle cx="51" cy="50" r="1" fill="#ffffff" opacity="0.9" />
              <circle cx="71" cy="50" r="1" fill="#ffffff" opacity="0.9" />
              <path d="M44 44 L60 48" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
              <path d="M40 40 Q48 30 60 34 Q72 30 80 40 Q70 40 60 42 Q50 40 40 40 Z" fill={accent} opacity="0.6" />
            </g>

            {archetype.type === 'minero' && (
              <g>
                <path d="M40 36 L45 22 L75 22 L80 36 Z" fill={`${accent}77`} stroke={accent} strokeWidth="2" />
                <line x1="60" y1="22" x2="60" y2="32" stroke={accent} strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="60" cy="34" r="2.5" fill="#fde68a" className="zr-eye-glow" style={{ filter: 'drop-shadow(0 0 6px #fde68a)' }} />
              </g>
            )}
            {archetype.type === 'espectro' && (
              <g className="zr-mist">
                <path d="M34 54 Q60 18 86 54 L86 66 L34 66 Z" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="4 4" />
              </g>
            )}
            {archetype.type === 'leyenda' && (
              <g>
                <path d="M30 130 L90 130 L86 156 L34 156 Z" fill={`${accent}22`} stroke={accent} strokeWidth="2" />
                <path d="M35 96 Q60 84 85 96" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="60" cy="96" r="6" fill={accent} className="zr-eye-glow" />
              </g>
            )}

            {state === 'captured' && (
              <g className="zr-captured-ring">
                <circle cx="60" cy="150" r="34" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="10 6" />
                <circle cx="60" cy="150" r="22" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="3 5" opacity="0.6" />
              </g>
            )}
          </g>
        </svg>
      )}
    </div>
  );
}
