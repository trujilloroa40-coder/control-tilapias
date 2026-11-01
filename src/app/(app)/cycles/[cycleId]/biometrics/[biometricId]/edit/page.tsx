import { BiometricForm } from "@/components/biometrics/biometric-form";
import { getBiometric } from "@/features/biometrics/queries";
import { getProductionCycle } from "@/features/cycles/queries";
import { formatDate } from "@/lib/formatters";

export default async function EditBiometricPage({
  params,
}: PageProps<"/cycles/[cycleId]/biometrics/[biometricId]/edit">) {
  const { cycleId, biometricId } = await params;
  const [cycle, biometric] = await Promise.all([
    getProductionCycle(cycleId),
    getBiometric(biometricId),
  ]);

  return (
    <section className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <p className="text-sm font-semibold uppercase text-teal-700">
        Editar biometria
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        {cycle.code} · {formatDate(biometric.record_date)}
      </h2>
      <div className="mt-5">
        <BiometricForm cycle={cycle} biometric={biometric} />
      </div>
    </section>
  );
}
