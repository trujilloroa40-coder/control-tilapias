import { BadgeDollarSign, CalendarDays, PlusCircle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { ExpenseCard } from "@/components/expenses/expense-card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getProductionCycle } from "@/features/cycles/queries";
import { getExpenses } from "@/features/expenses/queries";
import {
  getAverageDailyExpense,
  getExpensesByCategory,
  getExpensesByDay,
  getExpensesByMonth,
  getExpensesByWeek,
  getRecentPeriodTotals,
} from "@/lib/calculations/finances";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { expenseCategoryLabels } from "@/types/production";

export default async function ExpensesPage({
  params,
}: PageProps<"/cycles/[cycleId]/expenses">) {
  const { cycleId } = await params;
  const [cycle, expenses] = await Promise.all([
    getProductionCycle(cycleId),
    getExpenses(cycleId),
  ]);
  const totals = getRecentPeriodTotals(expenses);
  const byDay = getExpensesByDay(expenses);
  const byWeek = getExpensesByWeek(expenses);
  const byMonth = getExpensesByMonth(expenses);
  const categoryData = getExpensesByCategory(expenses).map((item) => ({
    category: expenseCategoryLabels[item.category],
    amount: Number(item.amount.toFixed(0)),
  }));

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase text-teal-700">
          Finanzas
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{cycle.code}</h2>
        <p className="mt-2 text-sm text-slate-600">
          Si ingresas cantidad y costo unitario, el valor total se calcula
          automaticamente.
        </p>
        <div className="mt-5">
          <ExpenseForm cycle={cycle} />
        </div>
      </section>

      <section className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Hoy"
            value={formatCurrency(totals.today)}
            detail="Gastos registrados en la fecha actual."
            icon={CalendarDays}
          />
          <StatCard
            label="Semana"
            value={formatCurrency(totals.week)}
            detail="Desde el lunes de la semana actual."
            icon={TrendingUp}
          />
          <StatCard
            label="Mes"
            value={formatCurrency(totals.month)}
            detail="Gastos del mes actual."
            icon={BadgeDollarSign}
          />
          <StatCard
            label="Acumulado"
            value={formatCurrency(totals.accumulated)}
            detail={`Promedio diario: ${formatCurrency(getAverageDailyExpense(expenses))}`}
            icon={BadgeDollarSign}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h3 className="mb-3 text-lg font-bold text-slate-950">
              Gastos por categoria
            </h3>
            <CategoryBarChart data={categoryData} />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Resumen</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Dias con gasto: {byDay.length}</p>
              <p>Semanas con gasto: {byWeek.length}</p>
              <p>Meses con gasto: {byMonth.length}</p>
              <p>
                Ultimo gasto:{" "}
                {expenses[0] ? formatDate(expenses[0].expense_date) : "Sin registros"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PlusCircle size={20} className="text-teal-700" />
            <h3 className="text-lg font-bold text-slate-950">Historial</h3>
          </div>
          {expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Sin gastos registrados.
            </div>
          ) : (
            expenses.map((record) => <ExpenseCard key={record.id} record={record} />)
          )}
        </div>
      </section>
    </div>
  );
}
