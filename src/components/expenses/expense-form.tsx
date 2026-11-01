"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
} from "@/features/expenses/actions";
import type { ExpenseFormState } from "@/lib/validations/expense.schema";
import {
  expenseCategoryLabels,
  type ExpenseRecord,
  type ProductionCycle,
} from "@/types/production";

type ExpenseFormProps = {
  cycle: ProductionCycle;
  expense?: ExpenseRecord;
};

const initialState: ExpenseFormState = {};

function todayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
}

function fieldError(
  state: ExpenseFormState,
  field: keyof NonNullable<ExpenseFormState["errors"]>,
) {
  return state.errors?.[field]?.[0];
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-base font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
    >
      {pending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
      {label}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm("¿Eliminar este gasto?")) {
          event.preventDefault();
        }
      }}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-base font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
    >
      {pending ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
      Eliminar
    </button>
  );
}

function valueFor(
  state: ExpenseFormState,
  expense: ExpenseRecord | undefined,
  field: keyof ExpenseRecord,
) {
  const stateValues = state.values as Record<string, unknown> | undefined;
  const stateValue = stateValues?.[field];

  if (stateValue !== undefined) {
    return String(stateValue);
  }

  if (!expense) {
    return field === "expense_date" ? todayInputValue() : "";
  }

  const value = expense[field];
  return value === null || value === undefined ? "" : String(value);
}

function categoryValue(state: ExpenseFormState, expense?: ExpenseRecord) {
  const stateValues = state.values as Record<string, unknown> | undefined;
  return String(stateValues?.category || expense?.category || "feed");
}

type NumberFieldProps = {
  id: keyof ExpenseRecord;
  label: string;
  state: ExpenseFormState;
  expense?: ExpenseRecord;
  step?: string;
};

function NumberField({
  id,
  label,
  state,
  expense,
  step = "1",
}: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        min="0"
        step={step}
        defaultValue={valueFor(state, expense, id)}
        className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />
      {fieldError(state, id as keyof NonNullable<ExpenseFormState["errors"]>) ? (
        <p className="text-sm text-red-600">
          {fieldError(state, id as keyof NonNullable<ExpenseFormState["errors"]>)}
        </p>
      ) : null}
    </div>
  );
}

export function ExpenseForm({ cycle, expense }: ExpenseFormProps) {
  const action = expense ? updateExpenseAction : createExpenseAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="space-y-4">
      {state.message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="cycle_id" value={cycle.id} />
        {expense ? <input type="hidden" name="id" value={expense.id} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="expense_date"
            >
              Fecha
            </label>
            <input
              id="expense_date"
              name="expense_date"
              type="date"
              defaultValue={valueFor(state, expense, "expense_date")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "expense_date") ? (
              <p className="text-sm text-red-600">{fieldError(state, "expense_date")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="category">
              Categoria
            </label>
            <select
              id="category"
              name="category"
              defaultValue={categoryValue(state, expense)}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            >
              {Object.entries(expenseCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {fieldError(state, "category") ? (
              <p className="text-sm text-red-600">{fieldError(state, "category")}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="description">
              Descripcion
            </label>
            <input
              id="description"
              name="description"
              defaultValue={valueFor(state, expense, "description")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <NumberField id="quantity" label="Cantidad" state={state} expense={expense} step="0.01" />
          <NumberField id="unit_cost" label="Costo unitario" state={state} expense={expense} step="1" />
          <NumberField id="amount" label="Valor total" state={state} expense={expense} step="1" />

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="supplier">
              Proveedor
            </label>
            <input
              id="supplier"
              name="supplier"
              defaultValue={valueFor(state, expense, "supplier")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="payment_method">
              Metodo de pago
            </label>
            <input
              id="payment_method"
              name="payment_method"
              defaultValue={valueFor(state, expense, "payment_method")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="observations">
            Observaciones
          </label>
          <textarea
            id="observations"
            name="observations"
            rows={4}
            defaultValue={valueFor(state, expense, "observations")}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <SubmitButton label={expense ? "Guardar cambios" : "Guardar gasto"} />
      </form>

      {expense ? (
        <form action={deleteExpenseAction}>
          <input type="hidden" name="id" value={expense.id} />
          <input type="hidden" name="cycle_id" value={cycle.id} />
          <DeleteButton />
        </form>
      ) : null}
    </div>
  );
}
