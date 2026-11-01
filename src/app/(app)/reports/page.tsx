import {
  BadgeDollarSign,
  CalendarDays,
  Fish,
  Scale,
  TrendingUp,
  Utensils,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/cards/stat-card";
import { getBiometrics } from "@/features/biometrics/queries";
import { getCycleClosure } from "@/features/closures/queries";
import { getProductionCycles } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";
import { getExpenses } from "@/features/expenses/queries";
import {
  buildCycleReport,
  daysInRange,
  isValidReportRange,
  resolveReportRange,
  todayKey,
  type ReportType,
} from "@/lib/calculations/reports";
import {
  formatCurrency,
  formatDate,
  formatKg,
  formatNumber,
  formatPercent,
} from "@/lib/formatters";

const reportTypeLabels: Record<ReportType, string> = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
  custom: "Personalizado",
};

type SearchParams = {
  cycle_id?: string;
  type?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
};

function asReportType(value?: string): ReportType {
  return value === "weekly" || value === "monthly" || value === "custom"
    ? value
    : "daily";
}

function valueOrDefault(value: number | null, suffix = "") {
  return value === null ? "N/D" : `${formatNumber(Number(value.toFixed(2)))}${suffix}`;
}

export default async function ReportsPage({
  searchParams,
}: PageProps<"/reports">) {
  const params = (await searchParams) as SearchParams;
  const cycles = await getProductionCycles();
  const selectedCycle = cycles.find((cycle) => cycle.id === params.cycle_id) || cycles[0];
  const reportType = asReportType(params.type);
  const anchorDate = params.date || todayKey();
  const range = resolveReportRange(
    reportType,
    anchorDate,
    params.start_date,
    params.end_date,
  );
  const rangeIsValid = isValidReportRange(range);

  if (!selectedCycle) {
    return (
      <section className="mx-auto max-w-7xl rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
        No hay ciclos disponibles para generar reportes.
      </section>
    );
  }

  const [dailyRecords, biometrics, expenses, closure] = await Promise.all([
    getDailyRecords(selectedCycle.id),
    getBiometrics(selectedCycle.id),
    getExpenses(selectedCycle.id),
    getCycleClosure(selectedCycle.id),
  ]);
  const report = rangeIsValid
    ? buildCycleReport(selectedCycle, dailyRecords, biometrics, expenses, range)
    : null;
  const finalReport = closure
    ? buildFinalCycleReport(selectedCycle, closure, dailyRecords, expenses)
    : null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700">
              Reportes automaticos
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">
              {selectedCycle.code}
            </h2>
            <p className="mt-2 text-slate-600">
              Generado con registros reales de produccion, biometria, agua y
              finanzas.
            </p>
          </div>
          <Link
            href={`/cycles/${selectedCycle.id}`}
            className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Abrir ciclo
          </Link>
        </div>

        <form className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_0.9fr_auto] lg:items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="cycle_id">
              Ciclo
            </label>
            <select
              id="cycle_id"
              name="cycle_id"
              defaultValue={selectedCycle.id}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            >
              {cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.code} - {cycle.pond}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="type">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              defaultValue={reportType}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            >
              {Object.entries(reportTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="date">
              Fecha base
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={anchorDate}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="start_date">
              Fecha inicial
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={range.startDate}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="end_date">
              Fecha final
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={range.endDate}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <button className="flex h-12 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800">
            Generar
          </button>
        </form>

        {!rangeIsValid ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            La fecha inicial no puede ser posterior a la fecha final.
          </div>
        ) : null}
      </section>

      {report ? (
        <>
          <section className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-teal-200">
                  Reporte {reportTypeLabels[reportType]}
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  {formatDate(report.range.startDate)} - {formatDate(report.range.endDate)}
                </h3>
              </div>
              <div className="rounded-lg bg-white/10 px-4 py-3 text-sm">
                {daysInRange(report.range)} dia(s) incluidos
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Poblacion inicial"
              value={formatNumber(report.population.initial)}
              detail="Peces sembrados al inicio."
              icon={Fish}
            />
            <StatCard
              label="Poblacion estimada"
              value={formatNumber(report.population.estimated)}
              detail={`Supervivencia: ${formatPercent(report.population.survivalPercentage)}`}
              icon={TrendingUp}
            />
            <StatCard
              label="Mortalidad periodo"
              value={formatNumber(report.mortality.period)}
              detail={`Acumulada: ${formatNumber(report.mortality.accumulated)}`}
              icon={Fish}
            />
            <StatCard
              label="Alimento periodo"
              value={formatKg(report.feeding.periodKg)}
              detail={`Acumulado: ${formatKg(report.feeding.accumulatedKg)}`}
              icon={Utensils}
            />
            <StatCard
              label="Ultimo peso promedio"
              value={`${formatNumber(report.growth.currentAvgWeightG)} g`}
              detail={
                report.growth.latestBiometric
                  ? formatDate(report.growth.latestBiometric.record_date)
                  : "Peso inicial del ciclo."
              }
              icon={Scale}
            />
            <StatCard
              label="Biomasa estimada"
              value={formatKg(report.growth.estimatedBiomassKg)}
              detail="Poblacion estimada por peso actual."
              icon={Scale}
            />
            <StatCard
              label="GMD"
              value={valueOrDefault(report.growth.dailyWeightGainG, " g/dia")}
              detail="Ganancia media diaria."
              icon={TrendingUp}
            />
            <StatCard
              label="Gastos periodo"
              value={formatCurrency(report.finances.periodTotal)}
              detail={`Acumulado: ${formatCurrency(report.finances.accumulatedTotal)}`}
              icon={BadgeDollarSign}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Waves size={20} className="text-teal-700" />
                <h3 className="text-lg font-bold text-slate-950">
                  Calidad del agua registrada
                </h3>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-slate-500">
                    <tr className="border-b border-slate-100">
                      <th className="py-2 pr-3">Fecha</th>
                      <th className="py-2 pr-3">Temp</th>
                      <th className="py-2 pr-3">pH</th>
                      <th className="py-2 pr-3">O2</th>
                      <th className="py-2 pr-3">Amonio</th>
                      <th className="py-2 pr-3">Nitritos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.water.records.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-slate-500">
                          Sin mediciones de agua en este periodo.
                        </td>
                      </tr>
                    ) : (
                      report.water.records.map((record) => (
                        <tr key={record.id} className="border-b border-slate-100">
                          <td className="py-3 pr-3 font-semibold text-slate-700">
                            {formatDate(record.record_date)}
                          </td>
                          <td className="py-3 pr-3">{record.temperature_c ?? "N/D"}</td>
                          <td className="py-3 pr-3">{record.ph ?? "N/D"}</td>
                          <td className="py-3 pr-3">
                            {record.dissolved_oxygen_mg_l ?? "N/D"}
                          </td>
                          <td className="py-3 pr-3">{record.ammonium_mg_l ?? "N/D"}</td>
                          <td className="py-3 pr-3">{record.nitrites_mg_l ?? "N/D"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BadgeDollarSign size={20} className="text-teal-700" />
                <h3 className="text-lg font-bold text-slate-950">
                  Gastos del periodo
                </h3>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {report.finances.periodExpenses.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">
                    Sin gastos registrados en este periodo.
                  </p>
                ) : (
                  report.finances.periodExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {expense.description || "Gasto registrado"}
                        </p>
                        <p className="text-slate-500">{formatDate(expense.expense_date)}</p>
                      </div>
                      <p className="font-bold text-slate-950">
                        {formatCurrency(Number(expense.amount))}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays size={20} className="text-teal-700" />
              <h3 className="text-lg font-bold text-slate-950">
                Indicadores finales
              </h3>
            </div>
            {finalReport ? (
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  FCA/FCR: {valueOrDefault(finalReport.fcr)}
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  Cosecha: {formatKg(finalReport.finalBiomassKg)}
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  Utilidad: {formatCurrency(finalReport.netProfit)}
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  Rentabilidad:{" "}
                  {finalReport.profitabilityPercentage === null
                    ? "N/D"
                    : formatPercent(finalReport.profitabilityPercentage)}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                FCA/FCR, cosecha, ingresos, utilidad y rentabilidad se activan
                automaticamente al cerrar el ciclo.
              </p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
import { buildFinalCycleReport } from "@/lib/calculations/closure";
