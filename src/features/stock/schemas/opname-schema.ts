import { z } from "zod";

import { OPNAME_STATUS } from "@/constants/stock";

export const opnameItemSchema = z.object({
    product_uid: z.string().min(1),
    stok_fisik: z.coerce
        .number()
        .min(0, "Stok fisik tidak boleh kurang dari 0"),
    alasan: z.string().min(1, "Alasan wajib diisi"),
});

export const opnameHeaderSchema = z.object({
    catatan: z.string().min(1, "Catatan wajib diisi"),
});

export const opnameSchema = z.object({
    catatan: z.string().min(1, "Catatan wajib diisi"),
    status: z.enum([
        OPNAME_STATUS.DRAFT,
        OPNAME_STATUS.PROCESSING,
        OPNAME_STATUS.COMPLETED,
        OPNAME_STATUS.FAILED,
    ]).default(OPNAME_STATUS.DRAFT),
    items: z
        .array(opnameItemSchema)
        .min(1, "Minimal harus ada 1 item untuk opname"),
});

export type OpnameInput = z.infer<typeof opnameSchema>;
export type OpnameHeaderInput = z.infer<typeof opnameHeaderSchema>;

