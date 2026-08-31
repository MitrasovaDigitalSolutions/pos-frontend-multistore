import { z } from "zod";

export const assetCategorySchema = z.object({
    nama: z
        .string()
        .min(1, "Nama kategori aset wajib diisi")
        .max(150, "Nama kategori maksimal 150 karakter"),
    kode: z.string().max(50, "Kode kategori maksimal 50 karakter").nullish(),
    keterangan: z.string().nullish(),
    coa_asset_uid: z.string().nullish(),
    coa_akumulasi_penyusutan_uid: z.string().nullish(),
    coa_beban_penyusutan_uid: z.string().nullish(),
});

export type AssetCategorySchemaInput = z.infer<typeof assetCategorySchema>;
