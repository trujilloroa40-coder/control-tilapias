"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedSupabase } from "@/features/auth/server";
import {
  dailyRecordFormSchema,
  formDataToDailyRecordValues,
  type DailyRecordFormState,
  type DailyRecordFormValues,
} from "@/lib/validations/daily-record.schema";

type ParsedDailyForm =
  | {
      ok: true;
      data: DailyRecordFormValues;
    }
  | {
      ok: false;
      state: DailyRecordFormState;
    };

function parseDailyRecordForm(formData: FormData): ParsedDailyForm {
  const rawValues = formDataToDailyRecordValues(formData);
  const parsed = dailyRecordFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      ok: false,
      state: {
        message: "Revisa los campos marcados.",
        errors: parsed.error.flatten().fieldErrors,
        values: rawValues as Partial<DailyRecordFormValues>,
      },
    };
  }

  return { ok: true, data: parsed.data };
}

function nullableText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function nullableNumber(value?: number) {
  return value === undefined || Number.isNaN(value) ? null : value;
}

function dailyPayload(data: DailyRecordFormValues, userId: string) {
  return {
    cycle_id: data.cycle_id,
    record_date: data.record_date,
    temperature_c: nullableNumber(data.temperature_c),
    ph: nullableNumber(data.ph),
    dissolved_oxygen_mg_l: nullableNumber(data.dissolved_oxygen_mg_l),
    ammonium_mg_l: nullableNumber(data.ammonium_mg_l),
    nitrites_mg_l: nullableNumber(data.nitrites_mg_l),
    observations: nullableText(data.observations),
    created_by: userId,
  };
}

function mortalityPayload(data: DailyRecordFormValues, dailyRecordId: string) {
  return {
    cycle_id: data.cycle_id,
    daily_record_id: dailyRecordId,
    record_date: data.record_date,
    quantity: data.mortality_quantity,
    observations: nullableText(data.observations),
  };
}

function feedingPayload(data: DailyRecordFormValues, dailyRecordId: string) {
  return {
    cycle_id: data.cycle_id,
    daily_record_id: dailyRecordId,
    record_date: data.record_date,
    food_kg: data.food_kg,
    ration_count: nullableNumber(data.ration_count),
    food_type: nullableText(data.food_type),
    protein_percentage: nullableNumber(data.protein_percentage),
    food_cost: nullableNumber(data.food_cost),
    observations: nullableText(data.observations),
  };
}

function revalidateCycleDaily(cycleId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/cycles");
  revalidatePath(`/cycles/${cycleId}`);
  revalidatePath(`/cycles/${cycleId}/daily`);
  revalidatePath(`/cycles/${cycleId}/mortality`);
  revalidatePath(`/cycles/${cycleId}/feeding`);
}

export async function createDailyRecordAction(
  _previousState: DailyRecordFormState,
  formData: FormData,
): Promise<DailyRecordFormState> {
  const parsed = parseDailyRecordForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const existing = await supabase
    .from("daily_records")
    .select("id")
    .eq("cycle_id", parsed.data.cycle_id)
    .eq("record_date", parsed.data.record_date)
    .maybeSingle();

  if (existing.error) {
    return {
      message: existing.error.message,
      errors: { form: [existing.error.message] },
      values: parsed.data,
    };
  }

  if (existing.data) {
    return {
      message: "Ya existe un registro para este ciclo en esa fecha.",
      errors: { record_date: ["Cambia la fecha o edita el registro existente."] },
      values: parsed.data,
    };
  }

  const { data: dailyRecord, error: dailyError } = await supabase
    .from("daily_records")
    .insert(dailyPayload(parsed.data, user.id))
    .select("id")
    .single();

  if (dailyError) {
    return {
      message: dailyError.message,
      errors: { form: [dailyError.message] },
      values: parsed.data,
    };
  }

  const [mortalityResult, feedingResult] = await Promise.all([
    supabase
      .from("mortality_records")
      .insert(mortalityPayload(parsed.data, dailyRecord.id)),
    supabase
      .from("feeding_records")
      .insert(feedingPayload(parsed.data, dailyRecord.id)),
  ]);

  const childError = mortalityResult.error || feedingResult.error;

  if (childError) {
    return {
      message: childError.message,
      errors: { form: [childError.message] },
      values: parsed.data,
    };
  }

  revalidateCycleDaily(parsed.data.cycle_id);
  redirect(`/cycles/${parsed.data.cycle_id}/daily`);
}

export async function updateDailyRecordAction(
  _previousState: DailyRecordFormState,
  formData: FormData,
): Promise<DailyRecordFormState> {
  const id = String(formData.get("id") || "");
  const parsed = parseDailyRecordForm(formData);

  if (!id) {
    return {
      message: "No se encontro el registro diario.",
      errors: { form: ["Falta el ID del registro."] },
    };
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const existing = await supabase
    .from("daily_records")
    .select("id")
    .eq("cycle_id", parsed.data.cycle_id)
    .eq("record_date", parsed.data.record_date)
    .neq("id", id)
    .maybeSingle();

  if (existing.error) {
    return {
      message: existing.error.message,
      errors: { form: [existing.error.message] },
      values: parsed.data,
    };
  }

  if (existing.data) {
    return {
      message: "Ya existe otro registro para este ciclo en esa fecha.",
      errors: { record_date: ["Elige otra fecha o edita ese registro."] },
      values: parsed.data,
    };
  }

  const { error: dailyError } = await supabase
    .from("daily_records")
    .update(dailyPayload(parsed.data, user.id))
    .eq("id", id);

  if (dailyError) {
    return {
      message: dailyError.message,
      errors: { form: [dailyError.message] },
      values: parsed.data,
    };
  }

  const [mortalityResult, feedingResult] = await Promise.all([
    supabase
      .from("mortality_records")
      .update(mortalityPayload(parsed.data, id))
      .eq("daily_record_id", id),
    supabase
      .from("feeding_records")
      .update(feedingPayload(parsed.data, id))
      .eq("daily_record_id", id),
  ]);

  const childError = mortalityResult.error || feedingResult.error;

  if (childError) {
    return {
      message: childError.message,
      errors: { form: [childError.message] },
      values: parsed.data,
    };
  }

  revalidateCycleDaily(parsed.data.cycle_id);
  redirect(`/cycles/${parsed.data.cycle_id}/daily`);
}

export async function deleteDailyRecordAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const cycleId = String(formData.get("cycle_id") || "");

  if (!id || !cycleId) {
    throw new Error("Faltan datos para eliminar el registro.");
  }

  const { supabase } = await getAuthenticatedSupabase();
  const { error } = await supabase.from("daily_records").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateCycleDaily(cycleId);
  redirect(`/cycles/${cycleId}/daily`);
}
