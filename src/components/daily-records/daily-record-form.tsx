"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createDailyRecordAction,
  deleteDailyRecordAction,
  updateDailyRecordAction,
} from "@/features/daily-records/actions";
import type { DailyRecordFormState } from "@/lib/validations/daily-record.schema";
import type { DailyRecordWithDetails, ProductionCycle } from "@/types/production";

type DailyRecordFormProps = {
  cycle: ProductionCycle;
  record?: DailyRecordWithDetails;
};

const initialState: DailyRecordFormState = {};

function todayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
}

function fieldError(
  state: DailyRecordFormState,
  field: keyof NonNullable<DailyRecordFormState["errors"]>,
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
        if (
          !window.confirm(
            "¿Eliminar este registro diario? Tambien se eliminara mortalidad y alimentacion de ese dia.",
          )
        ) {
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
  state: DailyRecordFormState,
  record: DailyRecordWithDetails | undefined,
  field: string,
) {
  const stateValues = state.values as Record<string, unknown> | undefined;
  const stateValue = stateValues?.[field];

  if (stateValue !== undefined) {
    return String(stateValue);
  }

  if (!record) {
    return field === "record_date" ? todayInputValue() : "";
  }

  const map: Record<string, unknown> = {
    record_date: record.record_date,
    mortality_quantity: record.mortality?.quantity,
    food_kg: record.feeding?.food_kg,
    ration_count: record.feeding?.ration_count,
    food_type: record.feeding?.food_type,
    protein_percentage: record.feeding?.protein_percentage,
    food_cost: record.feeding?.food_cost,
    temperature_c: record.temperature_c,
    ph: record.ph,
    dissolved_oxygen_mg_l: record.dissolved_oxygen_mg_l,
    ammonium_mg_l: record.ammonium_mg_l,
    nitrites_mg_l: record.nitrites_mg_l,
    observations: record.observations,
  };

  const value = map[field];
  return value === null || value === undefined ? "" : String(value);
}

type NumberFieldProps = {
  id: string;
  label: string;
  state: DailyRecordFormState;
  record?: DailyRecordWithDetails;
  min?: string;
  max?: string;
  step?: string;
};

function NumberField({
  id,
  label,
  state,
  record,
  min = "0",
  max,
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
        min={min}
        max={max}
        step={step}
        defaultValue={valueFor(state, record, id)}
        className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />
      {fieldError(state, id as keyof NonNullable<DailyRecordFormState["errors"]>) ? (
        <p className="text-sm text-red-600">
          {fieldError(state, id as keyof NonNullable<DailyRecordFormState["errors"]>)}
        </p>
      ) : null}
    </div>
  );
}

export function DailyRecordForm({ cycle, record }: DailyRecordFormProps) {
  const action = record ? updateDailyRecordAction : createDailyRecordAction;
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
        {record ? <input type="hidden" name="id" value={record.id} /> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-base font-bold text-slate-950">Datos del dia</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="record_date"
              >
                Fecha
              </label>
              <input
                id="record_date"
                name="record_date"
                type="date"
                defaultValue={valueFor(state, record, "record_date")}
                className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              {fieldError(state, "record_date") ? (
                <p className="text-sm text-red-600">
                  {fieldError(state, "record_date")}
                </p>
              ) : null}
            </div>

            <NumberField
              id="mortality_quantity"
              label="Mortalidad del dia"
              state={state}
              record={record}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-base font-bold text-slate-950">Alimentacion</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <NumberField
              id="food_kg"
              label="Alimento suministrado (kg)"
              state={state}
              record={record}
              step="0.01"
            />
            <NumberField
              id="ration_count"
              label="Numero de raciones"
              state={state}
              record={record}
            />
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="food_type"
              >
                Tipo o marca de alimento
              </label>
              <input
                id="food_type"
                name="food_type"
                defaultValue={valueFor(state, record, "food_type")}
                placeholder="Concentrado 32%"
                className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
            </div>
            <NumberField
              id="protein_percentage"
              label="Proteina (%)"
              state={state}
              record={record}
              max="100"
              step="0.01"
            />
            <NumberField
              id="food_cost"
              label="Costo del alimento"
              state={state}
              record={record}
              step="1"
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-base font-bold text-slate-950">
            Calidad del agua opcional
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <NumberField
              id="temperature_c"
              label="Temperatura (C)"
              state={state}
              record={record}
              step="0.01"
            />
            <NumberField id="ph" label="pH" state={state} record={record} max="14" step="0.01" />
            <NumberField
              id="dissolved_oxygen_mg_l"
              label="Oxigeno disuelto"
              state={state}
              record={record}
              step="0.01"
            />
            <NumberField
              id="ammonium_mg_l"
              label="Amonio"
              state={state}
              record={record}
              step="0.001"
            />
            <NumberField
              id="nitrites_mg_l"
              label="Nitritos"
              state={state}
              record={record}
              step="0.001"
            />
          </div>
        </section>

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
            defaultValue={valueFor(state, record, "observations")}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <SubmitButton label={record ? "Guardar cambios" : "Guardar registro"} />
      </form>

      {record ? (
        <form action={deleteDailyRecordAction}>
          <input type="hidden" name="id" value={record.id} />
          <input type="hidden" name="cycle_id" value={cycle.id} />
          <DeleteButton />
        </form>
      ) : null}
    </div>
  );
}
