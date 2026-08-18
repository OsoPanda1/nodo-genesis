"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Sparkles, ShieldCheck, Cpu, Radio, Volume2, VolumeX, ArrowRight } from 'lucide-react';

interface CrystalHero3DProps {
  onOpenIsabella: () => void;
  onSelectNode: (nodeId: string) => void;
}

/* Paleta RDM para el cristal: platino, oro, azul eléctrico y petróleo. */
const CORE_COLORS = [0x2e9cff, 0xf2cc76, 0xd97832, 0x3f9b78, 0x0d4652, 0xc9d0d4, 0xc89a45];

export default function CrystalHero3D({ onOpenIsabella, onSelectNode }: CrystalHero3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  );

  useEffect(() => {
    if (!showTrailerModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTrailerModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTrailerModal]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 1.5, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Iluminación de galería: luz suave de estudio + acentos de metal noble.
    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const goldLight = new THREE.PointLight(0xf2cc76, 3.4, 22);
    goldLight.position.set(-3, 2, 3);
    scene.add(goldLight);

    const blueLight = new THREE.PointLight(0x2e9cff, 2.8, 22);
    blueLight.position.set(3, -2, 4);
    scene.add(blueLight);

    // Cristal principal — cuarzo translúcido con alma de plata.
    const geometry = new THREE.IcosahedronGeometry(1.8, 1);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xd8e8f2,
      metalness: 0.45,
      roughness: 0.06,
      transmission: 0.9,
      ior: 1.55,
      thickness: 1.2,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.4,
    });
    const crystalMesh = new THREE.Mesh(geometry, material);
    scene.add(crystalMesh);

    // Holograma exterior — malla de platino.
    const wireGeo = new THREE.IcosahedronGeometry(2.3, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf2cc76,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Anillos orbitales (7 núcleos heptafederados).
    const ringGeo = new THREE.TorusGeometry(3.1, 0.008, 8, 128);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9d0d4, transparent: true, opacity: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.6;
    scene.add(ring);

    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const satGeo = new THREE.OctahedronGeometry(0.2, 0);
      const satMat = new THREE.MeshStandardMaterial({
        color: CORE_COLORS[i],
        emissive: CORE_COLORS[i],
        emissiveIntensity: 0.55,
        roughness: 0.18,
        metalness: 0.6,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satellites.push(satMesh);
      scene.add(satMesh);
    }

    // Partículas flotantes — polvo de oro y plata (densidad baja).
    const particlesCount = 140;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 16;
      posArray[i + 1] = (Math.random() - 0.5) * 14;
      posArray[i + 2] = (Math.random() - 0.5) * 16;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.038,
      color: 0xf2cc76,
      transparent: true,
      opacity: 0.5,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    let animationFrameId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      if (!reducedMotion) {
        crystalMesh.rotation.x = t * 0.12;
        crystalMesh.rotation.y = t * 0.22;
        wireMesh.rotation.x = -t * 0.08;
        wireMesh.rotation.y = -t * 0.16;
        ring.rotation.z = t * 0.1;
        satellites.forEach((sat, idx) => {
          const angle = t * 0.4 + (idx * Math.PI * 2) / 7;
          sat.position.x = Math.cos(angle) * 3.1;
          sat.position.z = Math.sin(angle) * 3.1;
          sat.position.y = Math.sin(t * 1.3 + idx) * 0.7;
          sat.rotation.x += 0.02;
          sat.rotation.y += 0.03;
        });
        particlesMesh.rotation.y = t * 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [reducedMotion]);

  return (
    <div className="relative w-full overflow-hidden bg-[radial-gradient(120%_120%_at_70%_-10%,#ffffff_0%,#ecefea_42%,#d9e2e4_100%)] border-b border-[#c9d0d4]/80">
      {/* Malla territorial sutil y brillos del gradiente core */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.5] bg-[linear-gradient(to_right,#c9d0d4_1px,transparent_1px),linear-gradient(to_bottom,#c9d0d4_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" />
      <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(46,156,255,0.18),transparent_65%)] pointer-events-none" />
      <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(217,120,50,0.14),transparent_65%)] pointer-events-none" />

      {/* Lienzo 3D de cristal */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Capa de contenido */}
      <div className="relative z-10 mx-auto flex h-[88vh] min-h-[620px] max-w-7xl flex-col justify-between px-6 py-10 pointer-events-none">
        {/* Barra superior de sellos */}
        <div className="flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
          <div className="crystal-badge">
            <span className="w-2 h-2 rounded-full bg-[#3f9b78] animate-ping" />
            <Radio className="w-3.5 h-3.5 text-[#0d4652]" />
            <span>Nodo Cero // Real del Monte // YUN</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTrailerModal(true)}
              className="crystal-button crystal-button-ghost px-4 py-2 text-xs font-semibold"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Trailer AAA 4K</span>
            </button>
            <div className="hidden sm:inline-flex crystal-badge">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0d4652]" />
              <span>Cripto Post-Cuántica</span>
            </div>
          </div>
        </div>

        {/* Mensaje central */}
        <div className="my-auto max-w-3xl pointer-events-auto">
          <div className="crystal-badge mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#d97832]" />
            <span>Sistema de Inteligencia Territorial Soberano</span>
          </div>

          <p className="font-rdm-mono text-[11px] tracking-[0.3em] uppercase text-[#536b86] mb-3">
            El territorio también piensa
          </p>

          <h1 className="font-editorial text-5xl sm:text-7xl md:text-[5.5rem] font-semibold leading-[0.95] tracking-tight text-[#082f3b]">
            RDM Digital
            <br />
            <span className="rdm-metallic-text">Nodo Cero</span>
          </h1>

          <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#283038] font-light">
            Descubre Real del Monte a través de su historia, sus personas, sus experiencias y una
            nueva generación de{' '}
            <strong className="font-semibold text-[#0d4652]">inteligencia territorial</strong>:
            patrimonio minero, cristal contemporáneo y gobernanza soberana.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onSelectNode('node-10')}
              className="crystal-button px-7 py-3.5 text-sm font-bold"
            >
              <span>Explorar RDM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenIsabella}
              className="crystal-button crystal-button-ghost px-7 py-3.5 text-sm font-semibold"
            >
              <Cpu className="w-4 h-4 text-[#0d4652]" />
              <span>Conocer la plataforma</span>
            </button>
            <button
              onClick={onOpenIsabella}
              className="crystal-button crystal-button-gold px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Isabella AI</span>
            </button>
          </div>
        </div>

        {/* Telemetría — cápsulas de cristal */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pointer-events-auto">
          <div className="stat-pill">
            <span className="stat-pill-dot text-[#3f9b78] bg-[#3f9b78]" />
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[#536b86] font-rdm-mono">
                Clima en el Monte
              </div>
              <div className="text-sm font-bold text-[#082f3b]">13.8°C // Niebla 88%</div>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-dot text-[#2e9cff] bg-[#2e9cff]" />
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[#536b86] font-rdm-mono">
                Isabella AI
              </div>
              <div className="text-sm font-bold text-[#082f3b]">En Línea // 14ms</div>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-dot text-[#d97832] bg-[#d97832]" />
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[#536b86] font-rdm-mono">
                Pastelerías
              </div>
              <div className="text-sm font-bold text-[#082f3b]">18 RDM Certificadas</div>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-dot text-[#0d4652] bg-[#0d4652]" />
            <div>
              <div className="text-[9px] uppercase tracking-widest text-[#536b86] font-rdm-mono">
                Nodos YUN
              </div>
              <div className="text-sm font-bold text-[#082f3b]">35 / 35 Operativos</div>
            </div>
          </div>
        </div>

        {/* Indicador de desplazamiento — anillo orbital */}
        <div className="pointer-events-none flex justify-center pt-4">
          <span className="rdm-orbital" />
        </div>
      </div>

      {/* Trailer AAA Video Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082f3b]/85 backdrop-blur-xl">
          <div className="relative w-full max-w-5xl rounded-2xl border border-[#c9d0d4]/80 bg-[#fffdf5]/95 p-4 shadow-[0_30px_80px_rgba(8,47,59,0.5)]">
            <div className="flex items-center justify-between border-b border-[#c9d0d4]/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d97832] animate-ping" />
                <h3 className="font-patrimonial text-base font-bold text-[#082f3b] tracking-wide">
                  TRAILER AAA // REAL DEL MONTE - NODO CERO 4K
                </h3>
              </div>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="rounded-lg border border-[#c9d0d4]/70 px-3 py-1 text-xs font-rdm-mono text-[#a9481e] hover:bg-white/60 transition-all"
              >
                Cerrar [ESC]
              </button>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#c9d0d4]/60 bg-gradient-to-tr from-[#0d4652] via-[#536b86] to-[#d97832] flex items-center justify-center group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,204,118,0.22),transparent_65%)] animate-pulse-glow" />

              <div className="relative z-10 max-w-2xl p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#c9d0d4] to-[#f2cc76] p-0.5 shadow-[0_0_34px_rgba(242,204,118,0.7)]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#082f3b]">
                    <Sparkles className="h-8 w-8 text-[#f2cc76] animate-spin" />
                  </div>
                </div>

                <h4 className="font-patrimonial text-2xl font-bold text-white uppercase tracking-wide mb-2">
                  Experiencia Territorial Cinemática
                </h4>
                <p className="mb-6 text-sm font-light text-[#eef2f2]">
                  Inmersión fotogramétrica en la cuna de la minería de plata, el Panteón Inglés, la
                  niebla dorada de la sierra y el legado gastronómico del Paste Cornish.
                </p>

                <div className="inline-flex items-center gap-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-full border border-white/30 bg-white/10 p-3 text-white hover:bg-white/20 transition-all"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div className="rounded-full border border-white/30 bg-white/10 px-4 py-2 font-rdm-mono text-xs text-[#f2cc76]">
                    4K HDR // 60 FPS // Dolby Atmos 8D
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.8)_51%)] bg-[size:100%_4px]" />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-rdm-mono text-[#536b86]">
              <span>Producción: RDM Digital Hub & YUN Media Node</span>
              <span>Ubicación: Real del Monte, Hidalgo, México</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
