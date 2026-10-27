import { z } from "zod";

export const compoundedIngredientSchema = z.object({
    product_uid: z.string().min(1, "Produk bahan wajib dipilih"),
    nama_produk: z.string().min(1, "Nama bahan wajib ada"),
    kuantitas: z.coerce
        .number()
        .positive("Jumlah bahan harus lebih dari 0"),
    base_kuantitas: z.coerce.number().optional(),
    dosis_per_kemasan: z.string().optional().nullable(),
    harga_satuan: z.coerce.number().min(0),
    subtotal: z.coerce.number().min(0),
    stok_tersedia: z.coerce.number().optional(),
    satuan: z.string().optional(),
});

export const compoundedItemFormSchema = z.object({
    nama_racikan: z
        .string()
        .min(1, "Nama racikan wajib diisi")
        .max(100, "Maksimal 100 karakter"),
    jenis_racikan: z.string().min(1, "Bentuk sediaan wajib dipilih"),
    jumlah_kemasan: z.coerce
        .number()
        .int("Jumlah kemasan harus bilangan bulat")
        .min(1, "Jumlah kemasan minimal 1"),
    aturan_pakai: z
        .string()
        .min(1, "Aturan pakai (signa) wajib diisi")
        .max(150, "Maksimal 150 karakter"),
    tuslah_fee: z.coerce
        .number()
        .min(0, "Biaya tuslah tidak boleh negatif")
        .default(0),
    embalase_fee: z.coerce
        .number()
        .min(0, "Biaya embalase tidak boleh negatif")
        .default(0),
    total_harga: z.coerce.number().min(0).default(0),
    ingredients: z
        .array(compoundedIngredientSchema)
        .min(1, "Minimal harus ada 1 bahan obat penyusun"),
    notes: z.string().max(255).optional().nullable(),
});

export type CompoundedIngredientValues = z.infer<typeof compoundedIngredientSchema>;
export type CompoundedItemFormValues = z.infer<typeof compoundedItemFormSchema>;
