import { z } from "zod";

export const UNIT_TYPES = [
    { value: "kuantitas", label: "Kuantitas (Pcs, Box, Lusin, dll)" },
    { value: "berat", label: "Berat (Kg, Gram, Ton, dll)" },
    { value: "panjang", label: "Panjang (Meter, Cm, Roll, dll)" },
    { value: "volume", label: "Volume (Liter, Ml, M3, dll)" },
    { value: "luas", label: "Luas (M2, Hektar, dll)" },
    { value: "lainnya", label: "Lainnya" },
] as const;

export type UnitType = (typeof UNIT_TYPES)[number]["value"];

export const unitSchema = z.object({
    nama: z.string().min(1, "Nama satuan wajib diisi").max(100, "Nama maksimal 100 karakter"),
    simbol: z.string().min(1, "Simbol satuan wajib diisi").max(30, "Simbol maksimal 30 karakter"),
    tipe: z.enum(["kuantitas", "berat", "panjang", "volume", "luas", "lainnya"]).default("kuantitas"),
    deskripsi: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
});

export type UnitInput = z.infer<typeof unitSchema>;
