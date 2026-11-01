"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedSupabase } from "@/features/auth/server";
import {
  closureFormSchema,
  formDataToClosureValues,
  type ClosureFormState,
  type ClosureFormValues,
} from "@/lib/validations/closure.schema";

type ParsedClosureForm =
  | { ok: true; data: ClosureFormValues }
  | { ok: false; state: ClosureFormState };

function parseClosureForm(formData: FormData): ParsedClosureForm {
  const rawValues = formDataToClosureValues(formData);
  const parsed = closureFormSchema.safeParse(rawValues);

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

function nullableText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function closurePayload(data: ClosureFormValues, userId: string) {
  return {
    cycle_id: data.cycle_id,
    harvest_date: data.harvest_date,
    harvested_fish_count: data.harvested_fish_count,
    harvested_kg: data.harvested_kg,
    final_avg_weight_g: data.final_avg_weight_g,
    sale_price_per_kg: data.sale_price_per_kg,
    other_income: data.other_income,
    observations: nullableText(data.observations),
    created_by: userId,
  };
}

function revalidateClosure(cycleId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/cycles");
  revalidatePath(`/cycles/${cycleId}`);
  revalidatePath(`/cycles/${cycleId}/close`);
  revalidatePath(`/cycles/${cycleId}/final-report`);
  revalidatePath(`/reports?cycle_id=${cycleId}`);
}

export async function saveCycleClosureAction(
  _previousState: ClosureFormState,
  formData: FormData,
): Promise<ClosureFormState> {
  const parsed = parseClosureForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const { data: cycle, error: cycleError } = await supabase
    .from("production_cycles")
    .select("id, stocking_date, status")
    .eq("id", parsed.data.cycle_id)
    .single();

  if (cycleError || !cycle) {
    return {
      message: cycleError?.message || "No se encontro el ciclo.",
      errors: { form: [cycleError?.message || "No se encontro el ciclo."] },
      values: parsed.data,
    };
  }

  if (parsed.data.harvest_date < cycle.stocking_date) {
    return {
      message: "La cosecha no puede ser anterior a la siembra.",
      errors: { harvest_date: ["Selecciona una fecha posterior a la siembra."] },
      values: parsed.data,
    };
  }

  const { data: existingClosure, error: existingError } = await supabase
    .from("cycle_closures")
    .select("id")
    .eq("cycle_id", parsed.data.cycle_id)
    .maybeSingle();

  if (existingError) {
    return {
      message: existingError.message,
      errors: { form: [existingError.message] },
      values: parsed.data,
    };
  }

  if (existingClosure && parsed.data.confirm_finished_edit !== "CONFIRMAR") {
    return {
      message:
        "Este ciclo ya esta finalizado. Escribe CONFIRMAR para modificar datos criticos del cierre.",
      errors: {
        confirm_finished_edit: ["Confirmacion requerida para editar el cierre."],
      },
      values: parsed.data,
    };
  }

  const payload = closurePayload(parsed.data, user.id);
  const result = existingClosure
    ? await supabase.from("cycle_closures").update(payload).eq("id", existingClosure.id)
    : await supabase.from("cycle_closures").insert(payload);

  if (result.error) {
    return {
      message: result.error.message,
      errors: { form: [result.error.message] },
      values: parsed.data,
    };
  }

  const { error: statusError } = await supabase
    .from("production_cycles")
    .update({ status: "finished", estimated_harvest_date: parsed.data.harvest_date })
    .eq("id", parsed.data.cycle_id);

  if (statusError) {
    return {
      message: statusError.message,
      errors: { form: [statusError.message] },
      values: parsed.data,
    };
  }

  revalidateClosure(parsed.data.cycle_id);
  redirect(`/cycles/${parsed.data.cycle_id}/final-report`);
}
