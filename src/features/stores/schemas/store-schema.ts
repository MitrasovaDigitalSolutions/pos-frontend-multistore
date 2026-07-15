import { z } from "zod";

export const storeSchema = z.object({
    nama: z.string().min(1, "Nama toko wajib diisi"),
    alamat: z.string().nullable().optional(),
    telepon: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
});

export type StoreInput = z.infer<typeof storeSchema>;