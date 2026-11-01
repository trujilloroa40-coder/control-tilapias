import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BiometricRecord } from "@/types/production";

export async function getBiometrics(cycleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("biometrics")
    .select("*")
    .eq("cycle_id", cycleId)
    .order("record_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as BiometricRecord[];
}

export async function getBiometric(recordId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("biometrics")
    .select("*")
    .eq("id", recordId)
    .single();

  if (error || !data) {
    notFound();
  }

  return data as BiometricRecord;
}
