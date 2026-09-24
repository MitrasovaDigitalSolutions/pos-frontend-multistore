import { z } from "zod";

// ─── Activate License Schema ─────────────────────────────────────────────────

export const activateLicenseSchema = z.object({
    license_key: z
        .string()
        .min(6, "License key minimal 6 karakter")
        .max(64, "License key maksimal 64 karakter")
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
    coupon_code: z.string().optional(),
    include_server: z.boolean().optional(),
    server_package_id: z.string().optional().nullable(),
});

export type OrderLicenseInput = z.infer<typeof orderLicenseSchema>;
