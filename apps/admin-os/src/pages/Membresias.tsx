import { useState } from "react";
import { Crown, Check, Trophy, Medal, Target } from "lucide-react";
import { ModuleShell, SectionTitle, ElegantCard, Chip } from "@/components/ModuleShell";
import { ElegantPagination } from "@/components/ElegantPagination";
import { MEMBERSHIP_PLANS, TERRITORIAL_MISSIONS, USER_BADGES } from "@/data/rdm/modulesData";

const PAGE_SIZE = 4;

export default function Membresias() {
  const [annual, setAnnual] = useState(false);
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(TERRITORIAL_MISSIONS.length / PAGE_SIZE));
  const pagedMissions = TERRITORIAL_MISSIONS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <ModuleShell
      eyebrow="Membresías & Gamificación"
      title="Ciudadanía"
      highlight="Activa"
      subtitle="Planes cívicos para turistas, locatarios y comercios, con misiones territoriales e insignias de patrimonio."
      seoTitle="Membresías y misiones territoriales · RDM Digital"
      seoDescription="Planes de membresía cívica para turistas, locatarios y comercios de Real del Monte, con misiones gamificadas, insignias y fondo patrimonial."
    >
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full border border-border/50 bg-card/50 p-1">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 text-xs rounded-full transition-colors ${!annual ? "bg-accent/20 text-accent" : "text-muted-foreground"}`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 text-xs rounded-full transition-colors ${annual ? "bg-accent/20 text-accent" : "text-muted-foreground"}`}
          >
            Anual
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {MEMBERSHIP_PLANS.map((plan, i) => (
          <ElegantCard key={plan.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Crown className="w-5 h-5 text-gold" />
              <Chip>{plan.targetRole}</Chip>
            </div>
            <h3 className="font-display text-lg font-semibold mb-1">{plan.name}</h3>
            <p className="font-display text-3xl text-gold mb-1">
              ${annual ? plan.annualFeeMXN : plan.monthlyFeeMXN}
              <span className="text-xs text-muted-foreground"> MXN/{annual ? "año" : "mes"}</span>
            </p>
            <p className="text-[11px] text-muted-foreground mb-4">
              {plan.heritageFundAllocationPercent}% se destina al Fondo de Patrimonio
            </p>
            <ul className="space-y-2">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="text-xs text-muted-foreground flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" /> {benefit}
                </li>
              ))}
            </ul>
          </ElegantCard>
        ))}
      </div>

      <SectionTitle hint={`${TERRITORIAL_MISSIONS.length} misiones`}>Misiones Territoriales</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 max-w-6xl mx-auto">
        {pagedMissions.map((mission, i) => (
          <ElegantCard key={mission.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              <Target className="w-5 h-5 text-accent" />
              <Chip>{mission.category}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{mission.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{mission.description}</p>
            <div className="h-1.5 rounded-full bg-border/50 overflow-hidden mb-2">
              <div className="h-full bg-gold" style={{ width: `${mission.progressPercent}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>
                {mission.completedCheckpoints}/{mission.checkpointCount} puntos · {mission.progressPercent}%
              </span>
              <span className="text-accent">+{mission.xpReward} XP · {mission.badgeReward}</span>
            </p>
          </ElegantCard>
        ))}
      </div>
      <div className="max-w-5xl mx-auto">
        <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} variant="numeric" />
      </div>

      <SectionTitle hint="Colección cívica">Insignias de Patrimonio</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {USER_BADGES.map((badge, i) => (
          <ElegantCard key={badge.id} index={i}>
            <div className="flex items-start justify-between mb-3">
              {badge.unlockedAt ? (
                <Trophy className="w-5 h-5 text-gold" />
              ) : (
                <Medal className="w-5 h-5 text-muted-foreground" />
              )}
              <Chip>{badge.rarity}</Chip>
            </div>
            <h3 className="font-display text-base font-semibold mb-1">
              {badge.icon} {badge.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
            <p className="text-[10px] text-muted-foreground mt-3 border-t border-border/40 pt-3">
              {badge.unlockedAt ? `Desbloqueada el ${badge.unlockedAt}` : "Pendiente de desbloquear"}
            </p>
          </ElegantCard>
        ))}
      </div>
    </ModuleShell>
  );
}
