import { z } from "zod";

export const requestTransferSchema = z.object({
    supplier_uid: z.string().min(1, "Supplier wajib dipilih"),
    supplier_sales_uid: z
        .string()
        .optional()
        .nullable()
        .transform((val) => (val && val !== "null" ? val : null)),
    catatan: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    items: z
        .array(
            z.object({
                product_uid: z.string().min(1, "Produk wajib dipilih"),
                kuantitas: z.coerce.number().min(0, "Kuantitas minimal 0"),
            }),
        )
        .min(1, "Minimal 1 item dengan kuantitas lebih dari 0"),
});

export type RequestTransferInput = z.infer<typeof requestTransferSchema>;

export interface RequestLineItem {
    product_uid: string;
    nama: string;
    barcode?: string | null;
    kuantitas: number;
}
