import { ClosureForm } from "@/components/closures/closure-form";
import { getCycleClosure } from "@/features/closures/queries";
import { getProductionCycle } from "@/features/cycles/queries";

export default async function CloseCyclePage({
  params,
}: PageProps<"/cycles/[cycleId]/close">) {
  const { cycleId } = await params;
  const [cycle, closure] = await Promise.all([
    getProductionCycle(cycleId),
    getCycleClosure(cycleId),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Cierre de ciclo
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{cycle.code}</h2>
        <p className="mt-2 text-slate-600">
          Registra la cosecha real. Los indicadores finales se calcularan con
          los datos historicos ya almacenados.
        </p>
        <div className="mt-5">
          <ClosureForm cycle={cycle} closure={closure} />
        </div>
      </section>
    </div>
  );
}
