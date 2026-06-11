import { z } from "zod";

export const purchaseReturnItemSchema = z.object({
    product_id: z.coerce.number().min(1, "Produk wajib dipilih"),
    kuantitas: z.coerce.number().min(1, "Jumlah minimal 1 pcs"),
    harga_beli: z.coerce.number().min(0, "Harga beli minimal 0"),
});

export const purchaseReturnSchema = z.object({
    supplier_id: z.coerce.number().min(1, "Supplier wajib dipilih"),
    stock_receiving_id: z.coerce
        .number()
        .nullable()
        .optional()
        .transform((val) => (val === 0 || !val ? null : Number(val))),
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
export type PurchaseReturnItemInput = z.infer<typeof purchaseReturnItemSchema>;
