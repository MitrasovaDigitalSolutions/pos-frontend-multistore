import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
    product_id: z.coerce.number().min(1, "Produk wajib dipilih"),
    kuantitas: z.coerce.number().min(1, "Jumlah minimal 1 pcs"),
    harga_estimasi: z.coerce.number().min(0, "Harga estimasi minimal 0"),
});

export const purchaseOrderSchema = z.object({
    supplier_id: z.coerce.number().min(1, "Supplier wajib dipilih").nullable().optional(),
    supplier_name: z.string().nullable().optional(),
    tanggal_po: z.string().min(1, "Tanggal PO wajib diisi"),
    catatan: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    items: z
        .array(purchaseOrderItemSchema)
        .min(1, "Minimal harus ada 1 item barang"),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
