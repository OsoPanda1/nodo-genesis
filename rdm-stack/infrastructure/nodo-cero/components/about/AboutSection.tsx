"use client";

import React from "react";
import {
  Users,
  Compass,
  Network,
  HeartHandshake,
  Lightbulb,
  Lock,
  Gem,
} from "lucide-react";
import { RDM_TEAM, RDM_VALUES } from "@/lib/rdm/rdm-content";

const valueIcons = [
  <Lock key="v1" className="w-5 h-5" />,
  <Lightbulb key="v2" className="w-5 h-5" />,
  <HeartHandshake key="v3" className="w-5 h-5" />,
  <Gem key="v4" className="w-5 h-5" />,
];

export default function AboutSection() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-cyan-400" />
          Quiénes somos
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Nodo Cero del RDM Digital Hub · Heptafederación YUN · TAMV Online Network
        </p>
      </header>

      {/* Manifiesto del Nodo Cero / TAMV */}
      <section className="p-6 rounded-2xl glass-panel border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-slate-950/60 space-y-4">
        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Network className="w-4 h-4" />
          Manifiesto del Nodo Cero
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-light">
          Somos una comunidad digital soberana nacida en las laderas de Real del Monte,
          Hidalgo, donde la memoria minera, la identidad local y la tecnología convergen
          para defender el derecho de un territorio a narrarse con su propia voz.
        </p>

        <p className="text-sm text-slate-200 leading-relaxed font-light">
          Este proyecto surge de más de 23 200 horas de trabajo silencioso, investigación
          autodidacta y diseño de sistemas, impulsado por un sueño que se convirtió en
          misión: construir una infraestructura capaz de proteger la historia, los datos
          y la dignidad de su pueblo frente a la dependencia de plataformas centralizadas.
        </p>

        <p className="text-sm text-slate-200 leading-relaxed font-light">
          TAMV Online Network no es solo una red, sino un ecosistema antifrágil de soberanía
          digital: una arquitectura pensada desde el Sur Global para demostrar que la
          innovación también puede nacer fuera de los centros de poder tecnológico.
        </p>

        <p className="text-sm text-slate-200 leading-relaxed font-light">
          La idea que atraviesa toda esta visión es simple y radical: la innovación nace de
          la necesidad, se forja en el dolor y sobrevive como resiliencia. Innovar no es un
          lujo; es sobrevivir, resistir y convertir la experiencia en futuro.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {[
            ["7", "Federaciones YUN"],
            ["35", "Nodos soberanos"],
            ["1", "Pueblo que no se rinde"],
          ].map(([num, label]) => (
            <div
              key={label}
              className="p-3 rounded-xl bg-slate-950/60 border border-white/10 text-center"
            >
              <div className="text-2xl font-black text-amber-400">{num}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Biografía de Edwin */}
      <section className="p-6 rounded-2xl glass-panel border border-white/15 bg-slate-950/70 space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Biografía de Edwin Oswaldo Castillo Trejo
        </h3>

        <p className="text-xs text-slate-400 font-mono">
          También conocido como Anubis Villaseñor · CEO Fundador de TAMV Online Network
        </p>

        <p className="text-sm text-slate-200 leading-relaxed font-light">
          Edwin Oswaldo Castillo Trejo, también conocido en el ámbito digital e
          investigativo como <span className="text-cyan-300 font-semibold">Anubis Villaseñor</span>,
          es un arquitecto de infraestructuras digitales soberanas, investigador
          independiente, desarrollador de sistemas y estratega tecnológico nacido y
          radicado en Real del Monte, Hidalgo, México.
        </p>

        <p className="text-sm text-slate-200 leading-relaxed font-light">
          Su trayectoria se sitúa en la intersección de la ingeniería de plataformas,
          la arquitectura federada, la gobernanza digital, la ciencia abierta y la
          descolonización de datos. Desde esa posición, sostiene que toda infraestructura
          digital contiene una política implícita, y por ello su obra busca que los datos,
          los servicios comunitarios y los procesos de gestión permanezcan bajo control de
          sus contextos de origen.
        </p>

        <p className="text-sm text-slate-200 leading-relaxed font-light">
          Como CEO Fundador y Director General de Proyectos de TAMV Online Network, ha
          construido durante años una visión de soberanía tecnológica basada en sistemas
          auditables, redes distribuidas, modelos federativos y entornos de autoalojamiento.
          Su trabajo técnico se apoya en investigación independiente, ciencia abierta y
          publicaciones vinculadas a identificadores persistentes como ORCID y DOI.
        </p>

        <p className="text-sm text-slate-200 leading-relaxed font-light">
          Más allá del código, Edwin representa una postura cultural: la defensa de una
          América Latina capaz de diseñar sus propias infraestructuras, proteger su memoria
          y convertir el dolor histórico en arquitectura de futuro. Su biografía no es solo
          la de un programador, sino la de un creador de territorio digital con raíz humana,
          vocación comunitaria y ambición civilizatoria.
        </p>
      </section>

      {/* Valores */}
      <section>
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
          <HeartHandshake className="w-5 h-5 text-amber-400" />
          Nuestros valores
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RDM_VALUES.map((value, i) => (
            <article
              key={value.id}
              className="p-5 rounded-2xl glass-panel-interactive border border-white/10 space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-amber-400">
                {valueIcons[i % valueIcons.length]}
              </div>
              <h4 className="text-sm font-bold text-white">{value.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Consejo / Equipo */}
      <section>
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-emerald-400" />
          Consejo del Nodo
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RDM_TEAM.map((member) => (
            <article
              key={member.id}
              className="p-5 rounded-2xl glass-panel-interactive border border-white/10 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/15 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{member.name}</h4>
                  <div className="text-[11px] font-mono text-emerald-400">
                    {member.role}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {member.bio}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
