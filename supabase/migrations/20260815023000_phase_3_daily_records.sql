create table if not exists public.daily_records (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.production_cycles(id) on delete cascade,
  record_date date not null,
  temperature_c numeric(5, 2) check (temperature_c is null or temperature_c >= 0),
  ph numeric(4, 2) check (ph is null or (ph >= 0 and ph <= 14)),
  dissolved_oxygen_mg_l numeric(6, 2) check (
    dissolved_oxygen_mg_l is null or dissolved_oxygen_mg_l >= 0
  ),
  observations text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_records_unique_cycle_date unique (cycle_id, record_date)
);

create index if not exists daily_records_cycle_date_idx
on public.daily_records(cycle_id, record_date desc);

create trigger daily_records_set_updated_at
before update on public.daily_records
for each row
execute function public.set_updated_at();

create table if not exists public.mortality_records (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.production_cycles(id) on delete cascade,
  daily_record_id uuid not null references public.daily_records(id) on delete cascade,
  record_date date not null,
  quantity integer not null default 0 check (quantity >= 0),
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mortality_records_unique_cycle_date unique (cycle_id, record_date)
);

create index if not exists mortality_records_cycle_date_idx
on public.mortality_records(cycle_id, record_date desc);

create trigger mortality_records_set_updated_at
before update on public.mortality_records
for each row
execute function public.set_updated_at();

create table if not exists public.feeding_records (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.production_cycles(id) on delete cascade,
  daily_record_id uuid not null references public.daily_records(id) on delete cascade,
  record_date date not null,
  food_kg numeric(10, 2) not null default 0 check (food_kg >= 0),
  ration_count integer check (ration_count is null or ration_count >= 0),
  food_type text,
  protein_percentage numeric(5, 2) check (
    protein_percentage is null or (protein_percentage >= 0 and protein_percentage <= 100)
  ),
  food_cost numeric(14, 2) check (food_cost is null or food_cost >= 0),
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feeding_records_unique_cycle_date unique (cycle_id, record_date)
);

create index if not exists feeding_records_cycle_date_idx
on public.feeding_records(cycle_id, record_date desc);

create trigger feeding_records_set_updated_at
before update on public.feeding_records
for each row
execute function public.set_updated_at();

alter table public.daily_records enable row level security;
alter table public.mortality_records enable row level security;
alter table public.feeding_records enable row level security;

create policy "daily_records_select_authenticated"
on public.daily_records
for select
to authenticated
using (true);

create policy "daily_records_insert_authenticated"
on public.daily_records
for insert
to authenticated
with check (true);

create policy "daily_records_update_authenticated"
on public.daily_records
for update
to authenticated
using (true)
with check (true);

create policy "daily_records_delete_authenticated"
on public.daily_records
for delete
to authenticated
using (true);

create policy "mortality_records_select_authenticated"
on public.mortality_records
for select
to authenticated
using (true);

create policy "mortality_records_insert_authenticated"
on public.mortality_records
for insert
to authenticated
with check (true);

create policy "mortality_records_update_authenticated"
on public.mortality_records
for update
to authenticated
using (true)
with check (true);

create policy "mortality_records_delete_authenticated"
on public.mortality_records
for delete
to authenticated
using (true);

create policy "feeding_records_select_authenticated"
on public.feeding_records
for select
to authenticated
using (true);

create policy "feeding_records_insert_authenticated"
on public.feeding_records
for insert
to authenticated
with check (true);

create policy "feeding_records_update_authenticated"
on public.feeding_records
for update
to authenticated
using (true)
with check (true);

create policy "feeding_records_delete_authenticated"
on public.feeding_records
for delete
to authenticated
using (true);

with demo_cycle as (
  select id from public.production_cycles where code = 'TIL-2026-001' limit 1
),
demo_days as (
  select
    demo_cycle.id as cycle_id,
    (current_date - (offset_days || ' days')::interval)::date as record_date,
    mortality,
    food_kg,
    ration_count,
    temperature_c,
    ph,
    dissolved_oxygen_mg_l
  from demo_cycle
  cross join (
    values
      (5, 8, 42.5, 3, 27.4, 7.2, 5.8),
      (4, 5, 41.0, 3, 27.1, 7.1, 5.6),
      (3, 7, 43.0, 3, 27.8, 7.3, 5.9),
      (2, 4, 44.0, 3, 28.0, 7.0, 5.7),
      (1, 6, 45.5, 4, 27.6, 7.2, 6.0)
  ) as sample(offset_days, mortality, food_kg, ration_count, temperature_c, ph, dissolved_oxygen_mg_l)
),
inserted_daily as (
  insert into public.daily_records (
    cycle_id,
    record_date,
    temperature_c,
    ph,
    dissolved_oxygen_mg_l,
    observations
  )
  select
    cycle_id,
    record_date,
    temperature_c,
    ph,
    dissolved_oxygen_mg_l,
    'Registro demo de Fase 3'
  from demo_days
  on conflict (cycle_id, record_date) do nothing
  returning id, cycle_id, record_date
)
insert into public.mortality_records (
  cycle_id,
  daily_record_id,
  record_date,
  quantity,
  observations
)
select
  demo_days.cycle_id,
  daily_records.id,
  demo_days.record_date,
  demo_days.mortality,
  'Mortalidad demo'
from demo_days
join public.daily_records
  on daily_records.cycle_id = demo_days.cycle_id
 and daily_records.record_date = demo_days.record_date
on conflict (cycle_id, record_date) do nothing;

with demo_days as (
  select
    production_cycles.id as cycle_id,
    (current_date - (sample.offset_days || ' days')::interval)::date as record_date,
    sample.food_kg,
    sample.ration_count
  from public.production_cycles
  cross join (
    values
      (5, 42.5, 3),
      (4, 41.0, 3),
      (3, 43.0, 3),
      (2, 44.0, 3),
      (1, 45.5, 4)
  ) as sample(offset_days, food_kg, ration_count)
  where production_cycles.code = 'TIL-2026-001'
)
insert into public.feeding_records (
  cycle_id,
  daily_record_id,
  record_date,
  food_kg,
  ration_count,
  food_type,
  protein_percentage,
  observations
)
select
  demo_days.cycle_id,
  daily_records.id,
  demo_days.record_date,
  demo_days.food_kg,
  demo_days.ration_count,
  'Concentrado demo',
  32,
  'Alimentacion demo'
from demo_days
join public.daily_records
  on daily_records.cycle_id = demo_days.cycle_id
 and daily_records.record_date = demo_days.record_date
on conflict (cycle_id, record_date) do nothing;
