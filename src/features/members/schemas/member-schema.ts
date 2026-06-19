import { z } from "zod";

export const memberSchema = z.object({
    kode: z
        .string()
        .max(50, "Kode maksimal 50 karakter")
        .optional()
        .or(z.literal("")),
    nama: z
        .string()
        .min(1, "Nama wajib diisi")
        .max(255, "Nama maksimal 255 karakter"),
    email: z
        .string()
        .email("Format email tidak valid")
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    nomor_telepon: z
        .string()
        .max(50, "Nomor telepon maksimal 50 karakter")
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    alamat: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    tanggal_lahir: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    jenis_kelamin: z
        .enum(["L", "P"])
        .optional()
        .nullable()
        .or(z.literal("").transform(() => null)),
    poin: z
        .number()
        .min(0, "Poin minimal 0")
        .optional()
        .default(0),
    status: z
        .enum(["active", "inactive"])
        .optional()
        .default("active"),
});

export type MemberInput = z.infer<typeof memberSchema>;
