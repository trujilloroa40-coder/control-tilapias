import { Scale, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { BiometricCard } from "@/components/biometrics/biometric-card";
import { BiometricForm } from "@/components/biometrics/biometric-form";
import { MetricLineChart } from "@/components/charts/metric-line-chart";
import { getBiometrics } from "@/features/biometrics/queries";
import { getProductionCycle } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";
import {
  getEstimatedBiomassKg,
  getGrowthMetrics,
} from "@/lib/calculations/cycles";
import { formatDate, formatKg, formatNumber } from "@/lib/formatters";

export default async function BiometricsPage({
  params,
}: PageProps<"/cycles/[cycleId]/biometrics">) {
  const { cycleId } = await params;
  const [cycle, dailyRecords, biometrics] = await Promise.all([
    getProductionCycle(cycleId),
    getDailyRecords(cycleId),
    getBiometrics(cycleId),
  ]);
  const metrics = getGrowthMetrics(cycle, dailyRecords, biometrics);
  const chronological = [...biometrics].sort((a, b) =>
    a.record_date.localeCompare(b.record_date),
  );
  const chartData = chronological.map((record) => ({
    date: formatDate(record.record_date),
    peso: Number(record.avg_weight_g),
    biomasa: Number(
      getEstimatedBiomassKg(metrics.estimatedPopulation, record.avg_weight_g).toFixed(2),
    ),
  }));

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Biometrias
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{cycle.code}</h2>
        <p className="mt-2 text-sm text-slate-600">
          Si ingresas peces muestreados y peso total, el peso promedio se calcula
          automaticamente.
        </p>
        <div className="mt-5">
          <BiometricForm cycle={cycle} />
        </div>
      </section>

      <section className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Ultimo peso promedio"
            value={`${formatNumber(metrics.currentAvgWeightG)} g`}
            detail={metrics.latestBiometric ? formatDate(metrics.latestBiometric.record_date) : "Peso inicial"}
            icon={Scale}
          />
          <StatCard
            label="Biomasa estimada"
            value={formatKg(metrics.estimatedBiomassKg)}
            detail="Poblacion estimada por peso actual."
            icon={Scale}
          />
          <StatCard
            label="GMD"
            value={
              metrics.dailyWeightGainG === null
                ? "N/D"
                : `${formatNumber(Number(metrics.dailyWeightGainG.toFixed(2)))} g/dia`
            }
            detail="Ganancia media diaria."
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-bold text-slate-950">
              Peso promedio vs tiempo
            </h3>
            <MetricLineChart
              data={chartData}
              lines={[{ dataKey: "peso", name: "Peso promedio (g)", color: "#0f766e" }]}
            />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-bold text-slate-950">
              Biomasa estimada
            </h3>
            <MetricLineChart
              data={chartData}
              lines={[{ dataKey: "biomasa", name: "Biomasa (kg)", color: "#2563eb" }]}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-950">Historial</h3>
          {biometrics.map((record) => (
            <BiometricCard key={record.id} record={record} />
          ))}
        </div>
      </section>
    </div>
  );
}
