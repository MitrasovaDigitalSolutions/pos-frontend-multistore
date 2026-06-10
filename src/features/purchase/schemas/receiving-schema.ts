import { z } from "zod";

export const receivingItemSchema = z.object({
    product_id: z.coerce.number().min(1, "Produk wajib dipilih"),
    kuantitas: z.coerce.number().min(1, "Jumlah minimal 1 pcs"),
    harga_beli: z.coerce.number().min(0, "Harga beli minimal 0"),
    update_harga_jual: z.boolean().default(false),
    harga_jual_baru: z.coerce
        .number()
        .min(0, "Harga jual baru minimal 0")
        .nullable()
        .optional()
        .transform((val) => (val === undefined || val === null ? null : Number(val))),
    margin_baru: z.coerce
        .number()
        .min(0, "Margin baru minimal 0")
        .nullable()
        .optional()
        .transform((val) => (val === undefined || val === null ? null : Number(val))),
});

export const receivingSchema = z.object({
    supplier_id: z.coerce.number().min(1, "Supplier wajib dipilih").nullable().optional(),
    supplier: z.string().nullable().optional(),
    nomor_faktur: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    nilai_faktur: z.coerce
        .number()
        .min(0, "Nilai faktur minimal 0")
        .nullable()
        .optional()
        .transform((val) => (val === undefined || val === null ? null : Number(val))),
    status_pembayaran: z.enum(["pending", "paid"]).default("pending"),
    status: z.enum(["draft", "completed"]).default("completed"),
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
