create table if not exists public.biometrics (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.production_cycles(id) on delete cascade,
  record_date date not null,
  sampled_fish_count integer check (sampled_fish_count is null or sampled_fish_count > 0),
  sample_total_weight_kg numeric(12, 3) check (
    sample_total_weight_kg is null or sample_total_weight_kg >= 0
  ),
  avg_weight_g numeric(12, 2) not null check (avg_weight_g >= 0),
  avg_size_cm numeric(8, 2) check (avg_size_cm is null or avg_size_cm >= 0),
  observations text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint biometrics_unique_cycle_date unique (cycle_id, record_date)
);

create index if not exists biometrics_cycle_date_idx
on public.biometrics(cycle_id, record_date desc);

create trigger biometrics_set_updated_at
before update on public.biometrics
for each row
execute function public.set_updated_at();

alter table public.daily_records
add column if not exists ammonium_mg_l numeric(8, 3) check (
  ammonium_mg_l is null or ammonium_mg_l >= 0
),
add column if not exists nitrites_mg_l numeric(8, 3) check (
  nitrites_mg_l is null or nitrites_mg_l >= 0
);

create or replace view public.water_quality_records as
select
  id,
  cycle_id,
  id as daily_record_id,
  record_date,
  temperature_c,
  ph,
  dissolved_oxygen_mg_l,
  ammonium_mg_l,
  nitrites_mg_l,
  observations,
  created_by,
  created_at,
  updated_at
from public.daily_records
where
  temperature_c is not null
  or ph is not null
  or dissolved_oxygen_mg_l is not null
  or ammonium_mg_l is not null
  or nitrites_mg_l is not null;

alter table public.biometrics enable row level security;

create policy "biometrics_select_authenticated"
on public.biometrics
for select
to authenticated
using (true);

create policy "biometrics_insert_authenticated"
on public.biometrics
for insert
to authenticated
with check (true);

create policy "biometrics_update_authenticated"
on public.biometrics
for update
to authenticated
using (true)
with check (true);

create policy "biometrics_delete_authenticated"
on public.biometrics
for delete
to authenticated
using (true);

with demo_cycle as (
  select id, stocking_date from public.production_cycles where code = 'TIL-2026-001' limit 1
)
insert into public.biometrics (
  cycle_id,
  record_date,
  sampled_fish_count,
  sample_total_weight_kg,
  avg_weight_g,
  avg_size_cm,
  observations
)
select
  demo_cycle.id,
  (demo_cycle.stocking_date + (sample.day_number || ' days')::interval)::date,
  sample.sampled_fish_count,
  sample.sample_total_weight_kg,
  round((sample.sample_total_weight_kg * 1000 / sample.sampled_fish_count)::numeric, 2),
  sample.avg_size_cm,
  'Biometria demo para graficas de crecimiento'
from demo_cycle
cross join (
  values
    (21, 30, 0.75, 7.5),
    (45, 30, 2.10, 11.2),
    (70, 35, 4.55, 15.4),
    (92, 35, 7.00, 18.8)
) as sample(day_number, sampled_fish_count, sample_total_weight_kg, avg_size_cm)
on conflict (cycle_id, record_date) do nothing;

update public.daily_records
set
  ammonium_mg_l = case
    when ammonium_mg_l is null then 0.12
    else ammonium_mg_l
  end,
  nitrites_mg_l = case
    when nitrites_mg_l is null then 0.05
    else nitrites_mg_l
  end
where cycle_id = (
  select id from public.production_cycles where code = 'TIL-2026-001' limit 1
)
and observations = 'Registro demo de Fase 3';
