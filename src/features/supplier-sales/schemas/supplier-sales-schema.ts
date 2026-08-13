import { z } from "zod";

export const supplierSalesSchema = z.object({
    supplier_uid: z.string().min(1, "Supplier wajib dipilih"),
    nama: z.string().min(1, "Nama katalog wajib diisi"),
    keterangan: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    status: z.enum(["active", "inactive"]).default("active"),
});

export type SupplierSalesInput = z.infer<typeof supplierSalesSchema>;

export const supplierSalesItemSchema = z.object({
    product_uid: z.string().min(1, "Produk wajib dipilih"),
    harga_estimasi: z.coerce.number().min(0, "Harga estimasi minimal Rp 0"),
});

export type SupplierSalesItemInput = z.infer<typeof supplierSalesItemSchema>;
