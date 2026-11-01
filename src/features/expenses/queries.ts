import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExpenseRecord } from "@/types/production";

export async function getExpenses(cycleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expense_records")
    .select("*")
    .eq("cycle_id", cycleId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ExpenseRecord[];
}

export async function getExpense(expenseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("expense_records")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (error || !data) {
    notFound();
  }

  return data as ExpenseRecord;
}
