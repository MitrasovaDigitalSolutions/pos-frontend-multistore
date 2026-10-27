import { z } from "zod";

export const unitConversionSchema = z.object({
    unit_name: z
        .string()
        .min(1, "Nama satuan wajib diisi")
        .max(255, "Maksimal 255 karakter"),
    multiplier: z.coerce
        .number()
        .gt(0, "Faktor pengali harus lebih dari 0"),
    selling_price: z.coerce
        .number()
        .min(0, "Harga jual minimal 0")
        .optional()
        .nullable(),
});

export type UnitConversionFormValues = z.infer<typeof unitConversionSchema>;
