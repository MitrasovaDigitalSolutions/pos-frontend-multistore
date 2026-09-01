import { z } from "zod";

export const createAssetSchema = z
    .object({
        nama: z
            .string()
            .min(1, "Nama aset wajib diisi")
            .max(255, "Nama aset maksimal 255 karakter"),
        asset_category_uid: z
            .string()
            .min(1, "Kategori aset wajib dipilih"),
        kode_aset: z
            .string()
            .max(100, "Kode/Nomor seri aset maksimal 100 karakter")
            .nullish(),
        tanggal_perolehan: z
            .string()
            .min(1, "Tanggal perolehan wajib diisi"),
        harga_perolehan: z
            .number({ error: "Harga perolehan harus berupa angka" })
            .min(1, "Harga perolehan minimal Rp 1"),
        nilai_residu: z
            .number({ error: "Nilai residu harus berupa angka" })
            .min(0, "Nilai residu minimal Rp 0")
            .nullish(),
        sumber_perolehan: z.enum(["kas", "non_kas"] as const),
        cash_account_uid: z.string().nullish(),
        offset_coa_uid: z.string().nullish(),
        catatan: z.string().nullish(),
    })
    .superRefine((data, ctx) => {
        if (data.sumber_perolehan === "kas" && !data.cash_account_uid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Akun Kas / Bank sumber pembayaran wajib dipilih",
                path: ["cash_account_uid"],
            });
        }
        if (data.sumber_perolehan === "non_kas" && !data.offset_coa_uid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Akun CoA penyeimbang (Modal / Hutang) wajib dipilih",
                path: ["offset_coa_uid"],
            });
        }
        if (data.nilai_residu && data.nilai_residu >= data.harga_perolehan) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Nilai residu tidak boleh sama dengan atau melebihi harga perolehan",
                path: ["nilai_residu"],
            });
        }
    });

export const updateAssetSchema = z.object({
    nama: z
        .string()
        .min(1, "Nama aset wajib diisi")
        .max(255, "Nama aset maksimal 255 karakter"),
    kode_aset: z
        .string()
        .max(100, "Kode/Nomor seri aset maksimal 100 karakter")
        .nullish(),
    nilai_residu: z
        .number({ error: "Nilai residu harus berupa angka" })
        .min(0, "Nilai residu minimal Rp 0")
        .nullish(),
    catatan: z.string().nullish(),
});

export type CreateAssetSchemaInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetSchemaInput = z.infer<typeof updateAssetSchema>;
