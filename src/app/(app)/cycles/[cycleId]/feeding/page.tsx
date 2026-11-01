import { Utensils } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { getProductionCycle } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";
import { getDailyMetrics } from "@/lib/calculations/cycles";
import { formatCurrency, formatDate, formatKg, formatNumber } from "@/lib/formatters";

export default async function FeedingPage({
  params,
}: PageProps<"/cycles/[cycleId]/feeding">) {
  const { cycleId } = await params;
  const [cycle, records] = await Promise.all([
    getProductionCycle(cycleId),
    getDailyRecords(cycleId),
  ]);
  const metrics = getDailyMetrics(cycle, records);
  const foodCost = records.reduce(
    (total, record) => total + Number(record.feeding?.food_cost || 0),
    0,
  );
  const rationCount = records.reduce(
    (total, record) => total + Number(record.feeding?.ration_count || 0),
    0,
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Alimentacion
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{cycle.code}</h2>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Alimento acumulado"
          value={formatKg(metrics.totalFoodKg)}
          detail="Suma de registros diarios."
          icon={Utensils}
        />
        <StatCard
          label="Raciones acumuladas"
          value={formatNumber(rationCount)}
          detail="Total de raciones registradas."
          icon={Utensils}
        />
        <StatCard
          label="Costo alimento"
          value={formatCurrency(foodCost)}
          detail="Solo registros con costo informado."
          icon={Utensils}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Historial</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {records.map((record) => (
            <div
              key={record.id}
              className="grid gap-1 py-3 text-sm sm:grid-cols-4 sm:items-center"
            >
              <span className="font-semibold text-slate-700">
                {formatDate(record.record_date)}
              </span>
              <span className="text-slate-600">
                {formatKg(Number(record.feeding?.food_kg || 0))}
              </span>
              <span className="text-slate-600">
                {record.feeding?.ration_count ?? 0} raciones
              </span>
              <span className="text-slate-600">
                {record.feeding?.food_type || "Sin tipo"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
