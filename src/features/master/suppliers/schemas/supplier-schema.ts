import { z } from "zod";

export const supplierSchema = z.object({
    nama: z.string().min(1, "Nama supplier wajib diisi"),
    email: z
        .string()
        .email("Format email tidak valid")
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    nomor_telepon: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    alamat: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
