import { z } from "zod";

export const coaSchema = z.object({
    kode: z
        .string()
        .min(1, "Kode akun wajib diisi")
        .max(20, "Kode akun maksimal 20 karakter"),
    nama: z
        .string()
        .min(1, "Nama akun wajib diisi")
        .max(200, "Nama akun maksimal 200 karakter"),
    tipe: z.enum(["asset", "liability", "equity", "revenue", "expense"], {
        message: "Tipe akun wajib dipilih",
    }),
    saldo_normal: z
        .enum(["debit", "kredit"])
        .nullable()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    parent_uid: z
        .string()
        .nullable()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
    is_active: z.boolean().default(true),
    keterangan: z
        .string()
        .nullable()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
});

export type CoaSchemaInput = z.input<typeof coaSchema>;
