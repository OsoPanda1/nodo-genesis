import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  readinessDomains,
  getReadinessProgress,
  getMilestoneProgress,
  type ReadinessStatus,
} from "@/lib/operational-readiness";
import { CheckCircle2, Clock3, CircleDashed, Target } from "lucide-react";

const statusLabel: Record<ReadinessStatus, string> = {
  backlog: "Backlog",
  in_progress: "En progreso",
  done: "Listo",
};
const statusClass: Record<ReadinessStatus, string> = {
  backlog: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-yellow-500/20 text-yellow-600 border-yellow-500/40",
  done: "bg-green-500/20 text-green-600 border-green-500/40",
};
const statusIcon: Record<ReadinessStatus, ReactNode> = {
  backlog: <CircleDashed className="w-3 h-3" />,
  in_progress: <Clock3 className="w-3 h-3" />,
  done: <CheckCircle2 className="w-3 h-3" />,
};

export function OperationalReadinessBoard() {
  const globalProgress = getReadinessProgress(readinessDomains);
  const stageProgress = getMilestoneProgress(readinessDomains, "stage");
  const productionProgress = getMilestoneProgress(readinessDomains, "production");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Centro de Preparación Operativa</CardTitle>
          <CardDescription>
            Estado consolidado para pasar de beta privada a stage semi-real y producción pública.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Progreso global", value: globalProgress },
            { label: "Meta stage", value: stageProgress },
            { label: "Meta producción", value: productionProgress },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{m.label}</span>
                <span className="font-semibold">{m.value}%</span>
              </div>
              <Progress value={m.value} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {readinessDomains.map((domain) => (
          <Card key={domain.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {domain.label}
              </CardTitle>
              <CardDescription>{domain.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {domain.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-2 border border-border rounded-md p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Owner: {task.owner} · Milestone: {task.milestone}
                    </p>
                  </div>
                  <Badge className={`gap-1 ${statusClass[task.status]}`}>
                    {statusIcon[task.status]}
                    {statusLabel[task.status]}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
