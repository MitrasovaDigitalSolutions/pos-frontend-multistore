import { z } from "zod";

export const unitConversionSchema = z.object({
    unit_name: z
        .string()
        .min(1, "Nama satuan wajib diisi")
        .max(50, "Maksimal 50 karakter"),
    conversion_factor: z.coerce
        .number()
        .positive("Faktor konversi harus lebih dari 0"),
    barcode: z.string().optional().nullable(),
    price: z.coerce
        .number()
        .min(0, "Harga tidak boleh negatif")
        .optional()
        .nullable(),
});

export type UnitConversionFormValues = z.infer<typeof unitConversionSchema>;
