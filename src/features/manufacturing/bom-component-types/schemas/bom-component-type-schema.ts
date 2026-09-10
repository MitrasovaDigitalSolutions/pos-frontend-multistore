import { z } from "zod";

export const BOM_BUSINESS_CATEGORIES = [
    { value: "konveksi", label: "Konveksi & Pakaian (Garment)" },
    { value: "fnb", label: "Kuliner & Bakery (F&B)" },
    { value: "percetakan", label: "Percetakan & Sablon" },
    { value: "kerajinan", label: "Kerajinan & Kriya (Craft)" },
    { value: "general", label: "Umum / Universal" },
    { value: "lainnya", label: "Lainnya" },
] as const;

export type BomBusinessCategory = (typeof BOM_BUSINESS_CATEGORIES)[number]["value"];

export const bomComponentTypeSchema = z.object({
    kode: z
        .string()
        .min(1, "Kode wajib diisi")
        .max(50, "Kode maksimal 50 karakter")
        .regex(/^[a-z0-9_]+$/, "Kode hanya boleh huruf kecil, angka, dan underscore (_)"),
    nama: z.string().min(1, "Nama tipe komponen wajib diisi").max(100, "Nama maksimal 100 karakter"),
    kategori_bisnis: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || "general"),
    is_main_driver: z
        .union([z.boolean(), z.string().transform((v) => v === "true")])
        .default(false),
    deskripsi: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => val || null),
});

export type BomComponentTypeInput = z.infer<typeof bomComponentTypeSchema>;
