import { WikiPage } from "@/components/WikiPage";
import { Section } from "@/components/WikiElements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plug, Shield, GraduationCap, Globe, Coins, Brain, AlertTriangle } from "lucide-react";

const endpoints = {
  identidad: [
    {
      method: "POST",
      path: "/api/v1/identity/create",
      desc: "Crear identidad soberana con DID verificable",
    },
    { method: "GET", path: "/api/v1/identity/:did", desc: "Consultar identidad por DID" },
    { method: "POST", path: "/api/v1/identity/verify", desc: "Verificar credencial con ZK-Proof" },
    { method: "PUT", path: "/api/v1/identity/:did/rotate", desc: "Rotar claves criptográficas" },
    {
      method: "DELETE",
      path: "/api/v1/identity/:did/revoke",
      desc: "Revocar credencial específica",
    },
  ],
  educacion: [
    { method: "POST", path: "/api/v1/edu/course", desc: "Crear curso inmersivo con contenido XR" },
    { method: "GET", path: "/api/v1/edu/courses", desc: "Listar cursos con filtros y paginación" },
    {
      method: "POST",
      path: "/api/v1/edu/enroll",
      desc: "Matricular estudiante con verificación ID-NVIDA",
    },
    {
      method: "GET",
      path: "/api/v1/edu/progress/:studentId",
      desc: "Consultar progreso y certificaciones",
    },
    {
      method: "POST",
      path: "/api/v1/edu/certificate",
      desc: "Emitir certificado verificable en blockchain",
    },
  ],
  seguridad: [
    { method: "POST", path: "/api/v1/security/audit", desc: "Registrar evento en ledger EOCT" },
    {
      method: "GET",
      path: "/api/v1/security/alerts",
      desc: "Consultar alertas activas con severidad",
    },
    { method: "POST", path: "/api/v1/security/scan", desc: "Ejecutar escaneo de vulnerabilidades" },
    {
      method: "GET",
      path: "/api/v1/security/compliance",
      desc: "Estado de compliance (GDPR, ISO, AI Act)",
    },
    { method: "POST", path: "/api/v1/security/incident", desc: "Reportar incidente de seguridad" },
  ],
  economia: [
    {
      method: "POST",
      path: "/api/v1/economy/transfer",
      desc: "Transferir tokens TAU con trazabilidad",
    },
    { method: "GET", path: "/api/v1/economy/balance/:did", desc: "Consultar balance de wallet" },
    {
      method: "GET",
      path: "/api/v1/economy/transactions",
      desc: "Historial de transacciones con filtros",
    },
    { method: "POST", path: "/api/v1/economy/stake", desc: "Participar en gobernanza con staking" },
    { method: "GET", path: "/api/v1/economy/metrics", desc: "Métricas económicas del ecosistema" },
  ],
  metaverso: [
    {
      method: "POST",
      path: "/api/v1/metaverse/space",
      desc: "Crear DreamSpace con configuración XR",
    },
    {
      method: "GET",
      path: "/api/v1/metaverse/spaces",
      desc: "Listar espacios con geolocalización",
    },
    {
      method: "POST",
      path: "/api/v1/metaverse/avatar",
      desc: "Crear/actualizar avatar vinculado a DID",
    },
    { method: "POST", path: "/api/v1/metaverse/event", desc: "Programar evento inmersivo" },
    { method: "GET", path: "/api/v1/metaverse/twin/:id", desc: "Consultar gemelo digital" },
  ],
  ia: [
    { method: "POST", path: "/api/v1/ai/chat", desc: "Conversación con Isabella AI (streaming)" },
    {
      method: "POST",
      path: "/api/v1/ai/analyze",
      desc: "Análisis de datos con agentes especializados",
    },
    { method: "GET", path: "/api/v1/ai/agents", desc: "Listar agentes IA disponibles y su estado" },
    {
      method: "POST",
      path: "/api/v1/ai/compliance-check",
      desc: "Verificar compliance de contenido",
    },
    { method: "GET", path: "/api/v1/ai/models", desc: "Modelos disponibles y capacidades" },
  ],
};

const methodColor: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-sky-400",
  PUT: "text-amber-400",
  DELETE: "text-red-400",
};

const tabs = [
  { key: "identidad", label: "Identidad", icon: Shield, data: endpoints.identidad },
  { key: "educacion", label: "Educación", icon: GraduationCap, data: endpoints.educacion },
  { key: "seguridad", label: "Seguridad", icon: Shield, data: endpoints.seguridad },
  { key: "economia", label: "Economía", icon: Coins, data: endpoints.economia },
  { key: "metaverso", label: "Metaverso", icon: Globe, data: endpoints.metaverso },
  { key: "ia", label: "IA", icon: Brain, data: endpoints.ia },
];

const KitAPIs = () => (
  <WikiPage
    title="Kit de Integración Externa (APIs)"
    subtitle="Conectores listos para economía digital, educación inmersiva, seguridad avanzada y XR"
  >
    <Section title="Autenticación">
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 font-mono text-xs text-muted-foreground space-y-1 mb-6">
        <div className="text-primary"># Todas las peticiones requieren header de autenticación</div>
        <div>Authorization: Bearer {"<ID-NVIDA-TOKEN>"}</div>
        <div>X-Node-ID: {"<FEDERATED-NODE-ID>"}</div>
        <div>Content-Type: application/json</div>
        <div className="mt-2 text-primary"># Rate limits por defecto</div>
        <div>
          100 req/min (anónimo) | 1000 req/min (autenticado) | 10000 req/min (nodo federado)
        </div>
      </div>
    </Section>

    <Section title="Acceso por nivel de membresía">
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 mb-6">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            El acceso a endpoints varía según el nivel de membresía. Los{" "}
            <strong className="text-foreground">rate limits</strong> y
            <strong className="text-foreground"> dominios disponibles</strong> dependen del plan
            contratado.
          </p>
        </div>
        <div className="rounded-lg border border-border/50 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left px-3 py-2 text-foreground font-medium">Nivel</th>
                <th className="text-left px-3 py-2 text-foreground font-medium">Acceso</th>
                <th className="text-center px-3 py-2 text-foreground font-medium">Rate Limit</th>
                <th className="text-left px-3 py-2 text-foreground font-medium">Restricciones</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/30">
                <td className="px-3 py-2 font-medium text-foreground">Free</td>
                <td className="px-3 py-2">Sin acceso a APIs</td>
                <td className="px-3 py-2 text-center">—</td>
                <td className="px-3 py-2">Solo lectura de documentación pública</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="px-3 py-2 font-medium text-foreground">Premium</td>
                <td className="px-3 py-2">Docs read-only</td>
                <td className="px-3 py-2 text-center">—</td>
                <td className="px-3 py-2">Documentación completa sin sandbox</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="px-3 py-2 font-medium text-foreground">Devs</td>
                <td className="px-3 py-2">Sandbox completo</td>
                <td className="px-3 py-2 text-center">500 req/min</td>
                <td className="px-3 py-2">Sin acceso a Seguridad crítica ni Certificación</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="px-3 py-2 font-medium text-foreground">Advance</td>
                <td className="px-3 py-2">Producción parcial</td>
                <td className="px-3 py-2 text-center">2000 req/min</td>
                <td className="px-3 py-2">Sin acceso a NOA operativo ni Certificación emisión</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-foreground">Enterprise</td>
                <td className="px-3 py-2">Producción completa</td>
                <td className="px-3 py-2 text-center">10000 req/min</td>
                <td className="px-3 py-2">Acceso total. SLA dedicado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Section>

    <Tabs defaultValue="identidad" className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/30 p-1">
        {tabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key} className="text-xs">
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.key} value={tab.key} className="space-y-4 mt-6">
          <Section title={`API de ${tab.label}`}>
            <div className="space-y-2">
              {tab.data.map((ep) => (
                <div
                  key={ep.path}
                  className="rounded-lg border border-border/50 bg-card/50 p-3 flex items-start gap-3"
                >
                  <span
                    className={`font-mono text-xs font-bold w-14 shrink-0 ${methodColor[ep.method]}`}
                  >
                    {ep.method}
                  </span>
                  <div className="min-w-0">
                    <code className="text-xs text-foreground font-mono break-all">{ep.path}</code>
                    <p className="text-xs text-muted-foreground mt-0.5">{ep.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>
      ))}
    </Tabs>

    <Section title="SDKs disponibles">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {[
          { lang: "TypeScript/JS", pkg: "npm install @tamv/sdk", status: "Estable" },
          { lang: "Python", pkg: "pip install tamv-sdk", status: "Beta" },
          { lang: "Rust", pkg: "cargo add tamv-sdk", status: "Alpha" },
        ].map((sdk) => (
          <div key={sdk.lang} className="rounded-lg border border-border/50 bg-card/50 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-foreground text-sm">{sdk.lang}</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                {sdk.status}
              </span>
            </div>
            <code className="text-xs text-muted-foreground font-mono">{sdk.pkg}</code>
          </div>
        ))}
      </div>
    </Section>
  </WikiPage>
);

export default KitAPIs;
