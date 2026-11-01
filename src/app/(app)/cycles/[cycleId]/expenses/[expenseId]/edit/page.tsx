import { ExpenseForm } from "@/components/expenses/expense-form";
import { getProductionCycle } from "@/features/cycles/queries";
import { getExpense } from "@/features/expenses/queries";

export default async function EditExpensePage({
  params,
}: PageProps<"/cycles/[cycleId]/expenses/[expenseId]/edit">) {
  const { cycleId, expenseId } = await params;
  const [cycle, expense] = await Promise.all([
    getProductionCycle(cycleId),
    getExpense(expenseId),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Editar gasto
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{cycle.code}</h2>
        <div className="mt-5">
          <ExpenseForm cycle={cycle} expense={expense} />
        </div>
      </section>
    </div>
  );
}
