import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DailyRecord,
  DailyRecordWithDetails,
  FeedingRecord,
  MortalityRecord,
} from "@/types/production";

export async function getDailyRecords(cycleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: dailyRecords, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("cycle_id", cycleId)
    .order("record_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const records = (dailyRecords || []) as DailyRecord[];

  if (records.length === 0) {
    return [];
  }

  const ids = records.map((record) => record.id);

  const [{ data: mortalityRecords, error: mortalityError }, { data: feedingRecords, error: feedingError }] =
    await Promise.all([
      supabase.from("mortality_records").select("*").in("daily_record_id", ids),
      supabase.from("feeding_records").select("*").in("daily_record_id", ids),
    ]);

  if (mortalityError) {
    throw new Error(mortalityError.message);
  }

  if (feedingError) {
    throw new Error(feedingError.message);
  }

  const mortalityByDailyId = new Map(
    ((mortalityRecords || []) as MortalityRecord[]).map((record) => [
      record.daily_record_id,
      record,
    ]),
  );
  const feedingByDailyId = new Map(
    ((feedingRecords || []) as FeedingRecord[]).map((record) => [
      record.daily_record_id,
      record,
    ]),
  );

  return records.map((record) => ({
    ...record,
    mortality: mortalityByDailyId.get(record.id) || null,
    feeding: feedingByDailyId.get(record.id) || null,
  })) satisfies DailyRecordWithDetails[];
}

export async function getDailyRecord(recordId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: dailyRecord, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("id", recordId)
    .single();

  if (error || !dailyRecord) {
    notFound();
  }

  const [{ data: mortalityRecord }, { data: feedingRecord }] = await Promise.all([
    supabase
      .from("mortality_records")
      .select("*")
      .eq("daily_record_id", recordId)
      .maybeSingle(),
    supabase
      .from("feeding_records")
      .select("*")
      .eq("daily_record_id", recordId)
      .maybeSingle(),
  ]);

  return {
    ...(dailyRecord as DailyRecord),
    mortality: (mortalityRecord as MortalityRecord | null) || null,
    feeding: (feedingRecord as FeedingRecord | null) || null,
  } satisfies DailyRecordWithDetails;
}
