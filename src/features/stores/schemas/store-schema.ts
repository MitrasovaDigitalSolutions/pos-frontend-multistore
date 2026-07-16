import { z } from "zod";

export const storeSchema = z.object({
    nama: z.string().min(1, "Nama toko wajib diisi"),
    alamat: z.string().nullable().optional(),
    telepon: z.string().nullable().optional(),
    is_active: z.preprocess(
        (val) => {
            if (typeof val === "string") return val === "true";
            if (typeof val === "number") return val === 1;
            return val;
        },
        z.boolean().default(true)
    ),
    is_central: z.preprocess(
        (val) => {
            if (typeof val === "string") return val === "true";
            if (typeof val === "number") return val === 1;
            return val;
        },
        z.boolean().default(false)
    ).optional(),
});

export type StoreInput = z.infer<typeof storeSchema>;