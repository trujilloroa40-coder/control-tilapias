import {
  getEstimatedBiomassKg,
  getEstimatedPopulation,
  getLatestBiometric,
  getSurvivalPercentage,
  getTotalFoodKg,
  getTotalMortality,
  getDailyWeightGainG,
} from "@/lib/calculations/cycles";
import { getTotalExpenses } from "@/lib/calculations/finances";
import type {
  BiometricRecord,
  DailyRecordWithDetails,
  ExpenseRecord,
  MortalityRecord,
  ProductionCycle,
} from "@/types/production";

export type ReportType = "daily" | "weekly" | "monthly" | "custom";

export type ReportRange = {
  startDate: string;
  endDate: string;
};

export type Phase7ReportFields = {
  fcr: number | null;
  harvestedKg: number | null;
  income: number | null;
  profit: number | null;
  profitabilityPercentage: number | null;
};

const millisecondsPerDay = 1000 * 60 * 60 * 24;

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function todayKey() {
  return dateKey(new Date());
}

export function addDays(value: string, days: number) {
  const date = toDate(value);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function startOfWeek(value: string) {
  const date = toDate(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}

export function startOfMonth(value: string) {
  const date = toDate(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function endOfMonth(value: string) {
  const date = toDate(value);
  return dateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function resolveReportRange(
  type: ReportType,
  anchorDate: string,
  customStart?: string,
  customEnd?: string,
): ReportRange {
  if (type === "daily") {
    return { startDate: anchorDate, endDate: anchorDate };
  }

  if (type === "weekly") {
    return { startDate: startOfWeek(anchorDate), endDate: addDays(startOfWeek(anchorDate), 6) };
  }

  if (type === "monthly") {
    return { startDate: startOfMonth(anchorDate), endDate: endOfMonth(anchorDate) };
  }

  return {
    startDate: customStart || anchorDate,
    endDate: customEnd || anchorDate,
  };
}

export function isValidReportRange(range: ReportRange) {
  return Boolean(range.startDate && range.endDate && range.startDate <= range.endDate);
}

function inRange(recordDate: string, range: ReportRange) {
  return recordDate >= range.startDate && recordDate <= range.endDate;
}

function untilEnd(recordDate: string, range: ReportRange) {
  return recordDate <= range.endDate;
}

function mortalityRecords(records: DailyRecordWithDetails[]) {
  return records
    .map((record) => record.mortality)
    .filter((record): record is MortalityRecord => Boolean(record));
}

export function buildCycleReport(
  cycle: ProductionCycle,
  dailyRecords: DailyRecordWithDetails[],
  biometrics: BiometricRecord[],
  expenses: ExpenseRecord[],
  range: ReportRange,
) {
  const periodDailyRecords = dailyRecords.filter((record) => inRange(record.record_date, range));
  const accumulatedDailyRecords = dailyRecords.filter((record) => untilEnd(record.record_date, range));
  const latestBiometric = getLatestBiometric(
    biometrics.filter((record) => untilEnd(record.record_date, range)),
  );
  const periodExpenses = expenses.filter((record) => inRange(record.expense_date, range));
  const accumulatedExpenses = expenses.filter((record) => untilEnd(record.expense_date, range));
  const periodMortality = getTotalMortality(mortalityRecords(periodDailyRecords));
  const accumulatedMortality = getTotalMortality(mortalityRecords(accumulatedDailyRecords));
  const estimatedPopulation = getEstimatedPopulation(cycle, accumulatedMortality);
  const currentAvgWeightG = latestBiometric?.avg_weight_g ?? cycle.initial_avg_weight_g;
  const waterRecords = periodDailyRecords.filter(
    (record) =>
      record.temperature_c !== null ||
      record.ph !== null ||
      record.dissolved_oxygen_mg_l !== null ||
      record.ammonium_mg_l !== null ||
      record.nitrites_mg_l !== null,
  );

  return {
    range,
    population: {
      initial: cycle.initial_fish_count,
      estimated: estimatedPopulation,
      survivalPercentage: getSurvivalPercentage(cycle, estimatedPopulation),
    },
    mortality: {
      period: periodMortality,
      accumulated: accumulatedMortality,
    },
    feeding: {
      periodKg: getTotalFoodKg(periodDailyRecords),
      accumulatedKg: getTotalFoodKg(accumulatedDailyRecords),
    },
    growth: {
      latestBiometric,
      currentAvgWeightG,
      estimatedBiomassKg: getEstimatedBiomassKg(estimatedPopulation, currentAvgWeightG),
      dailyWeightGainG: getDailyWeightGainG(cycle, latestBiometric),
    },
    water: {
      records: waterRecords,
      latest: waterRecords[0] || null,
    },
    finances: {
      periodExpenses,
      accumulatedExpenses,
      periodTotal: getTotalExpenses(periodExpenses),
      accumulatedTotal: getTotalExpenses(accumulatedExpenses),
    },
    phase7: {
      fcr: null,
      harvestedKg: null,
      income: null,
      profit: null,
      profitabilityPercentage: null,
    } satisfies Phase7ReportFields,
  };
}

export function daysInRange(range: ReportRange) {
  const start = toDate(range.startDate);
  const end = toDate(range.endDate);
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1);
}
