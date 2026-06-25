import { z } from "zod";

export const purchaseReturnItemSchema = z.object({
    product_uid: z.string().min(1, "Produk wajib dipilih"),
    kuantitas: z.coerce.number().min(1, "Jumlah minimal 1 pcs"),
    harga_beli: z.coerce.number().min(0, "Harga beli minimal 0"),
    alasan: z.string().min(1, "Alasan retur wajib diisi/dipilih"),
});

export const purchaseReturnHeaderSchema = z.object({
    receiving_uid: z.string().min(1, "Faktur Penerimaan wajib dipilih"),
    supplier_uid: z.string().min(1, "Supplier wajib dipilih"),
    tanggal_retur: z.string().min(1, "Tanggal retur wajib diisi"),
    catatan: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
});

export const purchaseReturnBulkItemsSchema = z.object({
    items: z
        .array(purchaseReturnItemSchema)
        .min(1, "Minimal harus ada 1 item barang yang diretur"),
});

// Legacy backward compatibility schema if needed
export const purchaseReturnSchema = z.object({
    supplier_uid: z.string().min(1, "Supplier wajib dipilih"),
    receiving_uid: z.string().min(1, "Faktur Penerimaan wajib dipilih"),
    stock_receiving_uid: z.string().nullable().optional(),
    tanggal_retur: z.string().min(1, "Tanggal retur wajib diisi"),
    catatan: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
    items: z
        .array(purchaseReturnItemSchema)
        .min(1, "Minimal harus ada 1 item barang"),
});

export type PurchaseReturnInput = z.infer<typeof purchaseReturnSchema>;
export type PurchaseReturnHeaderInput = z.infer<typeof purchaseReturnHeaderSchema>;
export type PurchaseReturnBulkItemsInput = z.infer<typeof purchaseReturnBulkItemsSchema>;
export type PurchaseReturnItemInput = z.infer<typeof purchaseReturnItemSchema>;
