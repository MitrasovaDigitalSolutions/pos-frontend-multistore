import { z } from "zod";

export const brandSchema = z.object({
    nama: z.string().min(1, "Nama brand wajib diisi"),
    deskripsi: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
});

export type BrandInput = z.infer<typeof brandSchema>;
