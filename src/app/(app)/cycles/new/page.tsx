import { CycleForm } from "@/components/cycles/cycle-form";

export default function NewCyclePage() {
  return (
    <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase text-teal-700">
        Nuevo ciclo
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Formulario de siembra
      </h2>
      <p className="mt-2 text-slate-600">
        Registra los datos base del lote. Las fechas y cantidades se validan
        antes de guardar.
      </p>

      <div className="mt-6">
        <CycleForm />
      </div>
    </section>
  );
}
