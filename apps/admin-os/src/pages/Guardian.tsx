import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Clock, CheckCircle, XCircle,
  User, FileText, Eye, ThumbsUp, ThumbsDown, History,
  Brain, RefreshCw, Activity, Zap
} from "lucide-react";
import { useGuardianActions } from "@/hooks/useGuardianActions";
import { callGateway } from "@/lib/tamv-gateway-client";
import { toast } from "sonner";
import { OperationalReadinessBoard } from "@/components/operations/OperationalReadinessBoard";

export default function Guardian() {
  const { user, loading: authLoading } = useAuth();
  const { pending, resolved, loading, resolveAction, refresh } = useGuardianActions();
  const [activeTab, setActiveTab] = useState("pending");
  const [testingPipeline, setTestingPipeline] = useState(false);

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleResolve = (actionId: string, decision: "approved" | "denied") => {
    resolveAction(actionId, decision, user.id);
  };

  const handleTestPipeline = async () => {
    setTestingPipeline(true);
    try {
      const result = await callGateway<{
        decision: string;
        confidence: number;
        explanation: string;
      }>("kernel.isabella.test", {
        intent: "content_moderation",
        payload: "Test content for moderation review",
      });
      toast.success(`Pipeline: ${result.decision} (confianza: ${(result.confidence * 100).toFixed(0)}%)`);
    } catch {
      toast.error("Error de conexion con Isabella via Gateway");
    }
    setTestingPipeline(false);
  };

  const handleTestSentinel = async () => {
    try {
      const result = await callGateway<{
        status: string;
        threat_level: string;
        mode: string;
      }>("security.sentinel.status");
      toast.success(`Sentinel: ${result.threat_level} - ${result.status} (modo: ${result.mode})`);
    } catch {
      toast.error("Error de conexion con Sentinel via Gateway");
    }
  };

  const approvedToday = resolved.filter(a => {
    const d = a.resolved_at ? new Date(a.resolved_at) : null;
    return d && d.toDateString() === new Date().toDateString() && a.status === "approved";
  }).length;

  const deniedToday = resolved.filter(a => {
    const d = a.resolved_at ? new Date(a.resolved_at) : null;
    return d && d.toDateString() === new Date().toDateString() && a.status === "denied";
  }).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Guardian Console</h1>
              <p className="text-muted-foreground">HITL via Gateway TAMV DM-X7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
              <Brain className="h-3 w-3 mr-1" />
              Isabella Activa
            </Badge>
            <Badge variant="secondary">
              {pending.length} Pendientes
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{pending.length}</div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <ThumbsUp className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{approvedToday}</div>
              <p className="text-xs text-muted-foreground">Aprobadas hoy</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <ThumbsDown className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{deniedToday}</div>
              <p className="text-xs text-muted-foreground">Denegadas hoy</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <History className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{resolved.length}</div>
              <p className="text-xs text-muted-foreground">Total resueltas</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Test Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Diagnostico via Gateway Unificado
                </CardTitle>
                <CardDescription>kernel.isabella.test / security.sentinel.status</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleTestSentinel}>
                  Test Sentinel
                </Button>
                <Button size="sm" onClick={handleTestPipeline} disabled={testingPipeline}>
                  {testingPipeline ? "Procesando..." : "Test Isabella"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="pending" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pendientes ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historial ({resolved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <Card className="bg-card/50">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                  <h3 className="text-lg font-medium">Sin acciones pendientes</h3>
                  <p className="text-muted-foreground mt-1">
                    Todas las solicitudes han sido procesadas. Isabella continua vigilando.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pending.map((action) => (
                <Card key={action.id} className="bg-card/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          {action.target_type === "post" ? <FileText className="h-5 w-5 text-amber-600" /> : <User className="h-5 w-5 text-amber-600" />}
                        </div>
                        <div>
                          <CardTitle className="text-base">{action.action_type}</CardTitle>
                          <CardDescription>
                            {action.target_type}:{action.target_id?.slice(0, 8)} / {action.created_at ? new Date(action.created_at).toLocaleString() : ""}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10">
                        <Brain className="h-3 w-3 mr-1" />
                        Isabella: {action.isabella_recommendation || "Pendiente"}
                        {action.isabella_confidence && ` (${(action.isabella_confidence * 100).toFixed(0)}%)`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {action.explanation && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          Analisis Isabella
                        </p>
                        <p className="text-sm">{action.explanation}</p>
                      </div>
                    )}

                    {action.msr_hash && (
                      <p className="text-xs font-mono text-muted-foreground">MSR: {action.msr_hash.slice(0, 32)}...</p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" onClick={() => handleResolve(action.id, "approved")} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <ThumbsUp className="h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleResolve(action.id, "denied")} className="gap-2">
                        <ThumbsDown className="h-4 w-4" />
                        Denegar
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Ver Detalle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {resolved.length === 0 ? (
              <Card className="bg-card/50">
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Sin historial</h3>
                  <p className="text-muted-foreground mt-1">Las decisiones resueltas apareceran aqui.</p>
                </CardContent>
              </Card>
            ) : (
              resolved.map((decision) => (
                <Card key={decision.id} className="bg-card/50">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {decision.status === "approved" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{decision.action_type}</p>
                          <p className="text-sm text-muted-foreground">{decision.explanation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={decision.status === "approved" ? "default" : "destructive"}>
                          {decision.status === "approved" ? "Aprobado" : "Denegado"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {decision.resolved_at ? new Date(decision.resolved_at).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
