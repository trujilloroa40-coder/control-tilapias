import { Droplets, Thermometer, Waves } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/cards/stat-card";
import { MetricLineChart } from "@/components/charts/metric-line-chart";
import { getProductionCycle } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";
import { formatDate, formatNumber } from "@/lib/formatters";
import type { DailyRecordWithDetails } from "@/types/production";

type WaterMetricKey =
  | "temperature_c"
  | "ph"
  | "dissolved_oxygen_mg_l"
  | "ammonium_mg_l"
  | "nitrites_mg_l";

function latestValue(records: DailyRecordWithDetails[], key: WaterMetricKey) {
  const record = records.find((item) => item[key] !== null && item[key] !== undefined);
  return record?.[key] ?? null;
}

export default async function WaterQualityPage({
  params,
}: PageProps<"/cycles/[cycleId]/water-quality">) {
  const { cycleId } = await params;
  const [cycle, dailyRecords] = await Promise.all([
    getProductionCycle(cycleId),
    getDailyRecords(cycleId),
  ]);
  const waterRecords = dailyRecords.filter(
    (record) =>
      record.temperature_c !== null ||
      record.ph !== null ||
      record.dissolved_oxygen_mg_l !== null ||
      record.ammonium_mg_l !== null ||
      record.nitrites_mg_l !== null,
  );
  const chartData = [...waterRecords]
    .sort((a, b) => a.record_date.localeCompare(b.record_date))
    .map((record) => ({
      date: formatDate(record.record_date),
      temperatura: record.temperature_c,
      ph: record.ph,
      oxigeno: record.dissolved_oxygen_mg_l,
      amonio: record.ammonium_mg_l,
      nitritos: record.nitrites_mg_l,
    }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">
            Calidad del agua
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {cycle.code}
          </h2>
          <p className="mt-2 text-slate-600">
            Parametros opcionales capturados desde el registro diario.
          </p>
        </div>
        <Link
          href={`/cycles/${cycle.id}/daily`}
          className="flex h-12 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          Registrar medicion
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Temperatura"
          value={
            latestValue(waterRecords, "temperature_c") === null
              ? "N/D"
              : `${formatNumber(Number(latestValue(waterRecords, "temperature_c")))} C`
          }
          detail="Ultimo registro disponible."
          icon={Thermometer}
        />
        <StatCard
          label="pH"
          value={
            latestValue(waterRecords, "ph") === null
              ? "N/D"
              : formatNumber(Number(latestValue(waterRecords, "ph")))
          }
          detail="Ultimo registro disponible."
          icon={Droplets}
        />
        <StatCard
          label="Oxigeno disuelto"
          value={
            latestValue(waterRecords, "dissolved_oxygen_mg_l") === null
              ? "N/D"
              : `${formatNumber(Number(latestValue(waterRecords, "dissolved_oxygen_mg_l")))} mg/L`
          }
          detail="Ultimo registro disponible."
          icon={Waves}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-bold text-slate-950">
            Temperatura, pH y oxigeno
          </h3>
          <MetricLineChart
            data={chartData}
            lines={[
              { dataKey: "temperatura", name: "Temperatura", color: "#dc2626" },
              { dataKey: "ph", name: "pH", color: "#0f766e" },
              { dataKey: "oxigeno", name: "Oxigeno", color: "#2563eb" },
            ]}
          />
        </div>
        <div>
          <h3 className="mb-3 text-lg font-bold text-slate-950">
            Amonio y nitritos
          </h3>
          <MetricLineChart
            data={chartData}
            lines={[
              { dataKey: "amonio", name: "Amonio", color: "#9333ea" },
              { dataKey: "nitritos", name: "Nitritos", color: "#ea580c" },
            ]}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Historial</h3>
        <div className="mt-4 divide-y divide-slate-100">
          {waterRecords.map((record) => (
            <div
              key={record.id}
              className="grid gap-1 py-3 text-sm md:grid-cols-6 md:items-center"
            >
              <span className="font-semibold text-slate-700">
                {formatDate(record.record_date)}
              </span>
              <span>Temp: {record.temperature_c ?? "N/D"}</span>
              <span>pH: {record.ph ?? "N/D"}</span>
              <span>O2: {record.dissolved_oxygen_mg_l ?? "N/D"}</span>
              <span>Amonio: {record.ammonium_mg_l ?? "N/D"}</span>
              <span>Nitritos: {record.nitrites_mg_l ?? "N/D"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
