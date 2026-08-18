const points = [
  { id: "cultura", x: "60%", y: "38%" },
  { id: "gastronomia", x: "33%", y: "55%" },
  { id: "historia", x: "48%", y: "70%" },
  { id: "negocios", x: "72%", y: "62%" },
];

export function Map3D() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_center,_#1f2937_0%,_#020617_70%)]">
      <div className="absolute inset-0 opacity-40 [background:linear-gradient(transparent_95%,rgba(255,255,255,0.12)_96%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.12)_96%)] [background-size:30px_30px] [transform:perspective(400px)_rotateX(65deg)_scale(1.8)]" />

      <div className="absolute inset-x-0 top-6 text-center text-xs uppercase tracking-[0.3em] text-cyan-200/70">
        Mapa 3D conceptual
      </div>

      {points.map((point) => (
        <div
          key={point.id}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
          style={{ left: point.x, top: point.y }}
        >
          <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_15px_#22d3ee]" />
          <span className="rounded bg-black/60 px-2 py-1 text-xs text-cyan-100">{point.id}</span>
        </div>
      ))}
    </div>
  );
}
