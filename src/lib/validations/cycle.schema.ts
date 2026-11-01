import { z } from "zod";
import type { CycleStatus } from "@/types/production";

export const cycleStatusSchema = z.enum(["preparation", "active", "finished"]);

export const cycleFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Ingresa un codigo de lote.")
      .max(40, "El codigo es demasiado largo."),
    name: z.string().trim().max(120).optional(),
    pond: z
      .string()
      .trim()
      .min(1, "Ingresa el estanque.")
      .max(80, "El estanque es demasiado largo."),
    stocking_date: z.string().min(1, "Selecciona la fecha de siembra."),
    initial_fish_count: z.coerce
      .number({ error: "Ingresa la cantidad de peces." })
      .int("Debe ser un numero entero.")
      .positive("Debe ser mayor que cero."),
    initial_avg_weight_g: z.coerce
      .number({ error: "Ingresa el peso promedio inicial." })
      .min(0, "No puede ser negativo."),
    fingerlings_total_cost: z.coerce
      .number({ error: "Ingresa el costo de alevinos." })
      .min(0, "No puede ser negativo."),
    supplier: z.string().trim().max(120).optional(),
    estimated_harvest_date: z.string().optional(),
    status: cycleStatusSchema,
    observations: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) =>
      !data.estimated_harvest_date ||
      data.estimated_harvest_date >= data.stocking_date,
    {
      path: ["estimated_harvest_date"],
      message: "La cosecha estimada no puede ser anterior a la siembra.",
    },
  );

export type CycleFormValues = z.infer<typeof cycleFormSchema>;

export type CycleFormState = {
  message?: string;
  errors?: Partial<Record<keyof CycleFormValues | "form", string[]>>;
  values?: Partial<CycleFormValues>;
};

export function formDataToCycleValues(formData: FormData): CycleFormValues {
  return {
    code: String(formData.get("code") || ""),
    name: String(formData.get("name") || ""),
    pond: String(formData.get("pond") || ""),
    stocking_date: String(formData.get("stocking_date") || ""),
    initial_fish_count: Number(formData.get("initial_fish_count") || 0),
    initial_avg_weight_g: Number(formData.get("initial_avg_weight_g") || 0),
    fingerlings_total_cost: Number(formData.get("fingerlings_total_cost") || 0),
    supplier: String(formData.get("supplier") || ""),
    estimated_harvest_date: String(formData.get("estimated_harvest_date") || ""),
    status: String(formData.get("status") || "preparation") as CycleStatus,
    observations: String(formData.get("observations") || ""),
  };
}
