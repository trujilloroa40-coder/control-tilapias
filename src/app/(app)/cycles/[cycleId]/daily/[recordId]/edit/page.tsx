import { DailyRecordForm } from "@/components/daily-records/daily-record-form";
import { getProductionCycle } from "@/features/cycles/queries";
import { getDailyRecord } from "@/features/daily-records/queries";
import { formatDate } from "@/lib/formatters";

export default async function EditDailyRecordPage({
  params,
}: PageProps<"/cycles/[cycleId]/daily/[recordId]/edit">) {
  const { cycleId, recordId } = await params;
  const [cycle, record] = await Promise.all([
    getProductionCycle(cycleId),
    getDailyRecord(recordId),
  ]);

  return (
    <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <p className="text-sm font-semibold uppercase text-teal-700">
        Editar registro diario
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        {cycle.code} · {formatDate(record.record_date)}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Actualiza mortalidad, alimentacion y observaciones del dia.
      </p>
      <div className="mt-5">
        <DailyRecordForm cycle={cycle} record={record} />
      </div>
    </section>
  );
}
