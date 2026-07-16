import { z } from "zod";

export const productSchema = z.object({
    nama: z.string().min(1, "Nama produk wajib diisi"),
    merek: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || "Umum"),
    barcode: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    harga: z.coerce.number().min(0, "Harga jual tidak boleh kurang dari 0"),
    stok: z.coerce.number(),
    harga_beli: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return Number(val);
    }, z.number().min(0, "Harga beli tidak boleh kurang dari 0").nullable().optional()),
    margin: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return Number(val);
    }, z.number().min(0, "Margin tidak boleh kurang dari 0").max(100, "Margin tidak boleh lebih dari 100").nullable().optional()),
    category_uid: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return String(val);
    }, z.string().nullable().optional()),
    brand_uid: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return String(val);
    }, z.string().nullable().optional()),
    image: z.any().nullable().optional(),
    is_jasa: z.boolean().optional().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;
