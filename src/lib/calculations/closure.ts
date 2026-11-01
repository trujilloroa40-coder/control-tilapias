import {
  daysBetween,
  getInitialBiomassKg,
  getSurvivalPercentage,
} from "@/lib/calculations/cycles";
import { getTotalExpenses } from "@/lib/calculations/finances";
import type {
  CycleClosure,
  DailyRecordWithDetails,
  ExpenseRecord,
  ProductionCycle,
} from "@/types/production";

function safeDivide(numerator: number, denominator: number) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }

  return numerator / denominator;
}

export function getClosureDurationDays(
  cycle: Pick<ProductionCycle, "stocking_date">,
  closure: Pick<CycleClosure, "harvest_date">,
) {
  return daysBetween(cycle.stocking_date, new Date(`${closure.harvest_date}T00:00:00`)) + 1;
}

export function getAccumulatedMortality(records: DailyRecordWithDetails[]) {
  return records.reduce(
    (total, record) => total + Number(record.mortality?.quantity || 0),
    0,
  );
}

export function getAccumulatedFoodKg(records: DailyRecordWithDetails[]) {
  return records.reduce(
    (total, record) => total + Number(record.feeding?.food_kg || 0),
    0,
  );
}

export function getFinalDailyWeightGainG(
  cycle: Pick<ProductionCycle, "stocking_date" | "initial_avg_weight_g">,
  closure: Pick<CycleClosure, "harvest_date" | "final_avg_weight_g">,
) {
  const duration = getClosureDurationDays(cycle, closure);
  return safeDivide(closure.final_avg_weight_g - cycle.initial_avg_weight_g, duration);
}

export function getFinalFcr(
  totalFoodKg: number,
  cycle: Pick<ProductionCycle, "initial_fish_count" | "initial_avg_weight_g">,
  closure: Pick<CycleClosure, "harvested_kg">,
) {
  const initialBiomassKg = getInitialBiomassKg(cycle);
  const biomassGainKg = Number(closure.harvested_kg || 0) - initialBiomassKg;
  return safeDivide(totalFoodKg, biomassGainKg);
}

export function getGrossIncome(
  closure: Pick<CycleClosure, "harvested_kg" | "sale_price_per_kg">,
) {
  return Number(closure.harvested_kg || 0) * Number(closure.sale_price_per_kg || 0);
}

export function buildFinalCycleReport(
  cycle: ProductionCycle,
  closure: CycleClosure,
  dailyRecords: DailyRecordWithDetails[],
  expenses: ExpenseRecord[],
) {
  const mortality = getAccumulatedMortality(dailyRecords);
  const foodKg = getAccumulatedFoodKg(dailyRecords);
  const expensesTotal = getTotalExpenses(expenses);
  const fingerlingsCost = Number(cycle.fingerlings_total_cost || 0);
  const totalCosts = expensesTotal + fingerlingsCost;
  const grossIncome = getGrossIncome(closure);
  const totalIncome = grossIncome + Number(closure.other_income || 0);
  const netProfit = totalIncome - totalCosts;

  return {
    durationDays: getClosureDurationDays(cycle, closure),
    mortality,
    finalSurvivalPercentage: getSurvivalPercentage(cycle, closure.harvested_fish_count),
    finalBiomassKg: Number(closure.harvested_kg || 0),
    dailyWeightGainG: getFinalDailyWeightGainG(cycle, closure),
    totalFoodKg: foodKg,
    fcr: getFinalFcr(foodKg, cycle, closure),
    totalCosts,
    productionCostPerKg: safeDivide(totalCosts, Number(closure.harvested_kg || 0)),
    grossIncome,
    totalIncome,
    netProfit,
    profitabilityPercentage: safeDivide(netProfit, totalCosts) === null
      ? null
      : safeDivide(netProfit, totalCosts)! * 100,
  };
}
