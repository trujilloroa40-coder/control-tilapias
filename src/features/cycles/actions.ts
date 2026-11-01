"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedSupabase } from "@/features/auth/server";
import {
  cycleFormSchema,
  formDataToCycleValues,
  type CycleFormValues,
  type CycleFormState,
} from "@/lib/validations/cycle.schema";

type ParsedCycleForm =
  | {
      ok: true;
      data: CycleFormValues;
    }
  | {
      ok: false;
      state: CycleFormState;
    };

function parseCycleForm(formData: FormData): ParsedCycleForm {
  const rawValues = formDataToCycleValues(formData);
  const parsed = cycleFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      ok: false,
      state: {
        message: "Revisa los campos marcados.",
        errors: parsed.error.flatten().fieldErrors,
        values: rawValues,
      },
    };
  }

  return { ok: true, data: parsed.data };
}

function normalizeNullableText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function cyclePayload(data: CycleFormValues) {
  return {
    code: data.code.trim().toUpperCase(),
    name: normalizeNullableText(data.name),
    pond: data.pond.trim(),
    stocking_date: data.stocking_date,
    initial_fish_count: data.initial_fish_count,
    initial_avg_weight_g: data.initial_avg_weight_g,
    fingerlings_total_cost: data.fingerlings_total_cost,
    supplier: normalizeNullableText(data.supplier),
    estimated_harvest_date: data.estimated_harvest_date || null,
    status: data.status,
    observations: normalizeNullableText(data.observations),
  };
}

export async function createCycleAction(
  _previousState: CycleFormState,
  formData: FormData,
): Promise<CycleFormState> {
  const parsed = parseCycleForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from("production_cycles")
    .insert({
      ...cyclePayload(parsed.data),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return {
      message:
        error.code === "23505"
          ? "Ya existe un ciclo con ese codigo."
          : error.message,
      errors: { form: [error.message] },
      values: parsed.data,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/cycles");
  redirect(`/cycles/${data.id}`);
}

export async function updateCycleAction(
  _previousState: CycleFormState,
  formData: FormData,
): Promise<CycleFormState> {
  const id = String(formData.get("id") || "");
  const parsed = parseCycleForm(formData);

  if (!id) {
    return {
      message: "No se encontro el ciclo a editar.",
      errors: { form: ["Falta el ID del ciclo."] },
    };
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase } = await getAuthenticatedSupabase();
  const { data: currentCycle, error: currentError } = await supabase
    .from("production_cycles")
    .select("status")
    .eq("id", id)
    .single();

  if (currentError || !currentCycle) {
    return {
      message: currentError?.message || "No se encontro el ciclo.",
      errors: { form: [currentError?.message || "No se encontro el ciclo."] },
      values: parsed.data,
    };
  }

  if (
    currentCycle.status === "finished" &&
    String(formData.get("confirm_finished_cycle_edit") || "") !== "on"
  ) {
    return {
      message:
        "Este ciclo esta finalizado. Confirma que deseas modificar datos criticos antes de guardar.",
      errors: {
        form: ["Confirmacion requerida para editar un ciclo finalizado."],
      },
      values: parsed.data,
    };
  }

  const { error } = await supabase
    .from("production_cycles")
    .update(cyclePayload(parsed.data))
    .eq("id", id);

  if (error) {
    return {
      message:
        error.code === "23505"
          ? "Ya existe un ciclo con ese codigo."
          : error.message,
      errors: { form: [error.message] },
      values: parsed.data,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/cycles");
  revalidatePath(`/cycles/${id}`);
  redirect(`/cycles/${id}`);
}

export async function deleteCycleAction(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("Falta el ID del ciclo.");
  }

  const { supabase } = await getAuthenticatedSupabase();
  const { error } = await supabase.from("production_cycles").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/cycles");
  redirect("/cycles");
}
