import {
  BadgeDollarSign,
  CalendarDays,
  Edit,
  Fish,
  Activity,
  Scale,
  TrendingUp,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/cards/stat-card";
import { CycleStatusBadge } from "@/components/cycles/cycle-status-badge";
import { getBiometrics } from "@/features/biometrics/queries";
import { getCycleClosure } from "@/features/closures/queries";
import { getProductionCycle } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";
import { getExpenses } from "@/features/expenses/queries";
import {
  getGrowthMetrics,
  getCycleProductionDay,
} from "@/lib/calculations/cycles";
import { getRecentPeriodTotals } from "@/lib/calculations/finances";
import {
  formatCurrency,
  formatDate,
  formatKg,
  formatNumber,
  formatPercent,
} from "@/lib/formatters";

export default async function CycleDashboardPage({
  params,
}: PageProps<"/cycles/[cycleId]">) {
  const { cycleId } = await params;
  const [cycle, dailyRecords, biometrics, expenses, closure] = await Promise.all([
    getProductionCycle(cycleId),
    getDailyRecords(cycleId),
    getBiometrics(cycleId),
    getExpenses(cycleId),
    getCycleClosure(cycleId),
  ]);
  const productionDay =
    cycle.status === "preparation" ? 0 : getCycleProductionDay(cycle);
  const growthMetrics = getGrowthMetrics(cycle, dailyRecords, biometrics);
  const expenseTotals = getRecentPeriodTotals(expenses);

  const stats = [
    {
      label: "Poblacion inicial",
      value: formatNumber(cycle.initial_fish_count),
      detail: "Peces sembrados al inicio.",
      icon: Fish,
    },
    {
      label: "Poblacion estimada",
      value: formatNumber(growthMetrics.estimatedPopulation),
      detail: "Peces sembrados menos mortalidad.",
      icon: TrendingUp,
    },
    {
      label: "Mortalidad acumulada",
      value: formatNumber(growthMetrics.totalMortality),
      detail: formatPercent(growthMetrics.mortalityPercentage),
      icon: Fish,
    },
    {
      label: "Supervivencia",
      value: formatPercent(growthMetrics.survivalPercentage),
      detail: "Estimacion con registros diarios.",
      icon: TrendingUp,
    },
    {
      label: "Peso inicial",
      value: `${formatNumber(Number(cycle.initial_avg_weight_g))} g`,
      detail: "Peso promedio de siembra.",
      icon: Scale,
    },
    {
      label: "Ultimo peso promedio",
      value: `${formatNumber(growthMetrics.currentAvgWeightG)} g`,
      detail: growthMetrics.latestBiometric
        ? formatDate(growthMetrics.latestBiometric.record_date)
        : "Sin biometria registrada.",
      icon: Scale,
    },
    {
      label: "Alimento acumulado",
      value: formatKg(growthMetrics.totalFoodKg),
      detail: "Suma de alimentacion diaria.",
      icon: Utensils,
    },
    {
      label: "Biomasa estimada",
      value: formatKg(growthMetrics.estimatedBiomassKg),
      detail: "Poblacion estimada por peso actual.",
      icon: Scale,
    },
    {
      label: "GMD",
      value:
        growthMetrics.dailyWeightGainG === null
          ? "N/D"
          : `${formatNumber(Number(growthMetrics.dailyWeightGainG.toFixed(2)))} g/dia`,
      detail: "Ganancia media diaria.",
      icon: Activity,
    },
    {
      label: "Costo alevinos",
      value: formatCurrency(Number(cycle.fingerlings_total_cost || 0)),
      detail: "Costo inicial registrado.",
      icon: BadgeDollarSign,
    },
    {
      label: "Gastos acumulados",
      value: formatCurrency(expenseTotals.accumulated),
      detail: `Mes actual: ${formatCurrency(expenseTotals.month)}`,
      icon: BadgeDollarSign,
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase text-teal-700">
                Dashboard del ciclo
              </p>
              <CycleStatusBadge status={cycle.status} />
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">
              {cycle.code}
            </h2>
            <p className="mt-2 text-slate-600">
              {cycle.name || cycle.pond} · Dia de produccion:{" "}
              <span className="font-semibold text-slate-950">
                {productionDay || "Pendiente"}
              </span>
            </p>
          </div>
          <Link
            href={`/cycles/${cycle.id}/edit`}
            className="flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Edit size={18} />
            Editar ciclo
          </Link>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={17} className="text-teal-700" />
            Inicio: {formatDate(cycle.stocking_date)}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={17} className="text-teal-700" />
            Cosecha estimada: {formatDate(cycle.estimated_harvest_date)}
          </div>
          <div className="flex items-center gap-2">
            <Fish size={17} className="text-teal-700" />
            Estanque: {cycle.pond}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Accesos del ciclo</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[
              { label: "Registro diario", href: `/cycles/${cycle.id}/daily` },
              { label: "Mortalidad", href: `/cycles/${cycle.id}/mortality` },
              { label: "Alimentacion", href: `/cycles/${cycle.id}/feeding` },
              { label: "Calidad agua", href: `/cycles/${cycle.id}/water-quality` },
              { label: "Biometrias", href: `/cycles/${cycle.id}/biometrics` },
              { label: "Gastos", href: `/cycles/${cycle.id}/expenses` },
              { label: "Reportes", href: `/reports?cycle_id=${cycle.id}` },
              { label: "Historial", href: `/cycles/${cycle.id}/daily` },
              {
                label: closure ? "Reporte final" : "Cierre",
                href: closure
                  ? `/cycles/${cycle.id}/final-report`
                  : `/cycles/${cycle.id}/close`,
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex min-h-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-center font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Observaciones</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {cycle.observations || "Sin observaciones registradas."}
          </p>
        </div>
      </section>
    </div>
  );
}
