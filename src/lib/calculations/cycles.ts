import type {
  BiometricRecord,
  DailyRecordWithDetails,
  MortalityRecord,
  ProductionCycle,
} from "@/types/production";

const millisecondsPerDay = 1000 * 60 * 60 * 24;

export function daysBetween(startDate: string, endDate = new Date()) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(
    `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(endDate.getDate()).padStart(2, "0")}T00:00:00`,
  );

  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay));
}

export function getCycleProductionDay(cycle: Pick<ProductionCycle, "stocking_date">) {
  return daysBetween(cycle.stocking_date) + 1;
}

export function getInitialBiomassKg(
  cycle: Pick<ProductionCycle, "initial_fish_count" | "initial_avg_weight_g">,
) {
  return (cycle.initial_fish_count * cycle.initial_avg_weight_g) / 1000;
}

export function calculateAverageWeightG(
  sampledFishCount?: number | null,
  sampleTotalWeightKg?: number | null,
) {
  if (!sampledFishCount || sampledFishCount <= 0 || !sampleTotalWeightKg) {
    return null;
  }

  return (sampleTotalWeightKg * 1000) / sampledFishCount;
}

export function getLatestBiometric(records: BiometricRecord[]) {
  return [...records].sort((a, b) => b.record_date.localeCompare(a.record_date))[0] || null;
}

export function getEstimatedBiomassKg(
  estimatedPopulation: number,
  avgWeightG?: number | null,
) {
  if (!avgWeightG || avgWeightG < 0) {
    return 0;
  }

  return (estimatedPopulation * avgWeightG) / 1000;
}

export function getDailyWeightGainG(
  cycle: Pick<ProductionCycle, "stocking_date" | "initial_avg_weight_g">,
  biometric?: Pick<BiometricRecord, "record_date" | "avg_weight_g"> | null,
) {
  if (!biometric) {
    return null;
  }

  const days = daysBetween(cycle.stocking_date, new Date(`${biometric.record_date}T00:00:00`));

  if (days <= 0) {
    return null;
  }

  return (biometric.avg_weight_g - cycle.initial_avg_weight_g) / days;
}

export function getCycleSummary(cycles: ProductionCycle[]) {
  const activeCycles = cycles.filter((cycle) => cycle.status === "active");

  return {
    activeCount: activeCycles.length,
    totalStocked: activeCycles.reduce(
      (total, cycle) => total + cycle.initial_fish_count,
      0,
    ),
    initialBiomassKg: activeCycles.reduce(
      (total, cycle) => total + getInitialBiomassKg(cycle),
      0,
    ),
    totalFingerlingsCost: activeCycles.reduce(
      (total, cycle) => total + Number(cycle.fingerlings_total_cost || 0),
      0,
    ),
  };
}

export function getTotalMortality(records: Array<Pick<MortalityRecord, "quantity">>) {
  return records.reduce((total, record) => total + Number(record.quantity || 0), 0);
}

export function getEstimatedPopulation(
  cycle: Pick<ProductionCycle, "initial_fish_count">,
  totalMortality: number,
) {
  return Math.max(0, cycle.initial_fish_count - totalMortality);
}

export function getMortalityPercentage(
  cycle: Pick<ProductionCycle, "initial_fish_count">,
  totalMortality: number,
) {
  if (cycle.initial_fish_count <= 0) {
    return 0;
  }

  return (totalMortality / cycle.initial_fish_count) * 100;
}

export function getSurvivalPercentage(
  cycle: Pick<ProductionCycle, "initial_fish_count">,
  estimatedPopulation: number,
) {
  if (cycle.initial_fish_count <= 0) {
    return 0;
  }

  return (estimatedPopulation / cycle.initial_fish_count) * 100;
}

export function getTotalFoodKg(records: DailyRecordWithDetails[]) {
  return records.reduce(
    (total, record) => total + Number(record.feeding?.food_kg || 0),
    0,
  );
}

export function getDailyMetrics(cycle: ProductionCycle, records: DailyRecordWithDetails[]) {
  const mortalities = records
    .map((record) => record.mortality)
    .filter((record): record is MortalityRecord => Boolean(record));
  const totalMortality = getTotalMortality(mortalities);
  const estimatedPopulation = getEstimatedPopulation(cycle, totalMortality);

  return {
    totalMortality,
    mortalityPercentage: getMortalityPercentage(cycle, totalMortality),
    estimatedPopulation,
    survivalPercentage: getSurvivalPercentage(cycle, estimatedPopulation),
    totalFoodKg: getTotalFoodKg(records),
  };
}

export function getGrowthMetrics(
  cycle: ProductionCycle,
  records: DailyRecordWithDetails[],
  biometrics: BiometricRecord[],
) {
  const dailyMetrics = getDailyMetrics(cycle, records);
  const latestBiometric = getLatestBiometric(biometrics);
  const currentAvgWeightG = latestBiometric?.avg_weight_g ?? cycle.initial_avg_weight_g;

  return {
    ...dailyMetrics,
    latestBiometric,
    currentAvgWeightG,
    estimatedBiomassKg: getEstimatedBiomassKg(
      dailyMetrics.estimatedPopulation,
      currentAvgWeightG,
    ),
    dailyWeightGainG: getDailyWeightGainG(cycle, latestBiometric),
  };
}
