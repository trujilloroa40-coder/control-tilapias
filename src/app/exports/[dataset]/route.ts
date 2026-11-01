import { createSupabaseServerClient } from "@/lib/supabase/server";
import { csvResponse, toCsv } from "@/lib/export/csv";

export const dynamic = "force-dynamic";

type Dataset =
  | "cycles"
  | "daily-records"
  | "mortality"
  | "feeding"
  | "biometrics"
  | "expenses"
  | "closures";

const exportConfig: Record<
  Dataset,
  {
    table: string;
    filename: string;
    columns: Array<{ key: string; label: string }>;
    dateColumn?: string;
  }
> = {
  cycles: {
    table: "production_cycles",
    filename: "ciclos.csv",
    dateColumn: "stocking_date",
    columns: [
      { key: "id", label: "id" },
      { key: "code", label: "codigo" },
      { key: "name", label: "nombre" },
      { key: "pond", label: "estanque" },
      { key: "stocking_date", label: "fecha_siembra" },
      { key: "initial_fish_count", label: "peces_iniciales" },
      { key: "initial_avg_weight_g", label: "peso_inicial_g" },
      { key: "fingerlings_total_cost", label: "costo_alevinos" },
      { key: "status", label: "estado" },
      { key: "estimated_harvest_date", label: "fecha_cosecha_estimada" },
      { key: "supplier", label: "proveedor" },
      { key: "observations", label: "observaciones" },
    ],
  },
  "daily-records": {
    table: "daily_records",
    filename: "registros-diarios.csv",
    dateColumn: "record_date",
    columns: [
      { key: "id", label: "id" },
      { key: "cycle_id", label: "cycle_id" },
      { key: "record_date", label: "fecha" },
      { key: "temperature_c", label: "temperatura_c" },
      { key: "ph", label: "ph" },
      { key: "dissolved_oxygen_mg_l", label: "oxigeno_mg_l" },
      { key: "ammonium_mg_l", label: "amonio_mg_l" },
      { key: "nitrites_mg_l", label: "nitritos_mg_l" },
      { key: "observations", label: "observaciones" },
    ],
  },
  mortality: {
    table: "mortality_records",
    filename: "mortalidad.csv",
    dateColumn: "record_date",
    columns: [
      { key: "id", label: "id" },
      { key: "cycle_id", label: "cycle_id" },
      { key: "daily_record_id", label: "daily_record_id" },
      { key: "record_date", label: "fecha" },
      { key: "quantity", label: "cantidad" },
      { key: "observations", label: "observaciones" },
    ],
  },
  feeding: {
    table: "feeding_records",
    filename: "alimentacion.csv",
    dateColumn: "record_date",
    columns: [
      { key: "id", label: "id" },
      { key: "cycle_id", label: "cycle_id" },
      { key: "daily_record_id", label: "daily_record_id" },
      { key: "record_date", label: "fecha" },
      { key: "food_kg", label: "alimento_kg" },
      { key: "ration_count", label: "raciones" },
      { key: "food_type", label: "tipo_alimento" },
      { key: "protein_percentage", label: "proteina_porcentaje" },
      { key: "food_cost", label: "costo_alimento" },
      { key: "observations", label: "observaciones" },
    ],
  },
  biometrics: {
    table: "biometrics",
    filename: "biometrias.csv",
    dateColumn: "record_date",
    columns: [
      { key: "id", label: "id" },
      { key: "cycle_id", label: "cycle_id" },
      { key: "record_date", label: "fecha" },
      { key: "sampled_fish_count", label: "peces_muestreados" },
      { key: "sample_total_weight_kg", label: "peso_total_muestra_kg" },
      { key: "avg_weight_g", label: "peso_promedio_g" },
      { key: "avg_size_cm", label: "talla_promedio_cm" },
      { key: "observations", label: "observaciones" },
    ],
  },
  expenses: {
    table: "expense_records",
    filename: "gastos.csv",
    dateColumn: "expense_date",
    columns: [
      { key: "id", label: "id" },
      { key: "cycle_id", label: "cycle_id" },
      { key: "expense_date", label: "fecha" },
      { key: "category", label: "categoria" },
      { key: "description", label: "descripcion" },
      { key: "quantity", label: "cantidad" },
      { key: "unit_cost", label: "costo_unitario" },
      { key: "amount", label: "valor_total" },
      { key: "supplier", label: "proveedor" },
      { key: "payment_method", label: "metodo_pago" },
      { key: "observations", label: "observaciones" },
    ],
  },
  closures: {
    table: "cycle_closures",
    filename: "cierres.csv",
    dateColumn: "harvest_date",
    columns: [
      { key: "id", label: "id" },
      { key: "cycle_id", label: "cycle_id" },
      { key: "harvest_date", label: "fecha_cosecha" },
      { key: "harvested_fish_count", label: "peces_cosechados" },
      { key: "harvested_kg", label: "kg_cosechados" },
      { key: "final_avg_weight_g", label: "peso_final_g" },
      { key: "sale_price_per_kg", label: "precio_kg" },
      { key: "other_income", label: "otros_ingresos" },
      { key: "observations", label: "observaciones" },
    ],
  },
};

function isDataset(value: string): value is Dataset {
  return value in exportConfig;
}

export async function GET(
  request: Request,
  context: RouteContext<"/exports/[dataset]">,
) {
  const { dataset } = await context.params;

  if (!isDataset(dataset)) {
    return new Response("Exportacion no encontrada.", { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("No autorizado.", { status: 401 });
  }

  const config = exportConfig[dataset];
  const url = new URL(request.url);
  const cycleId = url.searchParams.get("cycle_id");
  let query = supabase.from(config.table).select("*");

  if (cycleId && dataset !== "cycles") {
    query = query.eq("cycle_id", cycleId);
  }

  if (config.dateColumn) {
    query = query.order(config.dateColumn, { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const rows = (data || []) as Array<Record<string, string | number | boolean | null>>;
  const csv = toCsv(rows, config.columns);

  return csvResponse(config.filename, csv);
}
