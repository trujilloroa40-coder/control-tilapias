create table if not exists public.expense_records (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.production_cycles(id) on delete cascade,
  expense_date date not null,
  category text not null check (
    category in (
      'feed',
      'fingerlings',
      'labor',
      'energy',
      'supplies',
      'maintenance',
      'medicine',
      'transport',
      'other'
    )
  ),
  description text,
  quantity numeric(12, 2) check (quantity is null or quantity >= 0),
  unit_cost numeric(14, 2) check (unit_cost is null or unit_cost >= 0),
  amount numeric(14, 2) not null check (amount >= 0),
  supplier text,
  payment_method text,
  observations text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expense_records_cycle_date_idx
on public.expense_records(cycle_id, expense_date desc);

create index if not exists expense_records_cycle_category_idx
on public.expense_records(cycle_id, category);

create trigger expense_records_set_updated_at
before update on public.expense_records
for each row
execute function public.set_updated_at();

alter table public.expense_records enable row level security;

create policy "expense_records_select_authenticated"
on public.expense_records
for select
to authenticated
using (true);

create policy "expense_records_insert_authenticated"
on public.expense_records
for insert
to authenticated
with check (true);

create policy "expense_records_update_authenticated"
on public.expense_records
for update
to authenticated
using (true)
with check (true);

create policy "expense_records_delete_authenticated"
on public.expense_records
for delete
to authenticated
using (true);

with demo_cycle as (
  select id, stocking_date from public.production_cycles where code = 'TIL-2026-001' limit 1
)
insert into public.expense_records (
  cycle_id,
  expense_date,
  category,
  description,
  quantity,
  unit_cost,
  amount,
  supplier,
  payment_method,
  observations
)
select
  demo_cycle.id,
  (demo_cycle.stocking_date + (expense.day_number || ' days')::interval)::date,
  expense.category,
  expense.description,
  expense.quantity,
  expense.unit_cost,
  expense.amount,
  expense.supplier,
  expense.payment_method,
  'Gasto demo Fase 5'
from demo_cycle
cross join (
  values
    (7, 'feed', 'Concentrado inicial 32%', 120, 3600, 432000, 'Proveedor alimento', 'Transferencia'),
    (14, 'labor', 'Jornal limpieza estanque', 2, 65000, 130000, 'Equipo finca', 'Efectivo'),
    (28, 'supplies', 'Cal agricola y probiotico', 1, 185000, 185000, 'Agroinsumos demo', 'Transferencia'),
    (42, 'energy', 'Energia aireacion', 1, 92000, 92000, 'Empresa energia', 'Transferencia'),
    (63, 'maintenance', 'Mantenimiento bomba', 1, 240000, 240000, 'Tecnico demo', 'Efectivo'),
    (78, 'medicine', 'Tratamiento preventivo', 1, 135000, 135000, 'Veterinaria demo', 'Transferencia')
) as expense(day_number, category, description, quantity, unit_cost, amount, supplier, payment_method)
where not exists (
  select 1
  from public.expense_records existing
  where existing.cycle_id = demo_cycle.id
    and existing.description = expense.description
    and existing.expense_date = (demo_cycle.stocking_date + (expense.day_number || ' days')::interval)::date
);
