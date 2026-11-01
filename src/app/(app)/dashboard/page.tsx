import {
  BadgeDollarSign,
  Fish,
  Scale,
  TrendingUp,
  Utensils,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/cards/stat-card";
import { CycleCard } from "@/components/cycles/cycle-card";
import { getProductionCycles } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";
import { getCycleSummary, getDailyMetrics } from "@/lib/calculations/cycles";
import { formatCurrency, formatKg, formatNumber } from "@/lib/formatters";

export default async function DashboardPage() {
  const cycles = await getProductionCycles();
  const summary = getCycleSummary(cycles);
  const activeCycles = cycles.filter((cycle) => cycle.status === "active");
  const activeDailyRecords = await Promise.all(
    activeCycles.map(async (cycle) => ({
      cycle,
      records: await getDailyRecords(cycle.id),
    })),
  );
  const productionMetrics = activeDailyRecords.reduce(
    (totals, item) => {
      const metrics = getDailyMetrics(item.cycle, item.records);

      return {
        mortality: totals.mortality + metrics.totalMortality,
        estimatedPopulation:
          totals.estimatedPopulation + metrics.estimatedPopulation,
        foodKg: totals.foodKg + metrics.totalFoodKg,
      };
    },
    {
      mortality: 0,
      estimatedPopulation: 0,
      foodKg: 0,
    },
  );

  const stats = [
    {
      label: "Ciclos activos",
      value: formatNumber(summary.activeCount),
      detail: "Lotes actualmente en produccion.",
      icon: Waves,
    },
    {
      label: "Tilapias sembradas",
      value: formatNumber(summary.totalStocked),
      detail: "Total inicial en ciclos activos.",
      icon: Fish,
    },
    {
      label: "Poblacion estimada",
      value: formatNumber(productionMetrics.estimatedPopulation),
      detail: `${formatNumber(productionMetrics.mortality)} mortalidades acumuladas.`,
      icon: TrendingUp,
    },
    {
      label: "Alimento acumulado",
      value: formatKg(productionMetrics.foodKg),
      detail: "Suma de registros diarios activos.",
      icon: Utensils,
    },
    {
      label: "Biomasa inicial",
      value: formatKg(summary.initialBiomassKg),
      detail: "Calculada con peso inicial.",
      icon: Scale,
    },
    {
      label: "Costo alevinos",
      value: formatCurrency(summary.totalFingerlingsCost),
      detail: "Inversion inicial de ciclos activos.",
      icon: BadgeDollarSign,
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-teal-700">
            Dashboard general
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">
            Resumen de produccion
          </h2>
          <p className="mt-3 text-slate-600">
            Los indicadores se calculan con ciclos, mortalidad, alimentacion,
            biometria, gastos y cierres almacenados en Supabase.
          </p>
        </div>
        <Link
          href="/cycles/new"
          className="flex h-12 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Nuevo ciclo
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-950">Ciclos activos</h3>
          <Link href="/cycles" className="text-sm font-semibold text-teal-700">
            Ver todos
          </Link>
        </div>
        {activeCycles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeCycles.map((cycle) => (
              <CycleCard key={cycle.id} cycle={cycle} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
            Aun no hay ciclos activos.
          </div>
        )}
      </section>
    </div>
  );
}
