"use client";

/* ------------------------------------------------------------------ */
/* MAPA 3D — GEMELO DIGITAL TERRESTRE                                  */
/* Terreno 3D con iluminación espacial, marcadores luminosos y órbita  */
/* libre. Degrada a una lista de nodos cuando WebGL no está disponible */
/* y aísla cualquier fallo con la barrera de errores.                   */
/* ------------------------------------------------------------------ */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Color, PlaneGeometry, ShaderMaterial, type Mesh } from "three";

const GEO_LNG_OFFSET = 98.6732;
const GEO_LAT_OFFSET = 20.1374;
const GEO_COORD_SCALE = 160;

export type MarkerType = "place" | "business";

export interface MapMarkerData {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  type: MarkerType;
  isPremium?: boolean;
}

export interface MapViewportState {
  lat: number;
  lng: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export const DEFAULT_MAP_VIEWPORT: MapViewportState = {
  lat: 20.1374,
  lng: -98.6732,
  zoom: 14,
  bearing: 0,
  pitch: 40,
};

interface Map3DTwinProps {
  viewport: MapViewportState;
  markers: MapMarkerData[];
  onViewportChange: (next: Partial<MapViewportState>) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  mina: "#c8a356",
  cultura: "#38bdf8",
  gastronomia: "#f59e0b",
  naturaleza: "#34d399",
  plateria: "#e2e8f0",
  hotel: "#a78bfa",
};

function isWebGLAvailable() {
  if (typeof window === "undefined") return false;
  const canvas = document.createElement("canvas");
  const contexts = ["webgl2", "webgl", "experimental-webgl"] as const;
  return contexts.some((contextName) => {
    try {
      return Boolean(canvas.getContext(contextName));
    } catch {
      return false;
    }
  });
}

function TerrainPlate() {
  const geom = useMemo(() => {
    const geometry = new PlaneGeometry(18, 18, 140, 140);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const d = Math.sqrt(x * x + y * y);
      const wave = Math.sin(x * 0.55) * 0.3 + Math.cos(y * 0.6) * 0.22;
      const ridge = Math.exp(-Math.pow((d - 4.2) / 2.4, 2)) * 0.5;
      const noise = Math.sin((x + y) * 1.35) * 0.14;
      positions.setZ(i, wave + ridge + noise);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <group rotation-x={-Math.PI / 2.6}>
      <mesh geometry={geom} receiveShadow castShadow>
        <meshStandardMaterial
          color="#233a4a"
          metalness={0.05}
          roughness={0.92}
          emissive="#142636"
          emissiveIntensity={0.22}
        />
      </mesh>
    </group>
  );
}

function MarkerPins({ points }: { points: MapMarkerData[] }) {
  return (
    <group rotation-x={-Math.PI / 2.6}>
      {points.map((point) => {
        const color = CATEGORY_COLORS[point.category] ?? "#38bdf8";
        const x = (point.lng + GEO_LNG_OFFSET) * GEO_COORD_SCALE;
        const z = -(point.lat - GEO_LAT_OFFSET) * GEO_COORD_SCALE;
        return (
          <group key={point.id} position={[x, 0, z]}>
            <mesh position={[0, 0.28, 0]}>
              <sphereGeometry args={[0.09, 24, 24]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.6}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <circleGeometry args={[0.16, 32]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.28}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

const RING_UNIFORMS = { uTime: { value: 0 } };

const RING_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAGMENT_SHADER = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float pulse = 0.5 + 0.5 * sin(uTime * 0.6);
    float band = smoothstep(0.05, 0.55, vUv.y) * (1.0 - smoothstep(0.55, 0.95, vUv.y));
    float alpha = band * (0.08 + 0.06 * pulse);
    gl_FragColor = vec4(0.74, 0.8, 0.92, alpha);
  }
`;

function MistRing() {
  const meshRef = useRef<Mesh | null>(null);
  useFrame(({ clock }) => {
    const material = meshRef.current?.material as ShaderMaterial | undefined;
    if (material) material.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh ref={meshRef} position={[0, 1.35, 0]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[20, 20, 1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={RING_UNIFORMS}
        vertexShader={RING_VERTEX_SHADER}
        fragmentShader={RING_FRAGMENT_SHADER}
      />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <>
      <fogExp2 attach="fog" args={["#0d1a26", 0.028]} />
      <hemisphereLight args={["#bcd3e8", "#0c1720", 1.1]} />
      <ambientLight intensity={0.6} color="#9fb8cf" />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.6}
        color="#e8eef7"
        castShadow
      />
      <spotLight
        position={[-7, 9, -5]}
        intensity={0.9}
        angle={0.5}
        penumbra={0.6}
        color="#ffd9a0"
      />
      <Stars radius={90} depth={40} count={2200} factor={2.2} fade speed={0.35} />
    </>
  );
}

export function Map3DTwin({ viewport, markers }: Map3DTwinProps) {
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    /* La detección de WebGL es exclusiva del cliente. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebglReady(isWebGLAvailable());
  }, []);

  if (!webglReady) {
    return (
      <div className="relative flex min-h-[420px] w-full flex-col justify-between overflow-hidden rounded-3xl border border-[rgba(200,163,86,0.2)] bg-[radial-gradient(circle_at_30%_20%,rgba(200,163,86,0.12),transparent_55%),linear-gradient(180deg,#0f1b28,#0a1320)] p-6 md:h-[640px]">
        <div className="flex items-center gap-2 text-[#c8a356]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#c8a356]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.22em]">Modo híbrido degradado</span>
        </div>
        <div className="space-y-2">
          <h3 className="font-patrimonial text-2xl font-bold text-[#eef2f7]">
            Visualización 3D no disponible
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-slate-400">
            Este entorno no expone WebGL. Se mantiene la lectura territorial por nodos.
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {markers.slice(0, 6).map((marker) => (
            <div
              key={marker.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm"
            >
              <p className="text-sm font-semibold text-slate-100">{marker.name}</p>
              <p className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                {marker.category} · {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[420px] w-full overflow-hidden rounded-3xl border border-[rgba(200,163,86,0.18)] bg-[#0a1320] shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] md:h-[640px]">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_15%,rgba(120,150,180,0.16),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(200,163,86,0.12),transparent_40%)]" />
      <Canvas shadows camera={{ position: [8, 6, 8], fov: 48 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <Atmosphere />
          <TerrainPlate />
          <MarkerPins points={markers} />
          <MistRing />
          <OrbitControls
            enablePan={false}
            maxDistance={16}
            minDistance={5}
            maxPolarAngle={Math.PI / 2.12}
            minPolarAngle={Math.PI / 3.2}
            autoRotate
            autoRotateSpeed={0.22}
          />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-[11px] font-mono text-slate-300 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] animate-pulse" />
        Gemelo Digital en vivo · {viewport.lat.toFixed(4)}°, {viewport.lng.toFixed(4)}°
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex flex-wrap justify-end gap-1.5">
        {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([key, color]) => (
          <span key={key} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {key}
          </span>
        ))}
      </div>
    </div>
  );
}
