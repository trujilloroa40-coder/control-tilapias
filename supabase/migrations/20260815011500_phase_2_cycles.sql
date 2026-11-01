create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'worker', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.production_cycles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text,
  pond text not null,
  stocking_date date not null,
  initial_fish_count integer not null check (initial_fish_count > 0),
  initial_avg_weight_g numeric(12, 2) not null check (initial_avg_weight_g >= 0),
  fingerlings_total_cost numeric(14, 2) not null default 0 check (fingerlings_total_cost >= 0),
  supplier text,
  estimated_harvest_date date,
  status text not null default 'preparation' check (status in ('preparation', 'active', 'finished')),
  observations text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint production_cycles_harvest_after_stocking check (
    estimated_harvest_date is null or estimated_harvest_date >= stocking_date
  )
);

create index if not exists production_cycles_status_idx on public.production_cycles(status);
create index if not exists production_cycles_stocking_date_idx on public.production_cycles(stocking_date desc);

create trigger production_cycles_set_updated_at
before update on public.production_cycles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.production_cycles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "production_cycles_select_authenticated"
on public.production_cycles
for select
to authenticated
using (true);

create policy "production_cycles_insert_authenticated"
on public.production_cycles
for insert
to authenticated
with check (true);

create policy "production_cycles_update_authenticated"
on public.production_cycles
for update
to authenticated
using (true)
with check (true);

create policy "production_cycles_delete_authenticated"
on public.production_cycles
for delete
to authenticated
using (true);

insert into public.production_cycles (
  code,
  name,
  pond,
  stocking_date,
  initial_fish_count,
  initial_avg_weight_g,
  fingerlings_total_cost,
  supplier,
  estimated_harvest_date,
  status,
  observations
)
values
  (
    'TIL-2026-001',
    'Lote demo principal',
    'Estanque 1',
    current_date - interval '93 days',
    5000,
    2.50,
    1250000,
    'Proveedor demo',
    current_date + interval '87 days',
    'active',
    'Datos demo para validar dashboards, listado y estados del ciclo.'
  ),
  (
    'TIL-2026-002',
    'Pre-siembra levante',
    'Estanque 2',
    current_date + interval '7 days',
    3500,
    2.00,
    875000,
    'Alevinos del valle',
    current_date + interval '190 days',
    'preparation',
    'Ciclo demo en preparacion.'
  ),
  (
    'TIL-2025-004',
    'Ciclo cerrado demo',
    'Estanque 3',
    current_date - interval '260 days',
    4200,
    2.20,
    1050000,
    'Proveedor historico',
    current_date - interval '30 days',
    'finished',
    'Ciclo finalizado demo para probar historial.'
  )
on conflict (code) do nothing;
