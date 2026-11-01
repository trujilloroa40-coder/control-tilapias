"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createBiometricAction,
  deleteBiometricAction,
  updateBiometricAction,
} from "@/features/biometrics/actions";
import type { BiometricFormState } from "@/lib/validations/biometric.schema";
import type { BiometricRecord, ProductionCycle } from "@/types/production";

type BiometricFormProps = {
  cycle: ProductionCycle;
  biometric?: BiometricRecord;
};

const initialState: BiometricFormState = {};

function todayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
}

function fieldError(
  state: BiometricFormState,
  field: keyof NonNullable<BiometricFormState["errors"]>,
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
        if (!window.confirm("¿Eliminar esta biometria?")) {
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
  state: BiometricFormState,
  biometric: BiometricRecord | undefined,
  field: keyof BiometricRecord | "cycle_id",
) {
  const stateValues = state.values as Record<string, unknown> | undefined;
  const stateValue = stateValues?.[field];

  if (stateValue !== undefined) {
    return String(stateValue);
  }

  if (!biometric) {
    return field === "record_date" ? todayInputValue() : "";
  }

  const value = biometric[field as keyof BiometricRecord];
  return value === null || value === undefined ? "" : String(value);
}

type NumberFieldProps = {
  id: keyof BiometricRecord;
  label: string;
  state: BiometricFormState;
  biometric?: BiometricRecord;
  step?: string;
};

function NumberField({
  id,
  label,
  state,
  biometric,
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
        defaultValue={valueFor(state, biometric, id)}
        className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      />
      {fieldError(state, id as keyof NonNullable<BiometricFormState["errors"]>) ? (
        <p className="text-sm text-red-600">
          {fieldError(state, id as keyof NonNullable<BiometricFormState["errors"]>)}
        </p>
      ) : null}
    </div>
  );
}

export function BiometricForm({ cycle, biometric }: BiometricFormProps) {
  const action = biometric ? updateBiometricAction : createBiometricAction;
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
        {biometric ? <input type="hidden" name="id" value={biometric.id} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
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
              defaultValue={valueFor(state, biometric, "record_date")}
              className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
            {fieldError(state, "record_date") ? (
              <p className="text-sm text-red-600">{fieldError(state, "record_date")}</p>
            ) : null}
          </div>

          <NumberField
            id="sampled_fish_count"
            label="Peces muestreados"
            state={state}
            biometric={biometric}
          />
          <NumberField
            id="sample_total_weight_kg"
            label="Peso total muestra (kg)"
            state={state}
            biometric={biometric}
            step="0.001"
          />
          <NumberField
            id="avg_weight_g"
            label="Peso promedio (g)"
            state={state}
            biometric={biometric}
            step="0.01"
          />
          <NumberField
            id="avg_size_cm"
            label="Talla promedio (cm)"
            state={state}
            biometric={biometric}
            step="0.01"
          />
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
            defaultValue={valueFor(state, biometric, "observations")}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
          />
        </div>

        <SubmitButton label={biometric ? "Guardar cambios" : "Guardar biometria"} />
      </form>

      {biometric ? (
        <form action={deleteBiometricAction}>
          <input type="hidden" name="id" value={biometric.id} />
          <input type="hidden" name="cycle_id" value={cycle.id} />
          <DeleteButton />
        </form>
      ) : null}
    </div>
  );
}
