import { z } from "zod";

export const assetPenyusutanSchema = z.object({
    tanggal: z.string().min(1, "Tanggal penyusutan wajib diisi"),
    nominal: z
        .number({ error: "Nominal penyusutan harus berupa angka" })
        .min(1, "Nominal penyusutan minimal Rp 1"),
    keterangan: z.string().nullish(),
});

export const bulkAssetPenyusutanItemSchema = z.object({
    asset_uid: z.string().min(1, "ID aset wajib diisi"),
    nominal: z
        .number({ error: "Nominal penyusutan harus berupa angka" })
        .min(1, "Nominal penyusutan minimal Rp 1"),
    keterangan: z.string().nullish(),
});

export const bulkAssetPenyusutanSchema = z.object({
    tanggal: z.string().min(1, "Tanggal penyusutan masal wajib diisi"),
    items: z
        .array(bulkAssetPenyusutanItemSchema)
        .min(1, "Minimal pilih 1 aset untuk disusutkan"),
});

export type AssetPenyusutanSchemaInput = z.infer<typeof assetPenyusutanSchema>;
export type BulkAssetPenyusutanSchemaInput = z.infer<typeof bulkAssetPenyusutanSchema>;
