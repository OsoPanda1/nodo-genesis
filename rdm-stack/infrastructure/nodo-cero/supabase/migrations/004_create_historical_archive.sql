-- =====================================================================
-- RDM DIGITAL HUB — NODO CERO
-- Migración 004: Archivo Histórico RDM Digital
-- Dominio de patrimonio y memoria: catálogo editorial con colecciones,
-- piezas, archivos derivados, revisiones y auditoría append-only.
-- Compatible con Supabase (primario) y Neon (réplica).
--
-- Acceso:
--   · Lectura pública  — solo piezas published + acceso abierto de
--     colecciones públicas (RLS).
--   · Escritura        — solo roles internos (archive_staff_roles)
--     desde Route Handlers protegidos con route-guard (service_role).
--   · Sin política de escritura pública: denegación por defecto.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tipos del dominio
-- ---------------------------------------------------------------------
create type public.archive_item_status as enum (
  'draft',
  'pending_review',
  'approved',
  'published',
  'withdrawn',
  'archived'
);

create type public.archive_asset_type as enum (
  'photograph',
  'document',
  'newspaper',
  'map',
  'audio',
  'video',
  'oral_history',
  'artifact',
  'three_d_model'
);

create type public.archive_access_level as enum (
  'open',
  'download_only',
  'view_only',
  'restricted'
);

create type public.archive_rights_status as enum (
  'public_domain',
  'permission_granted',
  'copyrighted',
  'rights_unknown',
  'restricted'
);

create type public.archive_role as enum (
  'contributor',
  'archivist',
  'reviewer',
  'archive_admin'
);

-- ---------------------------------------------------------------------
-- Colecciones
-- ---------------------------------------------------------------------
create table if not exists public.archive_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 160),
  description text,
  cover_image_path text,
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------
-- Piezas del archivo
-- ---------------------------------------------------------------------
create table if not exists public.archive_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null
    references public.archive_collections(id)
    on delete restrict,

  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),

  title text not null check (char_length(title) between 3 and 240),
  summary text not null check (char_length(summary) between 20 and 800),
  description text,

  asset_type public.archive_asset_type not null,
  status public.archive_item_status not null default 'draft',
  access_level public.archive_access_level not null default 'open',
  rights_status public.archive_rights_status not null default 'rights_unknown',

  author_or_source text,
  source_reference text,
  donor_name text,
  license text,

  historical_date_start date,
  historical_date_end date,
  date_precision text not null default 'unknown'
    check (date_precision in ('exact', 'month', 'year', 'circa', 'unknown')),

  location_name text,
  latitude double precision
    check (latitude is null or latitude between -90 and 90),
  longitude double precision
    check (longitude is null or longitude between -180 and 180),

  people text[] not null default '{}',
  organizations text[] not null default '{}',
  tags text[] not null default '{}',

  published_at timestamptz,
  withdrawn_at timestamptz,
  withdrawn_reason text,

  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint archive_dates_valid check (
    historical_date_end is null
    or historical_date_start is null
    or historical_date_end >= historical_date_start
  ),

  constraint archive_published_consistency check (
    (status = 'published' and published_at is not null)
    or status <> 'published'
  )
);

-- ---------------------------------------------------------------------
-- Archivos derivados y originales (Storage)
-- ---------------------------------------------------------------------
create table if not exists public.archive_files (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null
    references public.archive_items(id)
    on delete cascade,

  storage_bucket text not null
    check (storage_bucket in (
      'archive-originals',
      'archive-public',
      'archive-restricted'
    )),

  object_path text not null unique,
  file_role text not null
    check (file_role in (
      'original',
      'access_copy',
      'thumbnail',
      'transcript',
      'manifest'
    )),

  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  sha256 text not null check (sha256 ~ '^sha256:[a-f0-9]{64}$'),

  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_seconds integer check (
    duration_seconds is null or duration_seconds >= 0
  ),

  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),

  unique (item_id, file_role)
);

-- ---------------------------------------------------------------------
-- Revisiones (historial editorial; no se borra el original)
-- ---------------------------------------------------------------------
create table if not exists public.archive_revisions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null
    references public.archive_items(id)
    on delete cascade,

  revision_number integer not null check (revision_number > 0),
  snapshot jsonb not null,
  change_reason text not null check (char_length(change_reason) between 3 and 500),

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),

  unique (item_id, revision_number)
);

-- ---------------------------------------------------------------------
-- Auditoría append-only
-- ---------------------------------------------------------------------
create table if not exists public.archive_audit_events (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.archive_items(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,

  event_type text not null check (event_type in (
    'created',
    'updated',
    'submitted_for_review',
    'approved',
    'published',
    'withdrawn',
    'download_requested',
    'integrity_verified'
  )),

  trace_id uuid,
  correlation_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------
-- Roles internos del archivo
-- ---------------------------------------------------------------------
create table if not exists public.archive_staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.archive_role not null,
  granted_at timestamptz not null default timezone('utc', now()),
  granted_by uuid references auth.users(id) on delete set null
);

-- ---------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------
create index if not exists archive_items_status_published_idx
  on public.archive_items(status, published_at desc);

create index if not exists archive_items_collection_idx
  on public.archive_items(collection_id);

create index if not exists archive_items_asset_type_idx
  on public.archive_items(asset_type);

create index if not exists archive_items_historical_date_idx
  on public.archive_items(historical_date_start);

-- Búsqueda: el repo de archivo consulta con ILIKE; se indexa el vector de
-- texto completo vía función wrapper inmutable (patrón Supabase canónico)
-- para poder escalar la búsqueda cuando se use to_tsquery.
create or replace function public.rdm_tsvector(regconfig, text) returns tsvector
  language sql immutable
  return to_tsvector($1, $2);

create index if not exists archive_items_search_idx
  on public.archive_items using gin (rdm_tsvector('spanish'::regconfig, coalesce(title, '')));

create index if not exists archive_items_tags_idx
  on public.archive_items using gin(tags);

create index if not exists archive_files_item_idx
  on public.archive_files(item_id);

create index if not exists archive_audit_events_item_idx
  on public.archive_audit_events(item_id, occurred_at desc);

create index if not exists archive_audit_events_type_idx
  on public.archive_audit_events(event_type);

-- ---------------------------------------------------------------------
-- Triggers de actualización
-- ---------------------------------------------------------------------
create or replace function public.archive_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists archive_collections_updated_at on public.archive_collections;
create trigger archive_collections_updated_at
before update on public.archive_collections
for each row execute function public.archive_set_updated_at();

drop trigger if exists archive_items_updated_at on public.archive_items;
create trigger archive_items_updated_at
before update on public.archive_items
for each row execute function public.archive_set_updated_at();

-- ---------------------------------------------------------------------
-- RLS — lectura pública restringida, escritura cero para anon
-- ---------------------------------------------------------------------
alter table public.archive_collections  enable row level security;
alter table public.archive_items        enable row level security;
alter table public.archive_files        enable row level security;
alter table public.archive_revisions    enable row level security;
alter table public.archive_audit_events enable row level security;
alter table public.archive_staff_roles  enable row level security;

-- El público solo descubre colecciones explícitamente públicas.
drop policy if exists "archive_public_read_collections" on public.archive_collections;
create policy "archive_public_read_collections"
on public.archive_collections
for select
to anon, authenticated
using (is_public = true);

-- El público jamás ve borradores, retirados o contenido restringido.
drop policy if exists "archive_public_read_published_items" on public.archive_items;
create policy "archive_public_read_published_items"
on public.archive_items
for select
to anon, authenticated
using (
  status = 'published'
  and access_level in ('open', 'download_only', 'view_only')
  and exists (
    select 1
    from public.archive_collections collection
    where collection.id = archive_items.collection_id
      and collection.is_public = true
  )
);

-- Solo se exponen archivos derivados marcados públicos.
drop policy if exists "archive_public_read_access_files" on public.archive_files;
create policy "archive_public_read_access_files"
on public.archive_files
for select
to anon, authenticated
using (
  is_public = true
  and file_role in ('access_copy', 'thumbnail', 'transcript')
  and exists (
    select 1
    from public.archive_items item
    where item.id = archive_files.item_id
      and item.status = 'published'
      and item.access_level in ('open', 'download_only', 'view_only')
  )
);

-- Funciones de rol (security definer).
create or replace function public.has_archive_role(
  required_roles public.archive_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.archive_staff_roles
    where user_id = auth.uid()
      and role = any(required_roles)
  );
$$;

revoke all on function public.has_archive_role(public.archive_role[]) from public;

grant execute on function public.has_archive_role(public.archive_role[])
to authenticated;

-- Cada rol solo lee su propia asignación.
drop policy if exists "archive_staff_read_own_role" on public.archive_staff_roles;
create policy "archive_staff_read_own_role"
on public.archive_staff_roles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "archive_staff_manage_collections" on public.archive_collections;
create policy "archive_staff_manage_collections"
on public.archive_collections
for all
to authenticated
using (public.has_archive_role(array['archive_admin']::public.archive_role[]))
with check (public.has_archive_role(array['archive_admin']::public.archive_role[]));

drop policy if exists "archive_staff_manage_items" on public.archive_items;
create policy "archive_staff_manage_items"
on public.archive_items
for all
to authenticated
using (
  public.has_archive_role(
    array['archivist', 'reviewer', 'archive_admin']::public.archive_role[]
  )
)
with check (
  public.has_archive_role(
    array['archivist', 'reviewer', 'archive_admin']::public.archive_role[]
  )
);

drop policy if exists "archive_staff_manage_files" on public.archive_files;
create policy "archive_staff_manage_files"
on public.archive_files
for all
to authenticated
using (
  public.has_archive_role(
    array['archivist', 'reviewer', 'archive_admin']::public.archive_role[]
  )
)
with check (
  public.has_archive_role(
    array['archivist', 'reviewer', 'archive_admin']::public.archive_role[]
  )
);

-- ---------------------------------------------------------------------
-- Buckets de Storage (privados; entrega por URL firmada)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('archive-originals', 'archive-originals', false, 52428800),
  ('archive-public', 'archive-public', false, 20971520),
  ('archive-restricted', 'archive-restricted', false, 52428800)
on conflict (id) do nothing;
