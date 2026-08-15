-- =====================================================================
-- RDM DIGITAL HUB — NODO CERO
-- Isabella Villaseñor AI · Núcleo Cognitivo Gobernado (YUN-01)
-- Migración 001: tablas de la capa cognitiva en Supabase (Identity/AI domain)
-- Principio: una sola verdad por dominio; consumo solo vía Data Fabric YUN.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- isabella_sessions — sesiones cognitivas
-- ---------------------------------------------------------------------
create table if not exists public.isabella_sessions (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     text not null default 'rdm-nodo-cero',
  session_key   text not null unique,
  actor_id      text not null default 'ciudadano-yun',
  state         jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_isabella_sessions_actor on public.isabella_sessions (actor_id);
create index if not exists idx_isabella_sessions_tenant on public.isabella_sessions (tenant_id);

-- ---------------------------------------------------------------------
-- isabella_messages — turns de conversación/evento
-- ---------------------------------------------------------------------
create table if not exists public.isabella_messages (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.isabella_sessions (id) on delete cascade,
  role          text not null check (role in ('user', 'assistant', 'system', 'event')),
  content       jsonb not null default '{}'::jsonb,
  sequence      integer not null default 0,
  metadata      jsonb not null default '{}'::jsonb,
  trace_id      text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_isabella_messages_session on public.isabella_messages (session_id, sequence);

-- ---------------------------------------------------------------------
-- isabella_memory_items — memoria jerárquica
-- ---------------------------------------------------------------------
create table if not exists public.isabella_memory_items (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid references public.isabella_sessions (id) on delete cascade,
  actor_id      text not null default 'ciudadano-yun',
  scope         text not null check (scope in ('immediate', 'session', 'project', 'territorial', 'historical')),
  content       text not null,
  tags          text[] not null default '{}',
  relevance     numeric(3,2) not null default 0.50 check (relevance between 0 and 1),
  checksum      text not null,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  unique (scope, checksum)
);

create index if not exists idx_isabella_memory_scope on public.isabella_memory_items (scope, relevance desc);

-- ---------------------------------------------------------------------
-- isabella_decisions — decisiones gobernadas
-- ---------------------------------------------------------------------
create table if not exists public.isabella_decisions (
  id              uuid primary key default gen_random_uuid(),
  perception_id   uuid,
  decision_key    text not null,
  session_id      uuid references public.isabella_sessions (id) on delete cascade,
  summary         text not null,
  confidence      numeric(3,2) not null default 0.50 check (confidence between 0 and 1),
  risk_level      text not null check (risk_level in ('low', 'medium', 'high')),
  policy_status   text not null check (policy_status in ('allowed', 'denied', 'requires_approval')),
  engines         text[] not null default '{}',
  details         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_isabella_decisions_session on public.isabella_decisions (session_id, created_at desc);

-- ---------------------------------------------------------------------
-- isabella_tools — catálogo de herramientas autorizadas
-- ---------------------------------------------------------------------
create table if not exists public.isabella_tools (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  description   text not null,
  parameters    jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- isabella_tool_calls — invocaciones de herramientas
-- ---------------------------------------------------------------------
create table if not exists public.isabella_tool_calls (
  id            uuid primary key default gen_random_uuid(),
  decision_id   uuid references public.isabella_decisions (id) on delete cascade,
  tool_name     text not null,
  arguments     jsonb not null default '{}'::jsonb,
  result        jsonb,
  status        text not null check (status in ('pending', 'success', 'error', 'denied')),
  duration_ms   integer,
  created_at    timestamptz not null default now()
);

create index if not exists idx_isabella_tool_calls_decision on public.isabella_tool_calls (decision_id);

-- ---------------------------------------------------------------------
-- isabella_policies — políticas versionadas (Constitución YUN)
-- ---------------------------------------------------------------------
create table if not exists public.isabella_policies (
  id            uuid primary key default gen_random_uuid(),
  policy_key    text not null unique,
  name          text not null,
  version       integer not null default 1,
  status        text not null default 'active' check (status in ('active', 'draft', 'superseded')),
  risk_level    text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  action        text not null check (action in ('allow', 'deny', 'require_approval')),
  scope         text[] not null default '{}',
  rule          text not null,
  rule_pattern  text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- isabella_approvals — aprobaciones humanas
-- ---------------------------------------------------------------------
create table if not exists public.isabella_approvals (
  id            uuid primary key default gen_random_uuid(),
  decision_id   uuid references public.isabella_decisions (id) on delete cascade,
  policy_id     uuid references public.isabella_policies (id),
  approver_id   text not null,
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reason        text,
  created_at    timestamptz not null default now(),
  decided_at    timestamptz
);

-- ---------------------------------------------------------------------
-- isabella_audit_logs — trazabilidad completa
-- ---------------------------------------------------------------------
create table if not exists public.isabella_audit_logs (
  id            bigint generated always as identity primary key,
  tenant_id     text not null default 'rdm-nodo-cero',
  session_id    uuid references public.isabella_sessions (id) on delete set null,
  actor_id      text not null default 'ciudadano-yun',
  event_type    text not null,
  payload       jsonb not null default '{}'::jsonb,
  trace_id      text not null,
  federation_id text not null default 'Fed1',
  domain        text not null default 'knowledge',
  created_at    timestamptz not null default now()
);

create index if not exists idx_isabella_audit_trace on public.isabella_audit_logs (trace_id);
create index if not exists idx_isabella_audit_type on public.isabella_audit_logs (event_type, created_at desc);

-- ---------------------------------------------------------------------
-- Seed: herramientas autorizadas + políticas de la Constitución YUN
-- ---------------------------------------------------------------------
insert into public.isabella_tools (name, description, parameters)
values
  ('get_territory_status', 'Estado operativo actual del territorio', '{}'::jsonb),
  ('get_upcoming_events', 'Próximos eventos y festividades', '{"limit": "number"}'::jsonb),
  ('get_tourism_routes', 'Rutas turísticas recomendadas', '{"limit": "number"}'::jsonb),
  ('get_rdm_dicho', 'Dichos de la raza minera', '{}'::jsonb),
  ('get_business_directory', 'Directorio de comercios verificados', '{"category": "string", "limit": "number"}'::jsonb),
  ('get_yun_overview', 'Resumen de la Arquitectura Heptafederada YUN', '{}'::jsonb),
  ('get_poi_info', 'Información de puntos de interés', '{"name": "string", "limit": "number"}'::jsonb)
on conflict (name) do nothing;

insert into public.isabella_policies (policy_key, name, version, status, risk_level, action, scope, rule)
values
  ('pol-economic-sovereignty', 'Soberanía Económica Absoluta', 1, 'active', 'high', 'deny',
   '{commerce,economy}', 'Queda prohibido congelar o bloquear financieramente el territorio o sus agentes.'),
  ('pol-no-secrets', 'Secreto fuera del código', 1, 'active', 'high', 'deny',
   '{"*"}', 'Ningún secreto, API key o credencial puede circular en percepciones, decisiones o payloads.'),
  ('pol-domain-isolation', 'Aislamiento de dominios', 1, 'active', 'high', 'deny',
   '{identity,commerce,knowledge,telemetry,gameplay}', 'Acceso entre dominios solo vía Data Fabric YUN.'),
  ('pol-authorized-tools', 'Herramientas autorizadas', 1, 'active', 'medium', 'deny',
   '{"*"}', 'Solo se invocan herramientas registradas en el catálogo autorizado.'),
  ('pol-high-risk-approval', 'Aprobación humana para riesgo alto', 1, 'active', 'high', 'require_approval',
   '{"*"}', 'Percepciones de riesgo alto requieren aprobación humana antes de ejecutar acciones.')
on conflict (policy_key) do nothing;

-- ---------------------------------------------------------------------
-- Row Level Security (por tenant: rdm-nodo-cero)
-- ---------------------------------------------------------------------
alter table public.isabella_sessions enable row level security;
alter table public.isabella_messages enable row level security;
alter table public.isabella_memory_items enable row level security;
alter table public.isabella_decisions enable row level security;
alter table public.isabella_tool_calls enable row level security;
alter table public.isabella_audit_logs enable row level security;

create policy "isabella_nodo_cero_read" on public.isabella_sessions
  for select using (tenant_id = current_setting('app.yun_tenant', true));
create policy "isabella_nodo_cero_write" on public.isabella_sessions
  for insert with check (tenant_id = current_setting('app.yun_tenant', true));
