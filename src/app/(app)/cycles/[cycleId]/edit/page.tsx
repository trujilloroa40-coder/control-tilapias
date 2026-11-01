import { CycleForm } from "@/components/cycles/cycle-form";
import { getProductionCycle } from "@/features/cycles/queries";

export default async function EditCyclePage({
  params,
}: PageProps<"/cycles/[cycleId]/edit">) {
  const { cycleId } = await params;
  const cycle = await getProductionCycle(cycleId);

  return (
    <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase text-teal-700">
        Editar ciclo
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">{cycle.code}</h2>
      <p className="mt-2 text-slate-600">
        Actualiza datos base, estado o fecha estimada de cosecha.
      </p>

      <div className="mt-6">
        <CycleForm cycle={cycle} />
      </div>
    </section>
  );
}
