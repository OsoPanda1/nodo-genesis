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
  in_progress: "bg-amber-500/20 text-amber-600 border-amber-500/40",
  done: "bg-emerald-500/20 text-emerald-600 border-emerald-500/40",
};

const statusIcon: Record<ReadinessStatus, ReactNode> = {
  backlog: <CircleDashed className="h-3 w-3" />,
  in_progress: <Clock3 className="h-3 w-3" />,
  done: <CheckCircle2 className="h-3 w-3" />,
};

export function OperationalReadinessBoard() {
  const globalProgress = getReadinessProgress(readinessDomains);
  const stageProgress = getMilestoneProgress(readinessDomains, "stage");
  const productionProgress = getMilestoneProgress(readinessDomains, "production");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Centro de Preparacion Operativa
          </CardTitle>
          <CardDescription>
            Estado consolidado para pasar de beta privada a stage semi-real y produccion publica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso global</span>
                <span className="font-medium">{globalProgress}%</span>
              </div>
              <Progress value={globalProgress} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meta stage</span>
                <span className="font-medium">{stageProgress}%</span>
              </div>
              <Progress value={stageProgress} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meta produccion</span>
                <span className="font-medium">{productionProgress}%</span>
              </div>
              <Progress value={productionProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {readinessDomains.map((domain) => (
          <Card key={domain.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {domain.label}
              </CardTitle>
              <CardDescription className="text-xs">{domain.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {domain.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Owner: {task.owner} / Milestone: {task.milestone}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${statusClass[task.status]} flex items-center gap-1 shrink-0`}>
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
