import { z } from "zod";

export const dailyRecordFormSchema = z.object({
  cycle_id: z.string().uuid("Ciclo invalido."),
  record_date: z.string().min(1, "Selecciona la fecha."),
  mortality_quantity: z.coerce
    .number({ error: "Ingresa la mortalidad del dia." })
    .int("Debe ser un numero entero.")
    .min(0, "No puede ser negativa."),
  food_kg: z.coerce
    .number({ error: "Ingresa los kg de alimento." })
    .min(0, "No puede ser negativo."),
  ration_count: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(0, "No puede ser negativo.").optional(),
  ),
  food_type: z.string().trim().max(120).optional(),
  protein_percentage: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number()
      .min(0, "No puede ser negativo.")
      .max(100, "No puede ser mayor que 100.")
      .optional(),
  ),
  food_cost: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0, "No puede ser negativo.").optional(),
  ),
  temperature_c: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0, "No puede ser negativa.").optional(),
  ),
  ph: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number()
      .min(0, "No puede ser negativo.")
      .max(14, "El pH no puede ser mayor que 14.")
      .optional(),
  ),
  dissolved_oxygen_mg_l: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0, "No puede ser negativo.").optional(),
  ),
  ammonium_mg_l: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0, "No puede ser negativo.").optional(),
  ),
  nitrites_mg_l: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0, "No puede ser negativo.").optional(),
  ),
  observations: z.string().trim().max(1000).optional(),
});

export type DailyRecordFormValues = z.infer<typeof dailyRecordFormSchema>;

export type DailyRecordFormState = {
  message?: string;
  errors?: Partial<Record<keyof DailyRecordFormValues | "form", string[]>>;
  values?: Partial<DailyRecordFormValues>;
};

export function formDataToDailyRecordValues(formData: FormData) {
  return {
    cycle_id: String(formData.get("cycle_id") || ""),
    record_date: String(formData.get("record_date") || ""),
    mortality_quantity: Number(formData.get("mortality_quantity") || 0),
    food_kg: Number(formData.get("food_kg") || 0),
    ration_count: formData.get("ration_count") || undefined,
    food_type: String(formData.get("food_type") || ""),
    protein_percentage: formData.get("protein_percentage") || undefined,
    food_cost: formData.get("food_cost") || undefined,
    temperature_c: formData.get("temperature_c") || undefined,
    ph: formData.get("ph") || undefined,
    dissolved_oxygen_mg_l: formData.get("dissolved_oxygen_mg_l") || undefined,
    ammonium_mg_l: formData.get("ammonium_mg_l") || undefined,
    nitrites_mg_l: formData.get("nitrites_mg_l") || undefined,
    observations: String(formData.get("observations") || ""),
  };
}
