import { z } from "zod";

export const receivingItemSchema = z.object({
    product_id: z.coerce.number().min(1, "Produk wajib dipilih"),
    kuantitas: z.coerce.number().min(1, "Jumlah minimal 1 pcs"),
});

export const receivingSchema = z.object({
    supplier: z.string().min(1, "Supplier wajib diisi"),
    nomor_faktur: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    catatan: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    items: z
        .array(receivingItemSchema)
        .min(1, "Minimal harus ada 1 item barang"),
});

export type ReceivingInput = z.infer<typeof receivingSchema>;
