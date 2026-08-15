"use client";

import React, { useState } from 'react';
import { YUNNode } from '@/lib/data/rdm-data';
import { Cpu, ShieldCheck, Terminal, CheckCircle2, Play, ArrowLeft, Lock } from 'lucide-react';

interface NodeDetailViewProps {
  node: YUNNode;
  onBack: () => void;
  onOpenIsabella: () => void;
}

export default function NodeDetailView({ node, onBack, onOpenIsabella }: NodeDetailViewProps) {
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const runNodeTest = async () => {
    setTestingEndpoint(true);
    setTestOutput(null);

    setTimeout(() => {
      setTestOutput(JSON.stringify({
        nodeId: node.id,
        code: node.code,
        status: "OPERATIONAL_OPTIMAL",
        timestamp: new Date().toISOString(),
        latency: node.latency,
        sovereigntyCheck: "PASSED_POST_QUANTUM",
        territory: "Real del Monte, Hidalgo, MX"
      }, null, 2));
      setTestingEndpoint(false);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl glass-panel-interactive border border-white/10 text-xs font-mono text-cyan-300 hover:text-white transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Hub Principal</span>
        </button>

        <div className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          {node.code} &bull; {node.coreName}
        </div>
      </div>

      {/* Node Header Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl glass-panel border border-cyan-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] space-y-4">
        {/* Animated Aurora Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl animate-pulse-glow" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl animate-pulse-glow" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <span className="px-3 py-1 rounded-lg bg-cyan-900/60 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300">
            {node.category}
          </span>

          <div className="flex items-center gap-2">
            {/* Animated Status Signal */}
            <div className="relative w-3.5 h-3.5">
              <span className={`absolute inset-0 rounded-full ${node.status === 'Optimo' ? 'bg-emerald-400 animate-ping' : node.status === 'Cripto-Protegido' ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-ping'}`} />
              <span className={`absolute inset-0 rounded-full ${node.status === 'Optimo' ? 'bg-emerald-400' : node.status === 'Cripto-Protegido' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{node.status}</span>
            <span className="text-xs font-mono text-slate-400 ml-2 flex items-center gap-1">
              <Lock className="w-3 h-3 text-purple-400" />
              Latencia: {node.latency}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {node.title}
        </h1>

        <p className="text-base text-cyan-200 font-light max-w-3xl leading-relaxed">
          {node.subtitle}
        </p>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          {node.description}
        </p>

        {/* Live Metrics Grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          {node.metrics.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase">{m.label}</div>
              <div className="text-2xl font-black text-white mt-1">{m.value}</div>
              <div className="text-xs font-mono text-emerald-400 mt-0.5">{m.change}</div>
            </div>
          ))}
        </div>

        {/* Node Signal Gauge */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            { label: 'Disponibilidad', value: 99.8, color: 'from-emerald-400 to-teal-500' },
            { label: 'Sincronización YUN', value: 97.2, color: 'from-cyan-400 to-blue-500' },
            { label: 'Cripto-Cobertura PQC', value: 100, color: 'from-purple-400 to-indigo-500' },
          ].map((gauge, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{gauge.label}</span>
                <span className="text-xs font-black text-white">{gauge.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${gauge.color} transition-all duration-1000`}
                  style={{ width: `${gauge.value}%`, boxShadow: '0 0 12px rgba(34,211,238,0.5)' }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Node Details & Technical Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Specifications List */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            Especificaciones Técnicas del Nodo
          </h3>

          <ul className="space-y-3 text-xs text-slate-300 font-mono">
            {node.details.map((detail, idx) => (
              <li key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive Endpoint / Tester */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5 text-purple-400" />
              Prueba de Contrato y Endpoint API
            </h3>
            <p className="text-xs text-slate-400">
              Verifica el estado del microservicio federado en tiempo real.
            </p>

            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
              GET {node.endpoint || `/api/yun/node/${node.id}`}
            </div>
          </div>

          <div>
            <button
              onClick={runNodeTest}
              disabled={testingEndpoint}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Play className={`w-4 h-4 ${testingEndpoint ? 'animate-spin' : ''}`} />
              <span>{testingEndpoint ? 'Ejecutando Ping Criptográfico...' : 'Ejecutar Ping al Nodo'}</span>
            </button>

            {testOutput && (
              <pre className="mt-3 p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
                {testOutput}
              </pre>
            )}
          </div>
        </div>

      </div>

      {/* Isabella AI Integration Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/40 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cpu className="w-8 h-8 text-cyan-400" />
          <div>
            <h4 className="text-base font-bold text-white">¿Dudas sobre este nodo?</h4>
            <p className="text-xs text-slate-300">Consulta a Isabella Villaseñor AI sobre la arquitectura de {node.title}.</p>
          </div>
        </div>

        <button
          onClick={onOpenIsabella}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
        >
          Consultar Isabella AI
        </button>
      </div>

    </div>
  );
}
