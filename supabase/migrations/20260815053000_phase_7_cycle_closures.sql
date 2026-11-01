create table if not exists public.cycle_closures (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null unique references public.production_cycles(id) on delete cascade,
  harvest_date date not null,
  harvested_fish_count integer not null check (harvested_fish_count >= 0),
  harvested_kg numeric(12, 2) not null check (harvested_kg >= 0),
  final_avg_weight_g numeric(12, 2) not null check (final_avg_weight_g >= 0),
  sale_price_per_kg numeric(14, 2) not null check (sale_price_per_kg >= 0),
  other_income numeric(14, 2) not null default 0 check (other_income >= 0),
  observations text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cycle_closures_harvest_date_idx
on public.cycle_closures(harvest_date desc);

create trigger cycle_closures_set_updated_at
before update on public.cycle_closures
for each row
execute function public.set_updated_at();

alter table public.cycle_closures enable row level security;

create policy "cycle_closures_select_authenticated"
on public.cycle_closures
for select
to authenticated
using (true);

create policy "cycle_closures_insert_authenticated"
on public.cycle_closures
for insert
to authenticated
with check (true);

create policy "cycle_closures_update_authenticated"
on public.cycle_closures
for update
to authenticated
using (true)
with check (true);

create policy "cycle_closures_delete_authenticated"
on public.cycle_closures
for delete
to authenticated
using (true);
