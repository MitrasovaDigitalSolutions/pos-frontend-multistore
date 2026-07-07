import { z } from "zod";

export const receivingItemSchema = z.object({
    product_uid: z.string().min(1, "Produk wajib dipilih"),
    kuantitas: z.coerce.number().min(0, "Jumlah minimal 0 pcs"),
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
    supplier_uid: z.string().min(1, "Supplier wajib dipilih").nullable().optional(),
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
    status_pembayaran: z.enum(["pending", "unpaid", "partial", "paid"]).default("pending"),
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

export const receivingHeaderSchema = z.object({
    purchase_order_uid: z.string().nullable().optional(),
    supplier_uid: z.string().nullable().optional(),
    nomor_faktur: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    nilai_faktur: z.coerce.number().min(0, "Nilai faktur minimal 0").default(0),
    tanggal_terima: z.string().min(1, "Tanggal terima wajib diisi"),
    status_pembayaran: z.enum(["pending", "unpaid", "partial", "paid"]).default("pending"),
    catatan: z.string().nullable().optional().transform((val) => val || null),
}).refine((data) => data.purchase_order_uid || data.supplier_uid, {
    message: "Supplier wajib dipilih jika tidak menggunakan PO",
    path: ["supplier_uid"],
});

export type ReceivingHeaderInput = z.infer<typeof receivingHeaderSchema>;

export const receivingBulkItemsSchema = z.object({
    items: z.array(
        z.object({
            product_uid: z.string().min(1, "Produk wajib dipilih"),
            kuantitas: z.coerce.number().min(0, "Jumlah minimal 0 pcs"),
            harga_beli: z.coerce.number().min(0, "Harga beli minimal 0"),
        })
    ),
});

export type ReceivingBulkItemsInput = z.infer<typeof receivingBulkItemsSchema>;
