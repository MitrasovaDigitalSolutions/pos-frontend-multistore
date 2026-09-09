import { z } from "zod";

export const productionMaterialSchema = z.object({
    product_uid: z.string().min(1, "Bahan baku wajib dipilih"),
    kuantitas: z.coerce.number().positive("Kuantitas bahan harus lebih dari 0"),
    harga_satuan: z.coerce.number().min(0, "Harga satuan tidak boleh negatif").optional().nullable(),
});

export const productionOutputSchema = z.object({
    product_uid: z.string().min(1, "Barang jadi wajib dipilih"),
    kuantitas: z.coerce.number().positive("Kuantitas barang jadi harus lebih dari 0"),
    hpp_satuan: z.coerce.number().min(0, "HPP satuan tidak boleh negatif").optional().nullable(),
    update_harga_jual: z.boolean().optional().default(false),
    harga_jual_baru: z.coerce.number().min(0).optional().nullable(),
    margin_baru: z.coerce.number().min(0).optional().nullable(),
});

export const productionCreateSchema = z.object({
    tanggal_mulai: z.string().min(1, "Tanggal mulai produksi wajib diisi"),
    tanggal_selesai: z.string().nullable().optional(),
    tanggal: z.string().optional(),
    status: z.enum(["draft", "completed"]).default("draft"),
    catatan: z.string().nullable().optional(),
    materials: z.array(productionMaterialSchema).min(1, "Minimal 1 bahan baku harus dimasukkan"),
    outputs: z.array(productionOutputSchema).min(1, "Minimal 1 hasil barang jadi harus dimasukkan"),
});

export const productionFinalizeSchema = z.object({
    tanggal_selesai: z.string().nullable().optional(),
});

export type ProductionMaterialInput = z.infer<typeof productionMaterialSchema>;
export type ProductionOutputInput = z.infer<typeof productionOutputSchema>;
export type ProductionCreateInput = z.infer<typeof productionCreateSchema>;
export type ProductionFinalizeSchemaInput = z.infer<typeof productionFinalizeSchema>;
