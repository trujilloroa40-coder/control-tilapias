import {
  BadgeDollarSign,
  CalendarDays,
  Fish,
  Scale,
  TrendingUp,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/cards/stat-card";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { MetricLineChart } from "@/components/charts/metric-line-chart";
import { PrintButton } from "@/components/reports/print-button";
import { getBiometrics } from "@/features/biometrics/queries";
import { getCycleClosure } from "@/features/closures/queries";
import { getProductionCycle } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";
import { getExpenses } from "@/features/expenses/queries";
import { buildFinalCycleReport } from "@/lib/calculations/closure";
import {
  getExpensesByCategory,
  getExpensesByMonth,
} from "@/lib/calculations/finances";
import {
  formatCurrency,
  formatDate,
  formatKg,
  formatNumber,
  formatPercent,
} from "@/lib/formatters";
import { expenseCategoryLabels } from "@/types/production";

function valueOrDefault(value: number | null, suffix = "") {
  return value === null ? "N/D" : `${formatNumber(Number(value.toFixed(2)))}${suffix}`;
}

export default async function FinalReportPage({
  params,
}: PageProps<"/cycles/[cycleId]/final-report">) {
  const { cycleId } = await params;
  const [cycle, closure, dailyRecords, biometrics, expenses] = await Promise.all([
    getProductionCycle(cycleId),
    getCycleClosure(cycleId),
    getDailyRecords(cycleId),
    getBiometrics(cycleId),
    getExpenses(cycleId),
  ]);

  if (!closure) {
    notFound();
  }

  const report = buildFinalCycleReport(cycle, closure, dailyRecords, expenses);
  const biometricData = [...biometrics]
    .sort((a, b) => a.record_date.localeCompare(b.record_date))
    .map((record) => ({
      date: formatDate(record.record_date),
      peso: Number(record.avg_weight_g),
    }));
  const expenseCategoryData = getExpensesByCategory(expenses).map((item) => ({
    category: expenseCategoryLabels[item.category],
    amount: Number(item.amount.toFixed(0)),
  }));
  const expenseMonthData = getExpensesByMonth(expenses).map((item) => ({
    date: item.month,
    gastos: Number(item.amount.toFixed(0)),
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 print:bg-white">
      <section className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm print:border-slate-300 print:bg-white print:text-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-200 print:text-teal-700">
              Reporte final del ciclo
            </p>
            <h2 className="mt-2 text-3xl font-bold">{cycle.code}</h2>
            <p className="mt-2 text-slate-200 print:text-slate-600">
              Cosecha real: {formatDate(closure.harvest_date)} · Duracion:{" "}
              {report.durationDays} dias
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row print:hidden">
            <PrintButton />
            <Link
              href={`/cycles/${cycle.id}/close`}
              className="flex h-12 items-center justify-center rounded-lg border border-white/30 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Editar cierre
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Peces cosechados"
          value={formatNumber(closure.harvested_fish_count)}
          detail={`Supervivencia: ${formatPercent(report.finalSurvivalPercentage)}`}
          icon={Fish}
        />
        <StatCard
          label="Biomasa final"
          value={formatKg(report.finalBiomassKg)}
          detail={`${formatNumber(Number(closure.final_avg_weight_g))} g promedio final.`}
          icon={Scale}
        />
        <StatCard
          label="Mortalidad acumulada"
          value={formatNumber(report.mortality)}
          detail={`${formatNumber(cycle.initial_fish_count)} peces iniciales.`}
          icon={Fish}
        />
        <StatCard
          label="GMD final"
          value={valueOrDefault(report.dailyWeightGainG, " g/dia")}
          detail="Ganancia media diaria total."
          icon={TrendingUp}
        />
        <StatCard
          label="Alimento total"
          value={formatKg(report.totalFoodKg)}
          detail={`FCA/FCR: ${valueOrDefault(report.fcr)}`}
          icon={Utensils}
        />
        <StatCard
          label="Costos totales"
          value={formatCurrency(report.totalCosts)}
          detail={`Costo/kg: ${
            report.productionCostPerKg === null
              ? "N/D"
              : formatCurrency(report.productionCostPerKg)
          }`}
          icon={BadgeDollarSign}
        />
        <StatCard
          label="Ingresos totales"
          value={formatCurrency(report.totalIncome)}
          detail={`Bruto: ${formatCurrency(report.grossIncome)}`}
          icon={BadgeDollarSign}
        />
        <StatCard
          label="Ganancia neta"
          value={formatCurrency(report.netProfit)}
          detail={`Rentabilidad: ${
            report.profitabilityPercentage === null
              ? "N/D"
              : formatPercent(report.profitabilityPercentage)
          }`}
          icon={TrendingUp}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-bold text-slate-950">
            Evolucion de peso promedio
          </h3>
          <MetricLineChart
            data={biometricData}
            lines={[{ dataKey: "peso", name: "Peso promedio (g)", color: "#0f766e" }]}
          />
        </div>
        <div>
          <h3 className="mb-3 text-lg font-bold text-slate-950">
            Gastos por categoria
          </h3>
          <CategoryBarChart data={expenseCategoryData} />
        </div>
        <div className="xl:col-span-2">
          <h3 className="mb-3 text-lg font-bold text-slate-950">
            Gastos mensuales
          </h3>
          <MetricLineChart
            data={expenseMonthData}
            lines={[{ dataKey: "gastos", name: "Gastos", color: "#2563eb" }]}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} className="text-teal-700" />
            <h3 className="text-lg font-bold text-slate-950">Datos de venta</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Precio venta/kg: {formatCurrency(Number(closure.sale_price_per_kg))}</p>
            <p>Otros ingresos: {formatCurrency(Number(closure.other_income || 0))}</p>
            <p>Fecha de siembra: {formatDate(cycle.stocking_date)}</p>
            <p>Fecha de cosecha: {formatDate(closure.harvest_date)}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Observaciones</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {closure.observations || "Sin observaciones de cierre."}
          </p>
        </div>
      </section>
    </div>
  );
}
