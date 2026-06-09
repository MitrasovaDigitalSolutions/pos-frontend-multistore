import { z } from "zod";

export const categorySchema = z.object({
    nama: z.string().min(1, "Nama kategori wajib diisi"),
    deskripsi: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
});

export type CategoryInput = z.infer<typeof categorySchema>;
