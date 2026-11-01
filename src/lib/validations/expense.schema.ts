import { z } from "zod";
import { calculateExpenseAmount } from "@/lib/calculations/finances";
import type { ExpenseCategory } from "@/types/production";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : Number(value)),
  z.number().min(0, "Debe ser mayor o igual a 0.").optional(),
);

const requiredAmount = z.preprocess(
  (value) => (value === "" || value === null ? undefined : Number(value)),
  z.number().min(0, "Debe ser mayor o igual a 0.").optional(),
);

export const expenseCategories = [
  "feed",
  "fingerlings",
  "labor",
  "energy",
  "supplies",
  "maintenance",
  "medicine",
  "transport",
  "other",
] as const;

export const expenseFormSchema = z
  .object({
    cycle_id: z.string().uuid("Ciclo invalido."),
    expense_date: z.string().min(1, "La fecha es obligatoria."),
    category: z.enum(expenseCategories),
    description: z.string().optional(),
    quantity: optionalNumber,
    unit_cost: optionalNumber,
    amount: requiredAmount,
    supplier: z.string().optional(),
    payment_method: z.string().optional(),
    observations: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    amount: calculateExpenseAmount(data.quantity, data.unit_cost, data.amount),
  }))
  .refine((data) => data.amount !== null && data.amount !== undefined, {
    message: "Ingresa el valor total o cantidad y costo unitario.",
    path: ["amount"],
  });

export type ExpenseFormValues = z.infer<typeof expenseFormSchema> & {
  category: ExpenseCategory;
};

export type ExpenseFormState = {
  message?: string;
  errors?: Partial<Record<keyof ExpenseFormValues | "form", string[]>>;
  values?: Partial<ExpenseFormValues>;
};

export function formDataToExpenseValues(formData: FormData) {
  return {
    cycle_id: String(formData.get("cycle_id") || ""),
    expense_date: String(formData.get("expense_date") || ""),
    category: String(formData.get("category") || ""),
    description: String(formData.get("description") || ""),
    quantity: formData.get("quantity"),
    unit_cost: formData.get("unit_cost"),
    amount: formData.get("amount"),
    supplier: String(formData.get("supplier") || ""),
    payment_method: String(formData.get("payment_method") || ""),
    observations: String(formData.get("observations") || ""),
  };
}
