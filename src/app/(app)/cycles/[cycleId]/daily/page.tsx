import { DailyRecordCard } from "@/components/daily-records/daily-record-card";
import { DailyRecordForm } from "@/components/daily-records/daily-record-form";
import { getProductionCycle } from "@/features/cycles/queries";
import { getDailyRecords } from "@/features/daily-records/queries";

export default async function DailyRecordsPage({
  params,
}: PageProps<"/cycles/[cycleId]/daily">) {
  const { cycleId } = await params;
  const [cycle, records] = await Promise.all([
    getProductionCycle(cycleId),
    getDailyRecords(cycleId),
  ]);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Registro diario
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          {cycle.code}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Formulario optimizado para celular. La fecha no se puede repetir en
          el mismo ciclo.
        </p>
        <div className="mt-5">
          <DailyRecordForm cycle={cycle} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Historial diario</h3>
          <p className="text-sm text-slate-500">
            {records.length} registros guardados.
          </p>
        </div>

        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record) => (
              <DailyRecordCard key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
            Aun no hay registros diarios para este ciclo.
          </div>
        )}
      </section>
    </div>
  );
}
