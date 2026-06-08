import { z } from "zod";

export const opnameItemSchema = z.object({
    product_id: z.coerce.number().min(1),
    stok_fisik: z.coerce
        .number()
        .min(0, "Stok fisik tidak boleh kurang dari 0"),
    alasan: z.string().min(1, "Alasan wajib diisi"),
});

export const opnameSchema = z.object({
    catatan: z.string().min(1, "Catatan wajib diisi"),
    status: z.enum(["draft", "completed"]).default("draft"),
    items: z
        .array(opnameItemSchema)
        .min(1, "Minimal harus ada 1 item untuk opname"),
});

export type OpnameInput = z.infer<typeof opnameSchema>;
