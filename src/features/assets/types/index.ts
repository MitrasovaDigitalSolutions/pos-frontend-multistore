import type { ChartOfAccount } from "@/features/accounting/types";

// ─── Asset Category Types ───────────────────────────────────────────────────

export interface AssetCategory {
    uid: string;
    kode: string;
    nama: string;
    coa_asset_uid?: string | null;
    coa_akumulasi_penyusutan_uid?: string | null;
    coa_beban_penyusutan_uid?: string | null;
    keterangan?: string | null;
    assets_count?: number;
    coa_asset?: ChartOfAccount | null;
    coa_akumulasi_penyusutan?: ChartOfAccount | null;
    coa_beban_penyusutan?: ChartOfAccount | null;
    // camelCase aliases for fallback
    coaAsset?: ChartOfAccount | null;
    coaAkumulasiPenyusutan?: ChartOfAccount | null;
    coaBebanPenyusutan?: ChartOfAccount | null;
    created_at?: string;
    updated_at?: string;
}

// ─── Asset Types ────────────────────────────────────────────────────────────

export type AssetStatus = "aktif" | "habis_susut" | "dihapus" | "dijual";
export type AssetSumberPerolehan = "kas" | "non_kas";

export interface Asset {
    uid: string;
    nomor_aset: string;
    kode_aset?: string | null;
    nama: string;
    asset_category_uid: string;
    tanggal_perolehan: string;
    harga_perolehan: number;
    nilai_residu: number;
    total_penyusutan: number;
    nilai_buku: number;
    sumber_perolehan: AssetSumberPerolehan;
    cash_account_uid?: string | null;
    offset_coa_uid?: string | null;
    status: AssetStatus;
    catatan?: string | null;
    category?: AssetCategory | null;
    cashAccount?: {
        uid: string;
        nama: string;
        tipe?: string;
        saldo?: number;
    } | null;
    offsetCoa?: ChartOfAccount | null;
    offset_coa?: ChartOfAccount | null;
    creator?: {
        uid: string;
        name?: string;
        username?: string;
    } | null;
    penyusutan?: AssetPenyusutan[];
    created_at?: string;
    updated_at?: string;
}

// ─── Asset Depreciation (Penyusutan) Types ──────────────────────────────────

export interface AssetPenyusutan {
    uid: string;
    nomor_transaksi: string;
    asset_uid: string;
    tanggal: string;
    nominal: number;
    nilai_buku_sebelum: number;
    nilai_buku_sesudah: number;
    keterangan?: string | null;
    creator?: {
        uid: string;
        name?: string;
        username?: string;
    } | null;
    asset?: Asset | null;
    created_at?: string;
    updated_at?: string;
}

// ─── Metrics / Summary Types ────────────────────────────────────────────────

export interface AssetSummary {
    total_harga_perolehan: number;
    total_penyusutan: number;
    total_nilai_buku: number;
    total_aset_aktif: number;
    total_aset_habis_susut: number;
}

// ─── Filter & Payload Types ─────────────────────────────────────────────────

export interface AssetFilterParams {
    page?: number;
    per_page?: number;
    search?: string;
    asset_category_uid?: string;
    status?: string;
    sumber_perolehan?: string;
    date_start?: string;
    date_end?: string;
}

export interface CreateAssetCategoryPayload {
    nama: string;
    kode?: string | null;
    keterangan?: string | null;
    coa_asset_uid?: string | null;
    coa_akumulasi_penyusutan_uid?: string | null;
    coa_beban_penyusutan_uid?: string | null;
}

export interface UpdateAssetCategoryPayload {
    nama?: string;
    keterangan?: string | null;
    coa_asset_uid?: string | null;
    coa_akumulasi_penyusutan_uid?: string | null;
    coa_beban_penyusutan_uid?: string | null;
}

export interface CreateAssetPayload {
    nama: string;
    asset_category_uid: string;
    kode_aset?: string | null;
    tanggal_perolehan: string;
    harga_perolehan: number;
    nilai_residu?: number | null;
    sumber_perolehan: AssetSumberPerolehan;
    cash_account_uid?: string | null;
    offset_coa_uid?: string | null;
    catatan?: string | null;
}

export interface UpdateAssetPayload {
    nama?: string;
    kode_aset?: string | null;
    nilai_residu?: number | null;
    catatan?: string | null;
}

export interface CreateAssetPenyusutanPayload {
    tanggal: string;
    nominal: number;
    keterangan?: string | null;
}

export interface BulkAssetPenyusutanItem {
    asset_uid: string;
    nominal: number;
    keterangan?: string | null;
}

export interface BulkAssetPenyusutanPayload {
    tanggal: string;
    items: BulkAssetPenyusutanItem[];
}
