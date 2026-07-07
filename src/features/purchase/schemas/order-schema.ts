import { z } from "zod";

// ─── Item Schema (untuk validasi individual item) ────────────────────────────

export const purchaseOrderItemSchema = z.object({
    product_uid: z.string().min(1, "Produk wajib dipilih"),
    kuantitas: z.coerce.number().min(1, "Jumlah minimal 1 pcs"),
    harga_estimasi: z.coerce.number().min(0, "Harga estimasi minimal 0"),
});

// ─── Header Schema (Step 1: Create PO header only) ──────────────────────────

export const purchaseOrderHeaderSchema = z.object({
    supplier_uid: z.string({ message: "Supplier wajib dipilih" }).min(1, "Supplier wajib dipilih"),
    tanggal_po: z.string().min(1, "Tanggal PO wajib diisi"),
    catatan: z
        .string()
        .nullable()
        .optional()
        .transform((val) => val || null),
});

export type PurchaseOrderHeaderInput = z.infer<typeof purchaseOrderHeaderSchema>;

// ─── Bulk Items Schema (Step 3: Bulk submit items) ──────────────────────────

export const purchaseOrderBulkItemsSchema = z.object({
    items: z
        .array(purchaseOrderItemSchema)
        .min(1, "Minimal harus ada 1 item barang"),
});

export type PurchaseOrderBulkItemsInput = z.infer<typeof purchaseOrderBulkItemsSchema>;

// ─── Legacy Combined Schema (backward compat) ──────────────────────────────

export const purchaseOrderSchema = z.object({
    supplier_uid: z.string().min(1, "Supplier wajib dipilih").nullable().optional(),
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
