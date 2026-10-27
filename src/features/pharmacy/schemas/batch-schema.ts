import { z } from "zod";

export const batchFormSchema = z.object({
    batch_number: z
        .string()
        .min(1, "Nomor batch wajib diisi")
        .max(50, "Nomor batch maksimal 50 karakter"),
    expired_date: z
        .string()
        .min(1, "Tanggal kadaluarsa wajib diisi"),
    stock: z.coerce
        .number()
        .min(0, "Stok tidak boleh negatif")
        .default(0),
    status: z.enum(["active", "depleted", "expired"]).default("active"),
});

export type BatchFormValues = z.infer<typeof batchFormSchema>;
