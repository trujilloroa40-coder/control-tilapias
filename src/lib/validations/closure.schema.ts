import { z } from "zod";

const optionalText = z.string().trim().max(1200).optional();

export const closureFormSchema = z.object({
  cycle_id: z.string().uuid("Ciclo invalido."),
  harvest_date: z.string().min(1, "La fecha real de cosecha es obligatoria."),
  harvested_fish_count: z.coerce
    .number({ error: "Ingresa peces cosechados." })
    .int("Debe ser un numero entero.")
    .min(0, "Debe ser mayor o igual a 0."),
  harvested_kg: z.coerce
    .number({ error: "Ingresa kilogramos cosechados." })
    .min(0, "Debe ser mayor o igual a 0."),
  final_avg_weight_g: z.coerce
    .number({ error: "Ingresa peso promedio final." })
    .min(0, "Debe ser mayor o igual a 0."),
  sale_price_per_kg: z.coerce
    .number({ error: "Ingresa precio de venta." })
    .min(0, "Debe ser mayor o igual a 0."),
  other_income: z.coerce
    .number()
    .min(0, "Debe ser mayor o igual a 0.")
    .default(0),
  observations: optionalText,
  confirm_finished_edit: z.string().optional(),
});

export type ClosureFormValues = z.infer<typeof closureFormSchema>;

export type ClosureFormState = {
  message?: string;
  errors?: Partial<Record<keyof ClosureFormValues | "form", string[]>>;
  values?: Partial<ClosureFormValues>;
};

export function formDataToClosureValues(formData: FormData) {
  return {
    cycle_id: String(formData.get("cycle_id") || ""),
    harvest_date: String(formData.get("harvest_date") || ""),
    harvested_fish_count: Number(formData.get("harvested_fish_count") || 0),
    harvested_kg: Number(formData.get("harvested_kg") || 0),
    final_avg_weight_g: Number(formData.get("final_avg_weight_g") || 0),
    sale_price_per_kg: Number(formData.get("sale_price_per_kg") || 0),
    other_income: Number(formData.get("other_income") || 0),
    observations: String(formData.get("observations") || ""),
    confirm_finished_edit: String(formData.get("confirm_finished_edit") || ""),
  };
}
