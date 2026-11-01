"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedSupabase } from "@/features/auth/server";
import {
  expenseFormSchema,
  formDataToExpenseValues,
  type ExpenseFormState,
  type ExpenseFormValues,
} from "@/lib/validations/expense.schema";

type ParsedExpenseForm =
  | { ok: true; data: ExpenseFormValues }
  | { ok: false; state: ExpenseFormState };

function parseExpenseForm(formData: FormData): ParsedExpenseForm {
  const rawValues = formDataToExpenseValues(formData);
  const parsed = expenseFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      ok: false,
      state: {
        message: "Revisa los campos marcados.",
        errors: parsed.error.flatten().fieldErrors,
        values: rawValues as unknown as Partial<ExpenseFormValues>,
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

function expensePayload(data: ExpenseFormValues, userId: string) {
  return {
    cycle_id: data.cycle_id,
    expense_date: data.expense_date,
    category: data.category,
    description: nullableText(data.description),
    quantity: nullableNumber(data.quantity),
    unit_cost: nullableNumber(data.unit_cost),
    amount: Number(data.amount),
    supplier: nullableText(data.supplier),
    payment_method: nullableText(data.payment_method),
    observations: nullableText(data.observations),
    created_by: userId,
  };
}

function revalidateExpenses(cycleId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/cycles");
  revalidatePath(`/cycles/${cycleId}`);
  revalidatePath(`/cycles/${cycleId}/expenses`);
}

export async function createExpenseAction(
  _previousState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const parsed = parseExpenseForm(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const { data, error } = await supabase
    .from("expense_records")
    .insert(expensePayload(parsed.data, user.id))
    .select("id")
    .single();

  if (error) {
    return {
      message: error.message,
      errors: { form: [error.message] },
      values: parsed.data,
    };
  }

  revalidateExpenses(parsed.data.cycle_id);
  redirect(`/cycles/${parsed.data.cycle_id}/expenses#${data.id}`);
}

export async function updateExpenseAction(
  _previousState: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const id = String(formData.get("id") || "");
  const parsed = parseExpenseForm(formData);

  if (!id) {
    return {
      message: "No se encontro el gasto.",
      errors: { form: ["Falta el ID del gasto."] },
    };
  }

  if (!parsed.ok) {
    return parsed.state;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("expense_records")
    .update(expensePayload(parsed.data, user.id))
    .eq("id", id);

  if (error) {
    return {
      message: error.message,
      errors: { form: [error.message] },
      values: parsed.data,
    };
  }

  revalidateExpenses(parsed.data.cycle_id);
  redirect(`/cycles/${parsed.data.cycle_id}/expenses#${id}`);
}

export async function deleteExpenseAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const cycleId = String(formData.get("cycle_id") || "");

  if (!id || !cycleId) {
    throw new Error("Faltan datos para eliminar el gasto.");
  }

  const { supabase } = await getAuthenticatedSupabase();
  const { error } = await supabase.from("expense_records").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateExpenses(cycleId);
  redirect(`/cycles/${cycleId}/expenses`);
}
