import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, Server, Activity, Shield, Clock, Cpu, Database, Zap,
  CheckCircle, AlertTriangle, TrendingUp, Wallet, BarChart3
} from "lucide-react";
import { useFederatedNodes } from "@/hooks/useFederatedNodes";
import { usePhoenixStatus } from "@/hooks/usePhoenixStatus";
import { useState, useEffect } from "react";
import { callGateway } from "@/lib/tamv-gateway-client";
import { OperationalReadinessBoard } from "@/components/operations/OperationalReadinessBoard";

export default function Atlas() {
  const { nodes, loading: nodesLoading } = useFederatedNodes();
  const { status: phoenix, loading: phoenixLoading } = usePhoenixStatus();
  const [sentinelStatus, setSentinelStatus] = useState<string>("loading");
  const [recentThreats, setRecentThreats] = useState<number>(0);

  // Fetch sentinel status via unified gateway
  useEffect(() => {
    const fetchSentinel = async () => {
      try {
        const result = await callGateway<{
          status: string;
          recent_threats: unknown[];
        }>("security.sentinel.status");
        setSentinelStatus(result.status || "OPERATIONAL");
        setRecentThreats(result.recent_threats?.length || 0);
      } catch {
        setSentinelStatus("OPERATIONAL");
      }
    };
    fetchSentinel();
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "standby": return "bg-amber-500";
      case "offline": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  const getASTBadge = (state: string | null) => {
    switch (state) {
      case "NORMAL": return <Badge variant="outline" className="bg-emerald-500/20 text-emerald-600 border-emerald-500/40">NORMAL</Badge>;
      case "OBLIVION": return <Badge variant="outline" className="bg-purple-500/20 text-purple-600 border-purple-500/40">OBLIVION</Badge>;
      case "BUNKER": return <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/40">BUNKER</Badge>;
      case "ORPHAN": return <Badge variant="outline" className="bg-red-500/20 text-red-600 border-red-500/40">ORPHAN</Badge>;
      case "PHOENIX": return <Badge variant="outline" className="bg-orange-500/20 text-orange-600 border-orange-500/40">PHOENIX</Badge>;
      default: return <Badge variant="outline">{state || "UNKNOWN"}</Badge>;
    }
  };

  const getNodeIcon = (type: string | null) => {
    switch (type) {
      case "cloud": return <Server className="h-4 w-4" />;
      case "edge": return <Cpu className="h-4 w-4" />;
      case "fog": return <Database className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const activeNodes = nodes.filter(n => n.status === "active").length;
  const avgHealth = nodes.length > 0
    ? nodes.reduce((s, n) => s + (n.health_score || 0), 0) / nodes.length
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Atlas de Federacion</h1>
              <p className="text-muted-foreground">Monitoreo via Gateway TAMV DM-X7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10">
              <Zap className="h-3 w-3 mr-1" />
              Gateway v7
            </Badge>
            <Badge variant={sentinelStatus === "OPERATIONAL" ? "default" : "destructive"}>
              <Shield className="h-3 w-3 mr-1" />
              {sentinelStatus === "loading" ? "Conectando..." : sentinelStatus}
            </Badge>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Server className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{activeNodes}/{nodes.length}</div>
              <p className="text-xs text-muted-foreground">Nodos Activos</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{avgHealth.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Salud Promedio</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{phoenix.fundBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Fondo Fenix</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{(phoenix.economicHealth * 100).toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">Salud Economica</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{phoenix.transactionCount}</div>
              <p className="text-xs text-muted-foreground">Transacciones</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{recentThreats}</div>
              <p className="text-xs text-muted-foreground">Amenazas 24h</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="nodes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="nodes" className="gap-2">
              <Server className="h-4 w-4" />
              Nodos Federados
            </TabsTrigger>
            <TabsTrigger value="economy" className="gap-2">
              <Wallet className="h-4 w-4" />
              Economia Fenix
            </TabsTrigger>
            <TabsTrigger value="readiness" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Preparacion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="space-y-4">
            {/* Visual Map */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative h-64 flex items-center justify-center">
                  {/* Central Isabella Core */}
                  <div className="absolute z-10 flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                      <Globe className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <span className="mt-2 text-xs font-medium">Isabella Core</span>
                  </div>

                  {/* Live nodes orbiting */}
                  {nodes.map((node, i) => {
                    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
                    const radius = 110;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <div
                        key={node.id}
                        className="absolute group cursor-pointer"
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                      >
                        <div className={`h-10 w-10 rounded-full ${getStatusColor(node.status)} flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110`}>
                          {getNodeIcon(node.node_type)}
                        </div>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap">
                          {node.node_name}
                        </span>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground p-2 rounded-md shadow-lg text-xs z-20 min-w-[120px]">
                          <p className="font-medium">{node.node_name}</p>
                          <p className="text-muted-foreground">{node.region}</p>
                          <p>Health: {node.health_score}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>Activo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>Standby</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>Core</span>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  {nodesLoading ? "Cargando..." : `${nodes.length} nodos registrados`}
                </p>
              </CardContent>
            </Card>

            {/* Node Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.map((node) => (
                <Card key={node.id} className="bg-card/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg ${getStatusColor(node.status)} flex items-center justify-center text-white`}>
                          {getNodeIcon(node.node_type)}
                        </div>
                        <CardTitle className="text-base">{node.node_name}</CardTitle>
                      </div>
                      {getASTBadge(node.ast_state)}
                    </div>
                    <CardDescription>
                      {node.node_type} / {node.region}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Salud del nodo</span>
                        <span className="font-medium">{node.health_score || 0}%</span>
                      </div>
                      <Progress value={node.health_score || 0} className="h-1.5" />
                    </div>
                    {node.latency_ms && (
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Latencia
                        </span>
                        <span>{node.latency_ms}ms</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>ID</span>
                      <span className="font-mono">{node.id.slice(0, 12)}...</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="economy" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Protocolo Fenix
                  </CardTitle>
                  <CardDescription>Distribucion economica 75/25</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fondo de Reserva</span>
                    <span className="text-2xl font-bold">{phoenix.fundBalance.toFixed(2)} TAMV-T</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>75%</span>
                      </div>
                      <span className="text-muted-foreground">Creadores</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>25%</span>
                      </div>
                      <span className="text-muted-foreground">Fondo Fenix</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Volumen total</p>
                      <p className="text-lg font-semibold">{phoenix.totalVolume.toFixed(2)} TAMV-T</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transacciones</p>
                      <p className="text-lg font-semibold">{phoenix.transactionCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Estado del Mundo 4D
                  </CardTitle>
                  <CardDescription>Evolucion temporal basada en economia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <div 
                      className="text-6xl font-bold"
                      style={{ 
                        color: phoenix.economicHealth > 0.7 
                          ? "hsl(142 76% 36%)" 
                          : phoenix.economicHealth > 0.4 
                            ? "hsl(45 93% 47%)" 
                            : "hsl(0 72% 51%)"
                      }}
                    >
                      {(phoenix.economicHealth * 100).toFixed(1)}%
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium">Indice de Salud Civilizacional</p>
                  <p className="text-xs text-muted-foreground text-center">
                    La salud economica dicta la evolucion visual del mundo 4D. Valores altos = edificios florecen, 
                    valores bajos = niebla y deterioro procedural.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="readiness">
            <OperationalReadinessBoard />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
