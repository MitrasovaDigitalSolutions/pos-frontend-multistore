import { z } from "zod";

export const storeSettingsSchema = z.object({
    app_name: z
        .string()
        .min(1, "Nama toko wajib diisi")
        .max(255, "Nama toko maksimal 255 karakter"),
    app_address: z
        .string()
        .min(1, "Alamat toko wajib diisi")
        .max(500, "Alamat toko maksimal 500 karakter"),
    app_phone: z
        .string()
        .max(50, "Nomor telepon maksimal 50 karakter")
        .optional()
        .or(z.literal(""))
        .nullable()
        .transform((val) => val || ""),
    app_logo_url: z
        .any()
        .optional()
        .nullable(),
    tax_rate_ppn: z
        .number({ error: "Tarif PPN wajib diisi" })
        .min(0, "Tarif PPN minimal 0%")
        .max(100, "Tarif PPN maksimal 100%"),
    point_rate: z
        .number({ error: "Tarif konversi poin wajib diisi" })
        .min(1, "Tarif konversi poin minimal Rp 1 per poin"),
    point_system_enabled: z
        .string()
        .optional()
        .nullable()
        .transform((val) => val || "true"),
    cash_account_register_uid: z
        .string()
        .optional()
        .or(z.literal(""))
        .nullable()
        .transform((val) => val || ""),
    cash_account_main_uid: z
        .string()
        .optional()
        .or(z.literal(""))
        .nullable()
        .transform((val) => val || ""),
    cash_account_bank_uid: z
        .string()
        .optional()
        .or(z.literal(""))
        .nullable()
        .transform((val) => val || ""),
    printer_id: z
        .string()
        .optional()
        .or(z.literal(""))
        .nullable()
        .transform((val) => val || ""),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
