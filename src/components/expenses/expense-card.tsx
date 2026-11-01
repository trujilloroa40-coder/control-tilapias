"use client";

import { BadgeDollarSign, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteExpenseAction } from "@/features/expenses/actions";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import {
  expenseCategoryLabels,
  type ExpenseRecord,
} from "@/types/production";

export function ExpenseCard({ record }: { record: ExpenseRecord }) {
  return (
    <article
      id={record.id}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">
            {formatDate(record.expense_date)}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            {record.description || expenseCategoryLabels[record.category]}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {expenseCategoryLabels[record.category]}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cycles/${record.cycle_id}/expenses/${record.id}/edit`}
            className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Editar gasto"
          >
            <Edit size={18} />
          </Link>
          <form action={deleteExpenseAction}>
            <input type="hidden" name="id" value={record.id} />
            <input type="hidden" name="cycle_id" value={record.cycle_id} />
            <button
              type="submit"
              onClick={(event) => {
                if (!window.confirm("¿Eliminar este gasto?")) {
                  event.preventDefault();
                }
              }}
              className="grid size-11 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50"
              aria-label="Eliminar gasto"
            >
              <Trash2 size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
          <BadgeDollarSign size={18} className="text-teal-700" />
          <span>{formatCurrency(Number(record.amount))}</span>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          Cantidad: {record.quantity === null ? "N/D" : formatNumber(Number(record.quantity))}
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          Unitario: {record.unit_cost === null ? "N/D" : formatCurrency(Number(record.unit_cost))}
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          Pago: {record.payment_method || "N/D"}
        </div>
      </div>

      {record.supplier || record.observations ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {record.supplier ? `Proveedor: ${record.supplier}. ` : ""}
          {record.observations || ""}
        </p>
      ) : null}
    </article>
  );
}
