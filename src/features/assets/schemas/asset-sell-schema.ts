import { z } from "zod";

export const sellAssetSchema = z.object({
    tanggal_jual: z
        .string()
        .min(1, "Tanggal penjualan wajib diisi"),
    nominal_jual: z
        .number({ error: "Nominal penjualan wajib diisi" })
        .min(0, "Nominal penjualan minimal Rp 0"),
    cash_account_uid: z
        .string()
        .min(1, "Akun Kas / Bank penerimaan wajib dipilih"),
    offset_coa_uid: z.string().nullish(),
    catatan: z.string().nullish(),
});

export type SellAssetSchemaInput = z.infer<typeof sellAssetSchema>;
