import { z } from "zod";

// ─── Activate License Schema ─────────────────────────────────────────────────

export const activateLicenseSchema = z.object({
    license_key: z
        .string()
        .min(6, "Kunci lisensi minimal 6 karakter")
        .max(64, "Kunci lisensi maksimal 64 karakter")
        .trim(),
    instance_name: z.string().max(100).optional().or(z.literal("")),
});

export type ActivateLicenseInput = z.infer<typeof activateLicenseSchema>;

// ─── Order License Schema ────────────────────────────────────────────────────

export const orderLicenseSchema = z.object({
    billing_period: z.enum(["monthly", "annual"], {
        error: "Pilih periode penagihan",
    }),
    include_base_product: z.boolean().optional(),
    addon_ids: z.array(z.string()).optional(),
});

export type OrderLicenseInput = z.infer<typeof orderLicenseSchema>;
