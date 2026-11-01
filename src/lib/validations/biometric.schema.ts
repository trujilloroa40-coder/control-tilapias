import { z } from "zod";
import { calculateAverageWeightG } from "@/lib/calculations/cycles";

export const biometricFormSchema = z
  .object({
    cycle_id: z.string().uuid("Ciclo invalido."),
    record_date: z.string().min(1, "Selecciona la fecha."),
    sampled_fish_count: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().int().positive("Debe ser mayor que cero.").optional(),
    ),
    sample_total_weight_kg: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().min(0, "No puede ser negativo.").optional(),
    ),
    avg_weight_g: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().min(0, "No puede ser negativo.").optional(),
    ),
    avg_size_cm: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().min(0, "No puede ser negativa.").optional(),
    ),
    observations: z.string().trim().max(1000).optional(),
  })
  .transform((data) => {
    const calculatedAvgWeight = calculateAverageWeightG(
      data.sampled_fish_count,
      data.sample_total_weight_kg,
    );

    return {
      ...data,
      avg_weight_g: calculatedAvgWeight ?? data.avg_weight_g,
    };
  })
  .refine((data) => data.avg_weight_g !== undefined, {
    path: ["avg_weight_g"],
    message:
      "Ingresa el peso promedio o el numero de peces con el peso total de la muestra.",
  });

export type BiometricFormValues = z.infer<typeof biometricFormSchema>;

export type BiometricFormState = {
  message?: string;
  errors?: Partial<Record<keyof BiometricFormValues | "form", string[]>>;
  values?: Partial<BiometricFormValues>;
};

export function formDataToBiometricValues(formData: FormData) {
  return {
    cycle_id: String(formData.get("cycle_id") || ""),
    record_date: String(formData.get("record_date") || ""),
    sampled_fish_count: formData.get("sampled_fish_count") || undefined,
    sample_total_weight_kg: formData.get("sample_total_weight_kg") || undefined,
    avg_weight_g: formData.get("avg_weight_g") || undefined,
    avg_size_cm: formData.get("avg_size_cm") || undefined,
    observations: String(formData.get("observations") || ""),
  };
}
