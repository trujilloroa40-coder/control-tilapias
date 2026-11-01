import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CycleClosure } from "@/types/production";

export async function getCycleClosure(cycleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cycle_closures")
    .select("*")
    .eq("cycle_id", cycleId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CycleClosure | null) || null;
}
