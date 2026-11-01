import type { ExpenseCategory, ExpenseRecord } from "@/types/production";

const millisecondsPerDay = 1000 * 60 * 60 * 24;

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function startOfWeek(value: string) {
  const date = toDate(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return date;
}

function periodKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export function calculateExpenseAmount(
  quantity?: number | null,
  unitCost?: number | null,
  amount?: number | null,
) {
  if (
    quantity !== null &&
    quantity !== undefined &&
    unitCost !== null &&
    unitCost !== undefined
  ) {
    return quantity * unitCost;
  }

  return amount ?? null;
}

export function getTotalExpenses(records: Array<Pick<ExpenseRecord, "amount">>) {
  return records.reduce((total, record) => total + Number(record.amount || 0), 0);
}

export function getExpensesByCategory(records: ExpenseRecord[]) {
  const totals = new Map<ExpenseCategory, number>();

  records.forEach((record) => {
    totals.set(record.category, (totals.get(record.category) || 0) + Number(record.amount || 0));
  });

  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getExpensesByDay(records: ExpenseRecord[]) {
  const totals = new Map<string, number>();

  records.forEach((record) => {
    totals.set(record.expense_date, (totals.get(record.expense_date) || 0) + Number(record.amount || 0));
  });

  return [...totals.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getExpensesByWeek(records: ExpenseRecord[]) {
  const totals = new Map<string, number>();

  records.forEach((record) => {
    const key = periodKey(startOfWeek(record.expense_date));
    totals.set(key, (totals.get(key) || 0) + Number(record.amount || 0));
  });

  return [...totals.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getExpensesByMonth(records: ExpenseRecord[]) {
  const totals = new Map<string, number>();

  records.forEach((record) => {
    const date = toDate(record.expense_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    totals.set(key, (totals.get(key) || 0) + Number(record.amount || 0));
  });

  return [...totals.entries()]
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getRecentPeriodTotals(records: ExpenseRecord[], referenceDate = new Date()) {
  const todayKey = periodKey(referenceDate);
  const weekStart = startOfWeek(todayKey);
  const monthKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;

  return records.reduce(
    (totals, record) => {
      const recordDate = toDate(record.expense_date);
      const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, "0")}`;
      const amount = Number(record.amount || 0);

      if (record.expense_date === todayKey) {
        totals.today += amount;
      }

      if (recordDate.getTime() >= weekStart.getTime()) {
        totals.week += amount;
      }

      if (recordMonth === monthKey) {
        totals.month += amount;
      }

      totals.accumulated += amount;
      return totals;
    },
    { today: 0, week: 0, month: 0, accumulated: 0 },
  );
}

export function getAverageDailyExpense(records: ExpenseRecord[]) {
  if (records.length === 0) {
    return 0;
  }

  const sorted = [...records].sort((a, b) => a.expense_date.localeCompare(b.expense_date));
  const first = toDate(sorted[0].expense_date);
  const last = toDate(sorted[sorted.length - 1].expense_date);
  const days = Math.max(1, Math.floor((last.getTime() - first.getTime()) / millisecondsPerDay) + 1);

  return getTotalExpenses(records) / days;
}
