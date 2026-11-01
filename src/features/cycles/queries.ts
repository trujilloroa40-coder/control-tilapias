import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductionCycle } from "@/types/production";

export async function getProductionCycles() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("production_cycles")
    .select("*")
    .order("stocking_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ProductionCycle[];
}

export async function getProductionCycle(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("production_cycles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return data as ProductionCycle;
}
