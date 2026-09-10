import { z } from "zod";

export const productBomItemSchema = z.object({
    material_product_uid: z.string().min(1, "Bahan baku wajib dipilih"),
    component_type_uid: z.string().nullable().optional(),
    kuantitas_standar: z.coerce.number().positive("Kuantitas standar harus lebih dari 0"),
    tipe_komponen: z.string().nullable().optional(),
    toleransi_waste_pct: z.coerce.number().min(0, "Waste minimal 0%").max(100, "Waste maksimal 100%").optional().default(0),
    catatan: z.string().nullable().optional(),
});

export const productBomBatchSchema = z.object({
    boms: z.array(productBomItemSchema),
});

export const copyBomSchema = z.object({
    source_product_uid: z.string().min(1, "Produk sumber wajib dipilih"),
    ratio: z.coerce.number().positive("Rasio skala harus lebih dari 0").optional().default(1.0),
});

export type ProductBomItemInput = z.infer<typeof productBomItemSchema>;
export type ProductBomBatchInput = z.infer<typeof productBomBatchSchema>;
export type CopyBomInput = z.infer<typeof copyBomSchema>;
