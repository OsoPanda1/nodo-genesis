import { Award, TrendingUp } from 'lucide-react';
import type { CityScorecard } from '@/lib/city/city-scorecard';

export type CityScorecardProps = {
  scorecard: CityScorecard;
};

const GRADE_STYLES: Record<CityScorecard['grade'], string> = {
  A: 'bg-emerald-500/10 text-emerald-400',
  B: 'bg-sky-500/10 text-sky-400',
  C: 'bg-amber-500/10 text-amber-400',
  D: 'bg-orange-500/10 text-orange-400',
  F: 'bg-red-500/10 text-red-400',
};

export function CityScorecardPanel({ scorecard }: CityScorecardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          <Award className="h-3.5 w-3.5 text-emerald-400" />
          Scorecard ciudad
        </div>
        <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${GRADE_STYLES[scorecard.grade]}`}>
          {scorecard.grade}
        </span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Índice global</p>
            <p className="text-3xl font-bold text-slate-100">{scorecard.overall}</p>
          </div>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
            style={{ width: `${scorecard.overall}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {scorecard.dimensions.map((dimension) => {
          const color =
            dimension.score >= 85 ? 'text-emerald-400' : dimension.score >= 65 ? 'text-amber-400' : 'text-red-400';
          return (
            <div key={dimension.key} className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">{dimension.label}</span>
                <span className="font-medium text-slate-200">
                  {dimension.score}
                  <span className="ml-1 text-slate-500">{Math.round(dimension.weight * 100)}% peso</span>
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    dimension.score >= 85 ? 'bg-emerald-400' : dimension.score >= 65 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${dimension.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
