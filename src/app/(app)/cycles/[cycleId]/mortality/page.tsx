import { Fish } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { getProductionCycle } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";
import {
  getDailyMetrics,
  getEstimatedPopulation,
} from "@/lib/calculations/cycles";
import { formatDate, formatNumber, formatPercent } from "@/lib/formatters";

export default async function MortalityPage({
  params,
}: PageProps<"/cycles/[cycleId]/mortality">) {
  const { cycleId } = await params;
  const [cycle, records] = await Promise.all([
    getProductionCycle(cycleId),
    getDailyRecords(cycleId),
  ]);
  const metrics = getDailyMetrics(cycle, records);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Mortalidad
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{cycle.code}</h2>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Mortalidad acumulada"
          value={formatNumber(metrics.totalMortality)}
          detail={formatPercent(metrics.mortalityPercentage)}
          icon={Fish}
        />
        <StatCard
          label="Poblacion estimada"
          value={formatNumber(getEstimatedPopulation(cycle, metrics.totalMortality))}
          detail="Peces sembrados menos mortalidad."
          icon={Fish}
        />
        <StatCard
          label="Supervivencia"
          value={formatPercent(metrics.survivalPercentage)}
          detail="Estimacion con registros actuales."
          icon={Fish}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Historial</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between gap-4 py-3 text-sm"
            >
              <span className="font-semibold text-slate-700">
                {formatDate(record.record_date)}
              </span>
              <span className="text-slate-600">
                {record.mortality?.quantity ?? 0} peces
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
