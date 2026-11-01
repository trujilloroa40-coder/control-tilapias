"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedSupabase } from "@/features/auth/server";
import {
  biometricFormSchema,
  formDataToBiometricValues,
  type BiometricFormState,
  type BiometricFormValues,
} from "@/lib/validations/biometric.schema";

type ParsedBiometricForm =
  | { ok: true; data: BiometricFormValues }
  | { ok: false; state: BiometricFormState };

function parseBiometricForm(formData: FormData): ParsedBiometricForm {
  const rawValues = formDataToBiometricValues(formData);
  const parsed = biometricFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      ok: false,
      state: {
        message: "Revisa los campos marcados.",
        errors: parsed.error.flatten().fieldErrors,
        values: rawValues as Partial<BiometricFormValues>,
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

function payload(data: BiometricFormValues, userId: string) {
  return {
    cycle_id: data.cycle_id,
    record_date: data.record_date,
    sampled_fish_count: nullableNumber(data.sampled_fish_count),
    sample_total_weight_kg: nullableNumber(data.sample_total_weight_kg),
    avg_weight_g: data.avg_weight_g,
    avg_size_cm: nullableNumber(data.avg_size_cm),
    observations: nullableText(data.observations),
    created_by: userId,
  };
}

function revalidateBiometrics(cycleId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/cycles/${cycleId}`);
  revalidatePath(`/cycles/${cycleId}/biometrics`);
}

export async function createBiometricAction(
  _previousState: BiometricFormState,
  formData: FormData,
): Promise<BiometricFormState> {
  const parsed = parseBiometricForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from("biometrics")
    .insert(payload(parsed.data, user.id))
    .select("id")
    .single();

  if (error) {
    return {
      message:
        error.code === "23505"
          ? "Ya existe una biometria para este ciclo en esa fecha."
          : error.message,
      errors: { form: [error.message] },
      values: parsed.data,
    };
  }

  revalidateBiometrics(parsed.data.cycle_id);
  redirect(`/cycles/${parsed.data.cycle_id}/biometrics#${data.id}`);
}

export async function updateBiometricAction(
  _previousState: BiometricFormState,
  formData: FormData,
): Promise<BiometricFormState> {
  const id = String(formData.get("id") || "");
  const parsed = parseBiometricForm(formData);

  if (!id) {
    return {
      message: "No se encontro la biometria.",
      errors: { form: ["Falta el ID de la biometria."] },
    };
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("biometrics")
    .update(payload(parsed.data, user.id))
    .eq("id", id);

  if (error) {
    return {
      message:
        error.code === "23505"
          ? "Ya existe otra biometria en esa fecha."
          : error.message,
      errors: { form: [error.message] },
      values: parsed.data,
    };
  }

  revalidateBiometrics(parsed.data.cycle_id);
  redirect(`/cycles/${parsed.data.cycle_id}/biometrics#${id}`);
}

export async function deleteBiometricAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const cycleId = String(formData.get("cycle_id") || "");

  if (!id || !cycleId) {
    throw new Error("Faltan datos para eliminar la biometria.");
  }

  const { supabase } = await getAuthenticatedSupabase();
  const { error } = await supabase.from("biometrics").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateBiometrics(cycleId);
  redirect(`/cycles/${cycleId}/biometrics`);
}
