-- =====================================================================
-- RDM DIGITAL HUB — NODO CERO
-- Migración 002: dominios territoriales (Gemelo Digital, IOC, EAM/APM,
-- Smart Grid/Agua). Tablas, seed territorial y Row Level Security.
-- Principio: una sola verdad por dominio; consumo solo vía Data Fabric YUN.
-- =====================================================================

create extension if not exists "postgis";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- dt_twin_models — catálogo de modelos DTDL
-- ---------------------------------------------------------------------
create table if not exists public.dt_twin_models (
  id           uuid primary key default gen_random_uuid(),
  dtmi         text not null unique,
  name         text not null,
  version      integer not null default 1,
  domain       text not null check (domain in ('building', 'energy', 'water', 'vehicle', 'publicSpace', 'cityService', 'custom')),
  schema       jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- dt_twins — instancias de gemelos digitales
-- ---------------------------------------------------------------------
create table if not exists public.dt_twins (
  id            uuid primary key default gen_random_uuid(),
  twin_code     text not null unique,
  model_id      uuid references public.dt_twin_models (id) on delete restrict,
  name          text not null,
  external_ref  text,
  lat           numeric(9,6),
  lng           numeric(9,6),
  properties    jsonb not null default '{}'::jsonb,
  telemetry     jsonb not null default '{}'::jsonb,
  status        text not null default 'healthy' check (status in ('healthy', 'warning', 'critical', 'offline')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_dt_twins_model on public.dt_twins (model_id);
create index if not exists idx_dt_twins_status on public.dt_twins (status);
create index if not exists idx_dt_twins_geo on public.dt_twins using gist (st_setsrid(st_makepoint(lng, lat), 4326));

-- ---------------------------------------------------------------------
-- dt_twin_edges — relaciones del grafo de gemelos
-- ---------------------------------------------------------------------
create table if not exists public.dt_twin_edges (
  id          uuid primary key default gen_random_uuid(),
  from_twin   uuid references public.dt_twins (id) on delete cascade,
  to_twin     uuid references public.dt_twins (id) on delete cascade,
  kind        text not null check (kind in ('feeds', 'contains', 'connectedTo', 'locatedIn', 'serves', 'dependsOn', 'governedBy')),
  weight      numeric(6,2),
  created_at  timestamptz not null default now(),
  unique (from_twin, to_twin, kind)
);

-- ---------------------------------------------------------------------
-- dt_assets — registro EAM/APM
-- ---------------------------------------------------------------------
create table if not exists public.dt_assets (
  id                  uuid primary key default gen_random_uuid(),
  asset_code          text not null unique,
  name                text not null,
  category            text not null check (category in ('transformer', 'switchgear', 'pump', 'valve', 'pipe', 'vehicle', 'conveyor', 'compressor', 'structure', 'hvac')),
  criticality         text not null default 'medium' check (criticality in ('low', 'medium', 'high', 'critical')),
  status              text not null default 'operational' check (status in ('operational', 'degraded', 'maintenance', 'failure', 'retired')),
  condition           text not null default 'good' check (condition in ('excellent', 'good', 'fair', 'poor', 'critical')),
  strategy            text not null default 'predictive' check (strategy in ('reactive', 'preventive', 'predictive', 'condition-based')),
  location            jsonb not null default '{}'::jsonb,
  manufacturer        text,
  model               text,
  serial_number       text,
  installed_at        timestamptz not null default now(),
  design_life_years   integer not null default 15,
  last_maintenance_at timestamptz,
  telemetry           jsonb not null default '{}'::jsonb,
  tags                text[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_dt_assets_status on public.dt_assets (status, criticality);
create index if not exists idx_dt_assets_category on public.dt_assets (category);

-- ---------------------------------------------------------------------
-- dt_work_orders — órdenes de mantenimiento
-- ---------------------------------------------------------------------
create table if not exists public.dt_work_orders (
  id            uuid primary key default gen_random_uuid(),
  asset_id      uuid references public.dt_assets (id) on delete cascade,
  title         text not null,
  description   text,
  priority      text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status        text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  estimated_hours numeric(6,2),
  origin        text not null default 'predictive' check (origin in ('manual', 'predictive', 'condition-based', 'sensor')),
  due_date      timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_dt_work_orders_asset on public.dt_work_orders (asset_id, status);
create index if not exists idx_dt_work_orders_priority on public.dt_work_orders (priority, due_date);

-- ---------------------------------------------------------------------
-- dt_city_incidents — incidentes del IOC urbano
-- ---------------------------------------------------------------------
create table if not exists public.dt_city_incidents (
  id                uuid primary key default gen_random_uuid(),
  incident_code     text not null unique,
  domain            text not null check (domain in ('police', 'fire', 'traffic', 'utilities', 'publicWorks', 'health', 'civilProtection', 'mobility', 'energy', 'water', 'environment')),
  title             text not null,
  description       text,
  severity          text not null default 'low' check (severity in ('low', 'medium', 'high', 'critical')),
  status            text not null default 'open' check (status in ('open', 'triaged', 'assigned', 'mitigated', 'closed')),
  location          jsonb not null default '{}'::jsonb,
  source            text not null default 'sensor' check (source in ('sensor', 'citizen', 'operator', 'integration', 'ai')),
  tags              text[] not null default '{}',
  related_entity_ids text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_dt_city_incidents_domain on public.dt_city_incidents (domain, status);
create index if not exists idx_dt_city_incidents_severity on public.dt_city_incidents (severity, created_at desc);

-- ---------------------------------------------------------------------
-- dt_grid_nodes — nodos de red energía/agua
-- ---------------------------------------------------------------------
create table if not exists public.dt_grid_nodes (
  id            uuid primary key default gen_random_uuid(),
  node_code     text not null unique,
  name          text not null,
  domain        text not null check (domain in ('power', 'water')),
  node_type     text not null check (node_type in ('substation', 'transformer', 'feeder', 'generator', 'meter', 'switch', 'reservoir', 'tank', 'pump', 'valve', 'pipe', 'treatment')),
  zone          text not null default 'Real del Monte',
  status        text not null default 'operational' check (status in ('operational', 'degraded', 'warning', 'critical', 'offline')),
  capacity_kw   numeric(10,2) not null default 0,
  load_kw       numeric(10,2) not null default 0,
  voltage_pu    numeric(5,3) not null default 1.000,
  frequency_hz  numeric(6,3) not null default 60.000,
  capacity_m3   numeric(12,2) not null default 0,
  flow_m3h      numeric(10,2) not null default 0,
  level_percent numeric(5,2) not null default 0,
  pressure_bar  numeric(6,3) not null default 0,
  quality_ppm   numeric(8,2) not null default 0,
  lat           numeric(9,6),
  lng           numeric(9,6),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_dt_grid_nodes_domain on public.dt_grid_nodes (domain, status);
create index if not exists idx_dt_grid_nodes_zone on public.dt_grid_nodes (zone);

-- ---------------------------------------------------------------------
-- Seed territorial: gemelos (POIs + infraestructura), activos, nodos de red
-- ---------------------------------------------------------------------
insert into public.dt_twin_models (dtmi, name, version, domain, schema)
values
  ('dtmi:rdm:twin:Building;1', 'Edificio patrimonial', 1, 'building', '{}'::jsonb),
  ('dtmi:rdm:twin:EnergyGrid;1', 'Subestación eléctrica', 1, 'energy', '{}'::jsonb),
  ('dtmi:rdm:twin:WaterNetwork;1', 'Red hidráulica', 1, 'water', '{}'::jsonb),
  ('dtmi:rdm:twin:Vehicle;1', 'Vehículo de servicio', 1, 'vehicle', '{}'::jsonb),
  ('dtmi:rdm:twin:PublicSpace;1', 'Espacio público', 1, 'publicSpace', '{}'::jsonb)
on conflict (dtmi) do nothing;

with m as (
  select dtmi, id from public.dt_twin_models
)
insert into public.dt_twins (twin_code, model_id, name, lat, lng, properties, telemetry, status)
select t.twin_code, m.id, t.name, t.lat, t.lng, t.properties, t.telemetry, t.status
from (
  values
    ('sub-rdm', 'dtmi:rdm:twin:EnergyGrid;1', 'Subestación Real del Monte', 20.1398, -98.6738,
     '{"capacityKw": 2400, "feederCount": 4}'::jsonb, '{"loadKw": 1560, "frequencyHz": 59.9, "voltageV": 132000}'::jsonb, 'healthy'),
    ('tanque-1', 'dtmi:rdm:twin:WaterNetwork;1', 'Tanque El Crestón', 20.1412, -98.6719,
     '{"capacityLiters": 1200000, "sourceName": "Ojo de Agua"}'::jsonb, '{"pressureBar": 2.4, "flowLps": 42, "levelPercent": 86}'::jsonb, 'healthy'),
    ('museo-mineria', 'dtmi:rdm:twin:Building;1', 'Museo de Minería', 20.1393, -98.6746,
     '{"floorAreaM2": 620, "occupancy": 145, "heritageGrade": "A"}'::jsonb, '{"temperature": 22, "humidity": 45, "powerKw": 18}'::jsonb, 'healthy'),
    ('bus-turistico-01', 'dtmi:rdm:twin:Vehicle;1', 'Turibús Ruta Minera', 20.1389, -98.6741,
     '{"routeId": "ruta-norte", "capacity": 40}'::jsonb, '{"speedKmh": 12, "fuelPercent": 64}'::jsonb, 'warning'),
    ('plaza-nacional', 'dtmi:rdm:twin:PublicSpace;1', 'Plaza Nacional', 20.1395, -98.6743,
     '{"surfaceM2": 4100, "capacity": 900, "accessible": true}'::jsonb, '{"visitorsNow": 380, "noiseDb": 62}'::jsonb, 'healthy')
) as t(twin_code, dtmi, name, lat, lng, properties, telemetry, status)
join m on m.dtmi = t.dtmi
on conflict (twin_code) do nothing;

with t as (select twin_code, id from public.dt_twins)
insert into public.dt_twin_edges (from_twin, to_twin, kind, weight)
select f.id, t.id, e.kind, e.weight
from (
  values
    ('sub-rdm', 'museo-mineria', 'feeds', 60),
    ('sub-rdm', 'plaza-nacional', 'feeds', 15),
    ('tanque-1', 'museo-mineria', 'feeds', null),
    ('tanque-1', 'plaza-nacional', 'feeds', null),
    ('museo-mineria', 'plaza-nacional', 'locatedIn', null),
    ('bus-turistico-01', 'museo-mineria', 'serves', null),
    ('bus-turistico-01', 'plaza-nacional', 'serves', null)
) as e(from_twin, to_twin, kind, weight)
join t f on f.twin_code = e.from_twin
join t t on t.twin_code = e.to_twin
on conflict (from_twin, to_twin, kind) do nothing;

insert into public.dt_assets (asset_code, name, category, criticality, status, condition, strategy, location, manufacturer, model, installed_at, telemetry, tags)
values
  ('TRA-ELC-01', 'Transformador El Crestón 12.5kVA', 'transformer', 'critical', 'operational', 'good', 'predictive',
   '{"zone": "El Crestón", "building": "Subestación central", "coordinates": {"lat": 20.1412, "lng": -98.6719}}'::jsonb,
   'ABB', 'TRA-12500', now() - interval '520 days', '{"temperatureC": 62, "vibrationMmS": 1.2, "runtimeHours": 12050, "loadPercent": 78}'::jsonb, '{energy, critical, grid}'),
  ('BMB-AGU-01', 'Bomba hidráulica Tanque Norte', 'pump', 'high', 'degraded', 'poor', 'condition-based',
   '{"zone": "Tanque norte", "building": "Estación de bombeo 1", "coordinates": {"lat": 20.144, "lng": -98.668}}'::jsonb,
   'Grundfos', 'CR-95', now() - interval '640 days', '{"temperatureC": 71, "vibrationMmS": 4.8, "pressureBar": 3.2, "runtimeHours": 18900, "loadPercent": 91}'::jsonb, '{water, high, pumping}'),
  ('BSV-TUR-01', 'Turibús ruta norte', 'vehicle', 'medium', 'maintenance', 'fair', 'preventive',
   '{"zone": "Patio de maniobras", "coordinates": {"lat": 20.1398, "lng": -98.6738}}'::jsonb,
   'Volvo', '9800', now() - interval '900 days', '{"temperatureC": 88, "runtimeHours": 22600, "loadPercent": 40}'::jsonb, '{mobility, fleet}')
on conflict (asset_code) do nothing;

insert into public.dt_grid_nodes (node_code, name, domain, node_type, zone, status, capacity_kw, load_kw, voltage_pu, frequency_hz, capacity_m3, flow_m3h, level_percent, pressure_bar, quality_ppm, lat, lng)
values
  ('gen-solar', 'Granja solar Real', 'power', 'generator', 'Real del Monte', 'operational', 1200, 820, 1.01, 60.02, 0, 0, 0, 0, 0, 20.1415, -98.6722),
  ('sub-central', 'Subestación central', 'power', 'substation', 'Centro', 'operational', 2500, 1710, 1.0, 60.0, 0, 0, 0, 0, 0, 20.1398, -98.6738),
  ('sub-creston', 'Subestación El Crestón', 'power', 'substation', 'El Crestón', 'degraded', 1800, 1500, 0.96, 59.9, 0, 0, 0, 0, 0, 20.1412, -98.6719),
  ('emb-barra', 'Embalse La Barranca', 'water', 'reservoir', 'Sierra', 'operational', 0, 0, 0, 0, 520000, 1450, 78, 0, 12, 20.1501, -98.6602),
  ('tanque-1', 'Tanque El Crestón', 'water', 'tank', 'El Crestón', 'degraded', 0, 0, 0, 0, 3200, 210, 41, 2.6, 15, 20.1412, -98.6719),
  ('bmb-norte', 'Bomba Tanque norte', 'water', 'pump', 'Tanque norte', 'warning', 0, 0, 0, 0, 0, 180, 0, 3.1, 15, 20.144, -98.668),
  ('vav-s7', 'Válvula sector 7', 'water', 'valve', 'Sector 7', 'operational', 0, 0, 0, 0, 0, 95, 0, 3.4, 14, 20.1386, -98.6751)
on conflict (node_code) do nothing;

-- ---------------------------------------------------------------------
-- Row Level Security (por tenant: rdm-nodo-cero)
-- ---------------------------------------------------------------------
alter table public.dt_twin_models enable row level security;
alter table public.dt_twins enable row level security;
alter table public.dt_twin_edges enable row level security;
alter table public.dt_assets enable row level security;
alter table public.dt_work_orders enable row level security;
alter table public.dt_city_incidents enable row level security;
alter table public.dt_grid_nodes enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['dt_twin_models', 'dt_twins', 'dt_twin_edges', 'dt_assets', 'dt_work_orders', 'dt_city_incidents', 'dt_grid_nodes']
  loop
    execute format('create policy "rdm_territorial_read_%1$s" on public.%1$s for select using (true);', t);
    execute format('create policy "rdm_territorial_write_%1$s" on public.%1$s for insert with check (true);', t);
  end loop;
end $$;
