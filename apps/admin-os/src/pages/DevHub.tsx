import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Code, Shield, Key, Terminal, FileJson, Search, Zap, Database,
  BookOpen, Users, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { callGateway } from "@/lib/tamv-gateway-client";
import {
  tamvSpec, getAllDomains, getSpecByDomain, getEndpointCount,
  getDomainCounts, type TamvDomain, DOMAIN_META,
} from "@/lib/tamv-spec";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function DevHub() {
  const [search, setSearch] = useState("");
  const [testResult, setTestResult] = useState<unknown>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testOp, setTestOp] = useState("devtools.echo");

  const domains = getAllDomains();
  const counts = getDomainCounts();
  const totalEndpoints = getEndpointCount();

  const filteredDomains = domains.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    const eps = getSpecByDomain(d);
    return d.includes(s) || eps.some(e =>
      e.id.toLowerCase().includes(s) ||
      e.path.toLowerCase().includes(s) ||
      e.description.toLowerCase().includes(s)
    );
  });

  const getFilteredEndpoints = (domain: TamvDomain) => {
    const eps = getSpecByDomain(domain);
    if (!search) return eps;
    const s = search.toLowerCase();
    return eps.filter(e =>
      e.id.toLowerCase().includes(s) ||
      e.path.toLowerCase().includes(s) ||
      e.description.toLowerCase().includes(s) ||
      domain.includes(s)
    );
  };

  const runTest = async () => {
    setTestLoading(true);
    try {
      const result = await callGateway(testOp);
      setTestResult(result);
      toast.success(`${testOp} ejecutado`);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setTestResult({ error: errorMessage });
      toast.error("Error al ejecutar operacion");
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
              <Terminal className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TAMV DM-X7 API</h1>
              <p className="text-muted-foreground">Gateway Unificado - {totalEndpoints} Endpoints / 13 Dominios</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">REST Unificado</Badge>
            <Badge variant="outline">Zero-Trust</Badge>
            <Badge variant="outline">JWT + PQC</Badge>
            <Badge variant="secondary">v7.0.0</Badge>
            <Badge>{totalEndpoints} endpoints</Badge>
          </div>
        </div>

        {/* Main */}
        <Tabs defaultValue="endpoints" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="endpoints" className="gap-2">
              <Code className="h-4 w-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="console" className="gap-2">
              <Terminal className="h-4 w-4" />
              Consola
            </TabsTrigger>
            <TabsTrigger value="auth" className="gap-2">
              <Key className="h-4 w-4" />
              Auth
            </TabsTrigger>
            <TabsTrigger value="schemas" className="gap-2">
              <FileJson className="h-4 w-4" />
              Schemas
            </TabsTrigger>
          </TabsList>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar endpoint, dominio o descripcion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Domain summary */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {domains.map(d => (
                <button
                  key={d}
                  onClick={() => setSearch(d)}
                  className="text-center p-2 rounded-lg border border-border/50 hover:border-primary/50 transition-colors bg-card/50"
                >
                  <span className="text-lg font-bold">{counts[d]}</span>
                  <p className="text-xs text-muted-foreground truncate">{d}</p>
                </button>
              ))}
            </div>

            {/* Domain sections */}
            {filteredDomains.map(domain => {
              const eps = getFilteredEndpoints(domain);
              if (eps.length === 0) return null;
              return (
                <Card key={domain}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div 
                        className="h-6 w-6 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: DOMAIN_META[domain].color }}
                      >
                        {domain.slice(0, 2).toUpperCase()}
                      </div>
                      {DOMAIN_META[domain].label}
                      <Badge variant="outline" className="ml-auto">{eps.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {eps.map(ep => (
                        <div key={ep.id} className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
                          <Badge 
                            variant="outline" 
                            className={`w-16 justify-center text-xs ${
                              ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-600' :
                              ep.method === 'POST' ? 'bg-blue-500/10 text-blue-600' :
                              ep.method === 'PATCH' ? 'bg-amber-500/10 text-amber-600' :
                              'bg-red-500/10 text-red-600'
                            }`}
                          >
                            {ep.method}
                          </Badge>
                          <code className="text-xs font-mono flex-1 truncate">{ep.path}</code>
                          <span className="text-xs text-muted-foreground hidden md:block max-w-[200px] truncate">{ep.description}</span>
                          {ep.authRequired && <Shield className="h-3 w-3 text-amber-500" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Console Tab */}
          <TabsContent value="console" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Consola TAMV Gateway
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={testOp}
                    onChange={(e) => setTestOp(e.target.value)}
                    placeholder="operation.name"
                    className="font-mono text-sm"
                  />
                  <Button onClick={runTest} disabled={testLoading}>
                    {testLoading ? "..." : "Ejecutar"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["devtools.echo", "devtools.version", "ops.status", "ops.health",
                    "quantum.health", "quantum.backends", "governance.protocols.list",
                    "bookpi.stats", "economy.fees.model", "kernel.health",
                  ].map(op => (
                    <Badge
                      key={op}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => { setTestOp(op); }}
                    >
                      {op}
                    </Badge>
                  ))}
                </div>

                {testResult && (
                  <pre className="p-4 rounded-lg bg-muted text-xs overflow-auto max-h-64 font-mono">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auth Tab */}
          <TabsContent value="auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Autenticacion Zero-Trust + Gateway Unificado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Punto de entrada unico</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Todas las operaciones pasan por un solo endpoint gateway:
                  </p>
                  <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-auto">
{`GET ${API_BASE}/gemet/nodes
GET ${API_BASE}/monitor/health
POST ${API_BASE}/payments/checkout
Content-Type: application/json
X-TAMV-Trace-ID: optional-trace-uuid

{
  "operation": "economy.balance",
  "payload": {}
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Respuesta estandar</h4>
                  <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-auto">
{`{
  "status": "success",
  "operation": "economy.balance",
  "domain": "economy",
  "result": { "balance": 1000, "currency": "TAMV-T" },
  "meta": {
    "traceId": "uuid",
    "processingMs": 42,
    "mode": "peace",
    "version": "7.0.0"
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Modos Civilizatorios</h4>
                  <p className="text-sm text-muted-foreground">
                    peace: operacion normal / alert: restricciones parciales / lockdown: solo lectura + guardianes
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schemas Tab */}
          <TabsContent value="schemas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Schemas TypeScript - TAMV DM-X7
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-[500px]">
{`// === TAMV DM-X7 Type System ===

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type TamvDomain =
  | 'auth' | 'identity' | 'security' | 'economy' | 'xr'
  | 'quantum' | 'governance' | 'utamv' | 'bookpi'
  | 'kernel' | 'ops' | 'social' | 'devtools';

interface TamvGatewayRequest {
  operation: string; // "domain.action"
  payload: Record<string, unknown>;
  meta?: {
    traceId?: string;
    client?: 'web' | 'xr' | 'cli';
    version?: string;
  };
}

interface TamvGatewayResponse<T> {
  status: 'success' | 'error';
  operation: string;
  domain: TamvDomain;
  result: T;
  meta: {
    traceId: string;
    processingMs: number;
    mode: 'peace' | 'alert' | 'lockdown';
    version: string;
    userId: string | null;
    roles: string[];
  };
}

// === Domain Types ===

interface TAMVIdentity {
  did: string;
  username: string;
  display_name: string | null;
  role: 'citizen' | 'guardian' | 'admin';
  trust_level: string;
  reputation_score: number;
  consciousness_level: number;
}

interface EconomyBalance {
  balance: number;
  currency: 'TAMV-T';
  userId: string;
}

interface IsabellaDecision {
  decision: 'approve' | 'deny' | 'escalate';
  explanation: string;
  confidence: number;
  ethical_flags: string[];
  requires_hitl: boolean;
}

interface BookPIEntry {
  id: string;
  event_type: string;
  user_id: string;
  hash: string;
  prev_hash: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

type CivilizationMode = 'peace' | 'alert' | 'lockdown';`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 hover:bg-card transition-colors cursor-pointer">
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Documentacion</p>
                <p className="text-xs text-muted-foreground">8 volumenes canonicos</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="bg-card/50 hover:bg-card transition-colors cursor-pointer">
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Comunidad</p>
                <p className="text-xs text-muted-foreground">Discord y Foro</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="bg-card/50 hover:bg-card transition-colors cursor-pointer">
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Seguridad</p>
                <p className="text-xs text-muted-foreground">Bug bounty / Panteon</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
