-- =====================================================================
-- RDM DIGITAL HUB — NODO CERO
-- Migración 003: dominios de plataforma (persistencia durable)
-- Convierte los stores en memoria (gamification, identity, marketplace,
-- twins, payments) en tablas relacionales reales. Compatible con
-- Supabase (primario) y Neon (réplica) — SQL Postgres estándar.
--
-- Patrón: la app escribe write-behind desde la memoria caliente; estas
-- tablas son la fuente de verdad durable y la base de la hidratación.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- IDENTIDAD — vecinos y comercios (registro soberano YUN)
-- ---------------------------------------------------------------------
create table if not exists public.identity_actors (
  id            text primary key,
  kind          text not null check (kind in ('user', 'business')),
  name          text not null,
  email         text not null unique,
  role          text,
  business_name text,
  category      text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_identity_actors_kind on public.identity_actors (kind);

-- ---------------------------------------------------------------------
-- GAMIFICACIÓN — sesiones y leaderboard (Zombies / Phygital)
-- ---------------------------------------------------------------------
create table if not exists public.gamification_sessions (
  id            text primary key,
  device_id     text not null,
  started_at    bigint not null,
  ended_at      bigint,
  kills         integer not null default 0,
  total_points  integer not null default 0,
  data          jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now()
);
create index if not exists idx_gami_sessions_device on public.gamification_sessions (device_id);
create index if not exists idx_gami_sessions_active on public.gamification_sessions (ended_at) where ended_at is null;

create table if not exists public.gamification_leaderboard (
  device_id     text primary key,
  display_name  text,
  points        integer not null default 0,
  kills         integer not null default 0,
  data          jsonb not null default '{}'::jsonb,
  updated_at    bigint not null default 0
);
create index if not exists idx_gami_leaderboard_points on public.gamification_leaderboard (points desc);

-- ---------------------------------------------------------------------
-- MARKETPLACE — listings y suscripciones
-- ---------------------------------------------------------------------
create table if not exists public.marketplace_listings (
  id                 text primary key,
  slug               text not null,
  type               text not null,
  title              text not null,
  description        text,
  provider           text,
  publisher          text,
  status             text not null default 'pending',
  price              jsonb not null default '{}'::jsonb,
  rating             numeric not null default 0,
  rating_count       integer not null default 0,
  downloads          integer not null default 0,
  tags               text[] not null default '{}',
  compatible_domains text[] not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists idx_mkt_listings_status on public.marketplace_listings (status);
create index if not exists idx_mkt_listings_type on public.marketplace_listings (type);

create table if not exists public.marketplace_subscriptions (
  id           text primary key,
  listing_id   text not null,
  licensee     text not null,
  licensed_at  timestamptz not null default now(),
  expires_at   timestamptz,
  status       text not null default 'active',
  usage_count  integer not null default 0
);
create index if not exists idx_mkt_subs_listing on public.marketplace_subscriptions (listing_id);

-- ---------------------------------------------------------------------
-- GEMELOS DIGITALES — modelos, instancias y aristas del grafo
-- ---------------------------------------------------------------------
create table if not exists public.twin_models (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.twin_instances (
  id           text primary key,
  model_id     text not null,
  name         text not null,
  external_ref text,
  lat          double precision,
  lng          double precision,
  properties   jsonb not null default '{}'::jsonb,
  telemetry    jsonb not null default '{}'::jsonb,
  status       text not null default 'healthy',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_twin_instances_model on public.twin_instances (model_id);
create index if not exists idx_twin_instances_status on public.twin_instances (status);

create table if not exists public.twin_edges (
  id       text primary key,
  from_id  text not null,
  to_id    text not null,
  kind     text not null,
  weight   double precision
);
create index if not exists idx_twin_edges_from on public.twin_edges (from_id);

-- ---------------------------------------------------------------------
-- PAGOS — ledger de intenciones, comercios y retiros
-- ---------------------------------------------------------------------
create table if not exists public.payment_intents (
  ref             text primary key,
  type            text not null,
  amount          numeric not null,
  currency        text not null default 'MXN',
  method          text not null,
  concept         text,
  merchant_id     text,
  status          text not null default 'pending',
  idempotency_key text,
  created_at      bigint not null,
  confirmed_at    bigint
);
create unique index if not exists idx_payment_idempotency
  on public.payment_intents (idempotency_key) where idempotency_key is not null;
create index if not exists idx_payment_merchant on public.payment_intents (merchant_id);
create index if not exists idx_payment_status on public.payment_intents (status);

create table if not exists public.payment_merchants (
  merchant_id text primary key,
  balance     numeric not null default 0,
  secret      text,
  updated_at  timestamptz not null default now()
);

create table if not exists public.payment_payouts (
  id          text primary key,
  merchant_id text not null,
  amount      numeric not null,
  method      text not null,
  status      text not null default 'requested',
  created_at  bigint not null
);
create index if not exists idx_payment_payouts_merchant on public.payment_payouts (merchant_id);

-- ---------------------------------------------------------------------
-- RLS — habilitada; el acceso es server-only vía service role / conexión
-- directa, por lo que no exponemos políticas públicas de escritura.
-- ---------------------------------------------------------------------
alter table public.identity_actors            enable row level security;
alter table public.gamification_sessions      enable row level security;
alter table public.gamification_leaderboard   enable row level security;
alter table public.marketplace_listings       enable row level security;
alter table public.marketplace_subscriptions  enable row level security;
alter table public.twin_models                enable row level security;
alter table public.twin_instances             enable row level security;
alter table public.twin_edges                 enable row level security;
alter table public.payment_intents            enable row level security;
alter table public.payment_merchants          enable row level security;
alter table public.payment_payouts            enable row level security;

-- Lectura pública del leaderboard y de listings publicados (contenido no sensible).
drop policy if exists p_leaderboard_read on public.gamification_leaderboard;
create policy p_leaderboard_read on public.gamification_leaderboard for select using (true);

drop policy if exists p_listings_read on public.marketplace_listings;
create policy p_listings_read on public.marketplace_listings for select using (status = 'published');
