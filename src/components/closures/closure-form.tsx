"use client";

import { Loader2, Save } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveCycleClosureAction } from "@/features/closures/actions";
import type { ClosureFormState } from "@/lib/validations/closure.schema";
import type { CycleClosure, ProductionCycle } from "@/types/production";

type ClosureFormProps = {
  cycle: ProductionCycle;
  closure?: CycleClosure | null;
};

const initialState: ClosureFormState = {};

function todayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
}

function fieldError(
  state: ClosureFormState,
  field: keyof NonNullable<ClosureFormState["errors"]>,
) {
  return state.errors?.[field]?.[0];
}

function valueFor(
  state: ClosureFormState,
  closure: CycleClosure | null | undefined,
  field: keyof CycleClosure,
) {
  const stateValues = state.values as Record<string, unknown> | undefined;
  const stateValue = stateValues?.[field];

  if (stateValue !== undefined) {
    return String(stateValue);
  }

  if (!closure) {
    return field === "harvest_date" ? todayInputValue() : "";
  }

  const value = closure[field];
  return value === null || value === undefined ? "" : String(value);
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-base font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
    >
      {pending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
      {isEditing ? "Actualizar cierre" : "Finalizar ciclo"}
    </button>
  );
}

type NumberFieldProps = {
  id: keyof CycleClosure;
  label: string;
  state: ClosureFormState;
  closure?: CycleClosure | null;
  step?: string;
};

function NumberField({ id, label, state, closure, step = "1" }: NumberFieldProps) {
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
        defaultValue={valueFor(state, closure, id)}
        className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />
      {fieldError(state, id as keyof NonNullable<ClosureFormState["errors"]>) ? (
        <p className="text-sm text-red-600">
          {fieldError(state, id as keyof NonNullable<ClosureFormState["errors"]>)}
        </p>
      ) : null}
    </div>
  );
}

export function ClosureForm({ cycle, closure }: ClosureFormProps) {
  const [state, formAction] = useActionState(saveCycleClosureAction, initialState);

  return (
    <div className="space-y-4">
      {state.message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="cycle_id" value={cycle.id} />

        {closure ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Ciclo finalizado</p>
            <p className="mt-1">
              Para modificar este cierre escribe CONFIRMAR en el campo de
              confirmacion.
            </p>
            <input
              name="confirm_finished_edit"
              placeholder="CONFIRMAR"
              className="mt-3 h-11 w-full rounded-lg border border-amber-300 bg-white px-3 font-semibold outline-none"
            />
            {fieldError(state, "confirm_finished_edit") ? (
              <p className="mt-2 text-sm text-red-600">
                {fieldError(state, "confirm_finished_edit")}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="harvest_date">
              Fecha real de cosecha
            </label>
            <input
              id="harvest_date"
              name="harvest_date"
              type="date"
              defaultValue={valueFor(state, closure, "harvest_date")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "harvest_date") ? (
              <p className="text-sm text-red-600">{fieldError(state, "harvest_date")}</p>
            ) : null}
          </div>

          <NumberField id="harvested_fish_count" label="Peces cosechados" state={state} closure={closure} />
          <NumberField id="harvested_kg" label="Kilogramos cosechados" state={state} closure={closure} step="0.01" />
          <NumberField id="final_avg_weight_g" label="Peso promedio final (g)" state={state} closure={closure} step="0.01" />
          <NumberField id="sale_price_per_kg" label="Precio venta por kg" state={state} closure={closure} step="1" />
          <NumberField id="other_income" label="Otros ingresos" state={state} closure={closure} step="1" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="observations">
            Observaciones
          </label>
          <textarea
            id="observations"
            name="observations"
            rows={4}
            defaultValue={valueFor(state, closure, "observations")}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <SubmitButton isEditing={Boolean(closure)} />
      </form>
    </div>
  );
}
