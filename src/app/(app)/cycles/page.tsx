import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { CycleCard } from "@/components/cycles/cycle-card";
import { getProductionCycles } from "@/features/cycles/queries";
import type { CycleStatus, ProductionCycle } from "@/types/production";

const sections: Array<{
  title: string;
  description: string;
  status: CycleStatus;
}> = [
  {
    title: "Activos",
    description: "Ciclos en produccion.",
    status: "active",
  },
  {
    title: "En preparacion",
    description: "Lotes planificados o listos para siembra.",
    status: "preparation",
  },
  {
    title: "Finalizados",
    description: "Historial disponible para consulta.",
    status: "finished",
  },
];

function CycleSection({
  cycles,
  title,
  description,
}: {
  cycles: ProductionCycle[];
  title: string;
  description: string;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {cycles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          No hay ciclos en esta seccion.
        </div>
      )}
    </section>
  );
}

export default async function CyclesPage() {
  const cycles = await getProductionCycles();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">
            Ciclos de produccion
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Lotes actuales y anteriores
          </h2>
          <p className="mt-2 text-slate-600">
            Consulta, edita y abre el dashboard de cada lote.
          </p>
        </div>
        <Link
          href="/cycles/new"
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          <PlusCircle size={20} />
          Nuevo ciclo
        </Link>
      </section>

      {sections.map((section) => (
        <CycleSection
          key={section.status}
          title={section.title}
          description={section.description}
          cycles={cycles.filter((cycle) => cycle.status === section.status)}
        />
      ))}
    </div>
  );
}
