import { z } from "zod";

export const productSchema = z.object({
    nama: z.string().min(1, "Nama produk wajib diisi"),
    merek: z.string().transform((val) => val || "Umum"),
    barcode: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    harga: z.coerce.number().min(0, "Harga tidak boleh kurang dari 0"),
    stok: z.coerce.number().min(0, "Stok tidak boleh kurang dari 0"),
});

export type ProductInput = z.infer<typeof productSchema>;
