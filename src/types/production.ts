export type CycleStatus = "preparation" | "active" | "finished";
export type ExpenseCategory =
  | "feed"
  | "fingerlings"
  | "labor"
  | "energy"
  | "supplies"
  | "maintenance"
  | "medicine"
  | "transport"
  | "other";

export type ProductionCycle = {
  id: string;
  code: string;
  name: string | null;
  pond: string;
  stocking_date: string;
  initial_fish_count: number;
  initial_avg_weight_g: number;
  fingerlings_total_cost: number;
  supplier: string | null;
  estimated_harvest_date: string | null;
  status: CycleStatus;
  observations: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyRecord = {
  id: string;
  cycle_id: string;
  record_date: string;
  temperature_c: number | null;
  ph: number | null;
  dissolved_oxygen_mg_l: number | null;
  ammonium_mg_l: number | null;
  nitrites_mg_l: number | null;
  observations: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type BiometricRecord = {
  id: string;
  cycle_id: string;
  record_date: string;
  sampled_fish_count: number | null;
  sample_total_weight_kg: number | null;
  avg_weight_g: number;
  avg_size_cm: number | null;
  observations: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpenseRecord = {
  id: string;
  cycle_id: string;
  expense_date: string;
  category: ExpenseCategory;
  description: string | null;
  quantity: number | null;
  unit_cost: number | null;
  amount: number;
  supplier: string | null;
  payment_method: string | null;
  observations: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CycleClosure = {
  id: string;
  cycle_id: string;
  harvest_date: string;
  harvested_fish_count: number;
  harvested_kg: number;
  final_avg_weight_g: number;
  sale_price_per_kg: number;
  other_income: number;
  observations: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MortalityRecord = {
  id: string;
  cycle_id: string;
  daily_record_id: string;
  record_date: string;
  quantity: number;
  observations: string | null;
  created_at: string;
  updated_at: string;
};

export type FeedingRecord = {
  id: string;
  cycle_id: string;
  daily_record_id: string;
  record_date: string;
  food_kg: number;
  ration_count: number | null;
  food_type: string | null;
  protein_percentage: number | null;
  food_cost: number | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyRecordWithDetails = DailyRecord & {
  mortality: MortalityRecord | null;
  feeding: FeedingRecord | null;
};

export const cycleStatusLabels: Record<CycleStatus, string> = {
  preparation: "En preparacion",
  active: "Activo",
  finished: "Finalizado",
};

export const cycleStatusStyles: Record<CycleStatus, string> = {
  preparation: "bg-sky-50 text-sky-700 ring-sky-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  finished: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  feed: "Alimento",
  fingerlings: "Alevinos",
  labor: "Mano de obra",
  energy: "Energia",
  supplies: "Insumos",
  maintenance: "Mantenimiento",
  medicine: "Medicamentos",
  transport: "Transporte",
  other: "Otros",
};
