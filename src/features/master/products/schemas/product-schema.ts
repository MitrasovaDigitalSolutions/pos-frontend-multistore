import { z } from "zod";

export const productSchema = z.object({
    nama: z.string().min(1, "Nama produk wajib diisi"),
    merek: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    harga: z.coerce.number().min(0, "Harga jual tidak boleh kurang dari 0").default(0),
    harga_grosir: z.coerce.number().min(0, "Harga grosir tidak boleh kurang dari 0").nullable().optional(),
    min_qty_grosir: z.coerce.number().min(0, "Minimal qty grosir tidak boleh kurang dari 0").nullable().optional(),
    harga_grosir_total: z.coerce.number().min(0).nullable().optional(),
    stok: z.coerce.number().min(0, "Stok tidak boleh kurang dari 0").default(0),
    harga_beli: z.coerce.number().min(0, "Harga beli tidak boleh kurang dari 0").default(0),
    margin: z.coerce.number().nullable().optional().default(0),
    category_uid: z.string().nullable().optional(),
    brand_uid: z.string().nullable().optional(),
    image: z.any().nullable().optional(),
    product_type: z.enum(["finished_good", "raw_material", "jasa"]).optional().default("finished_good"),
    is_jasa: z.boolean().optional().default(false),
    is_raw_material: z.boolean().optional().default(false),
    is_grosir: z.boolean().optional().default(false),
    is_active: z.boolean().optional().default(true),
    status: z.enum(["active", "inactive", "archived"]).optional().default("active"),
});

export type ProductInput = z.infer<typeof productSchema>;
