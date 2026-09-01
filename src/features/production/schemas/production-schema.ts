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
    tanggal: z.string().min(1, "Tanggal produksi wajib diisi"),
    catatan: z.string().optional().nullable(),
    materials: z.array(productionMaterialSchema).min(1, "Minimal 1 bahan baku harus dimasukkan"),
    outputs: z.array(productionOutputSchema).min(1, "Minimal 1 hasil barang jadi harus dimasukkan"),
});

export type ProductionMaterialInput = z.infer<typeof productionMaterialSchema>;
export type ProductionOutputInput = z.infer<typeof productionOutputSchema>;
export type ProductionCreateInput = z.infer<typeof productionCreateSchema>;
