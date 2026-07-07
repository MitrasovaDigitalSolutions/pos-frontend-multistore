import { z } from "zod";

export const adjustmentSchema = z.object({
    product_uid: z.string().min(1, "Produk wajib dipilih"),
    kuantitas: z.coerce.number().refine((val) => val !== 0, {
        message: "Kuantitas perubahan tidak boleh 0",
    }),
    alasan: z.string().min(1, "Alasan wajib diisi"),
});

export type AdjustmentInput = z.infer<typeof adjustmentSchema>;

