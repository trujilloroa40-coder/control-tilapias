"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createCycleAction,
  deleteCycleAction,
  updateCycleAction,
} from "@/features/cycles/actions";
import type { CycleFormState } from "@/lib/validations/cycle.schema";
import type { ProductionCycle } from "@/types/production";

type CycleFormProps = {
  cycle?: ProductionCycle;
};

const initialState: CycleFormState = {};

function fieldError(state: CycleFormState, field: keyof NonNullable<CycleFormState["errors"]>) {
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
        if (!window.confirm("¿Eliminar este ciclo? Esta accion no se puede deshacer.")) {
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

function inputValue(
  state: CycleFormState,
  cycle: ProductionCycle | undefined,
  field: keyof ProductionCycle,
) {
  const stateValues = state.values as Record<string, unknown> | undefined;
  const stateValue = stateValues?.[field];

  if (stateValue !== undefined) {
    return String(stateValue);
  }

  const cycleValue = cycle?.[field];
  return cycleValue === null || cycleValue === undefined ? "" : String(cycleValue);
}

export function CycleForm({ cycle }: CycleFormProps) {
  const action = cycle ? updateCycleAction : createCycleAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="space-y-4">
      {state.message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-5">
        {cycle ? <input type="hidden" name="id" value={cycle.id} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="code">
              Codigo del lote
            </label>
            <input
              id="code"
              name="code"
              defaultValue={inputValue(state, cycle, "code")}
              placeholder="TIL-2026-001"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "code") ? (
              <p className="text-sm text-red-600">{fieldError(state, "code")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="name">
              Nombre opcional
            </label>
            <input
              id="name"
              name="name"
              defaultValue={inputValue(state, cycle, "name")}
              placeholder="Lote principal"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="pond">
              Estanque
            </label>
            <input
              id="pond"
              name="pond"
              defaultValue={inputValue(state, cycle, "pond")}
              placeholder="Estanque 1"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "pond") ? (
              <p className="text-sm text-red-600">{fieldError(state, "pond")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="status">
              Estado
            </label>
            <select
              id="status"
              name="status"
              defaultValue={inputValue(state, cycle, "status") || "preparation"}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            >
              <option value="preparation">En preparacion</option>
              <option value="active">Activo</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="stocking_date"
            >
              Fecha de siembra
            </label>
            <input
              id="stocking_date"
              name="stocking_date"
              type="date"
              defaultValue={inputValue(state, cycle, "stocking_date")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "stocking_date") ? (
              <p className="text-sm text-red-600">
                {fieldError(state, "stocking_date")}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="estimated_harvest_date"
            >
              Fecha estimada de cosecha
            </label>
            <input
              id="estimated_harvest_date"
              name="estimated_harvest_date"
              type="date"
              defaultValue={inputValue(state, cycle, "estimated_harvest_date")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "estimated_harvest_date") ? (
              <p className="text-sm text-red-600">
                {fieldError(state, "estimated_harvest_date")}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="initial_fish_count"
            >
              Peces sembrados
            </label>
            <input
              id="initial_fish_count"
              name="initial_fish_count"
              type="number"
              min="1"
              defaultValue={inputValue(state, cycle, "initial_fish_count")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "initial_fish_count") ? (
              <p className="text-sm text-red-600">
                {fieldError(state, "initial_fish_count")}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="initial_avg_weight_g"
            >
              Peso promedio inicial (g)
            </label>
            <input
              id="initial_avg_weight_g"
              name="initial_avg_weight_g"
              type="number"
              min="0"
              step="0.01"
              defaultValue={inputValue(state, cycle, "initial_avg_weight_g")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "initial_avg_weight_g") ? (
              <p className="text-sm text-red-600">
                {fieldError(state, "initial_avg_weight_g")}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="fingerlings_total_cost"
            >
              Costo total de alevinos
            </label>
            <input
              id="fingerlings_total_cost"
              name="fingerlings_total_cost"
              type="number"
              min="0"
              step="1"
              defaultValue={inputValue(state, cycle, "fingerlings_total_cost")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "fingerlings_total_cost") ? (
              <p className="text-sm text-red-600">
                {fieldError(state, "fingerlings_total_cost")}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="supplier"
            >
              Proveedor
            </label>
            <input
              id="supplier"
              name="supplier"
              defaultValue={inputValue(state, cycle, "supplier")}
              placeholder="Proveedor de alevinos"
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="observations"
          >
            Observaciones
          </label>
          <textarea
            id="observations"
            name="observations"
            rows={4}
            defaultValue={inputValue(state, cycle, "observations")}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {cycle?.status === "finished" ? (
            <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              <input
                type="checkbox"
                name="confirm_finished_cycle_edit"
                className="mt-1 size-4"
              />
              Confirmo que deseo modificar datos criticos de un ciclo finalizado.
            </label>
          ) : null}
          <SubmitButton label={cycle ? "Guardar cambios" : "Crear ciclo"} />
        </div>
      </form>

      {cycle ? (
        <form action={deleteCycleAction}>
          <input type="hidden" name="id" value={cycle.id} />
          <DeleteButton />
        </form>
      ) : null}
    </div>
  );
}
