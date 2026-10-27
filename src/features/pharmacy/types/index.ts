import type { ApiResponse } from "@/types/api";

// ─── Batch Management Types ──────────────────────────────────────────────────

export interface ProductBatch {
    uid: string;
    product_uid: string;
    product_name?: string;
    batch_number: string;
    expired_date: string;
    stock: number;
    initial_stock?: number;
    status: "active" | "depleted" | "expired" | string;
    days_to_expire?: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateBatchPayload {
    batch_number: string;
    expired_date: string;
    stock?: number;
    status?: string;
}

export interface UpdateBatchPayload {
    batch_number?: string;
    expired_date?: string;
    stock?: number;
    status?: string;
}

// ─── Unit Conversion Types ───────────────────────────────────────────────────

export interface UnitConversion {
    uid: string;
    product_uid: string;
    unit_name: string;
    base_unit?: string;
    conversion_factor: number;
    barcode?: string | null;
    price?: number | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateUnitConversionPayload {
    unit_name: string;
    conversion_factor: number;
    barcode?: string | null;
    price?: number | null;
}

// ─── Template Racikan (Master Prescriptions) ───────────────────────────────────

export interface PrescriptionTemplateIngredient {
    uid?: string;
    prescription_uid?: string;
    product_uid: string;
    nama_produk: string;
    kuantitas: number;
    dosis?: string | null;
    product?: {
        uid: string;
        nama: string;
        satuan?: string;
        harga?: number;
        stok?: number;
    };
}

export interface PrescriptionTemplate {
    uid: string;
    store_uid?: string;
    nama_racikan: string;
    jenis_racikan: string;
    aturan_pakai?: string | null;
    tuslah_fee: number;
    embalase_fee: number;
    ingredients: PrescriptionTemplateIngredient[];
    created_at?: string;
    updated_at?: string;
}

export interface CreatePrescriptionTemplatePayload {
    nama_racikan: string;
    jenis_racikan?: string;
    aturan_pakai?: string | null;
    tuslah_fee?: number;
    embalase_fee?: number;
    ingredients: {
        product_uid: string;
        nama_produk?: string;
        kuantitas: number;
        dosis?: string | null;
    }[];
}

// ─── Riwayat Racikan Terjual (Prescription History) ──────────────────────────

export interface PrescriptionHistoryIngredient {
    uid?: string;
    prescription_history_uid?: string;
    product_uid: string;
    nama_produk: string;
    kuantitas: number;
    dosis?: string | null;
    product?: {
        uid: string;
        nama: string;
        satuan?: string;
        harga?: number;
    };
}

export interface PrescriptionHistory {
    uid: string;
    sale_uid?: string;
    store_uid?: string;
    nama_racikan: string;
    jenis_racikan: string;
    jumlah_kemasan?: number;
    aturan_pakai?: string | null;
    tuslah_fee: number;
    embalase_fee: number;
    total_harga?: number;
    created_at: string;
    sale?: {
        uid: string;
        nomor_transaksi?: string;
        invoice_number?: string;
        created_at?: string;
        user?: { name: string };
    };
    ingredients: PrescriptionHistoryIngredient[];
}

// ─── Compounded Item Types (On-the-fly Kasir Checkout) ─────────────────────────

export interface CompoundedIngredient {
    product_uid: string;
    nama_produk: string;
    kuantitas: number;
    base_kuantitas?: number;
    dosis_per_kemasan?: string | null;
    harga_satuan: number;
    subtotal: number;
    stok_tersedia?: number;
    satuan?: string;
}

export interface CompoundedItem {
    uid: string;
    nama_racikan: string;
    jenis_racikan: string;
    jumlah_kemasan: number;
    aturan_pakai: string;
    tuslah_fee: number;
    embalase_fee: number;
    total_harga: number;
    ingredients: CompoundedIngredient[];
    notes?: string | null;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export type ProductBatchesResponse = ApiResponse<ProductBatch[]>;
export type ProductBatchResponse = ApiResponse<ProductBatch>;

export type ProductUnitsResponse = ApiResponse<UnitConversion[]>;
export type ProductUnitResponse = ApiResponse<UnitConversion>;

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export type PrescriptionTemplatesResponse = ApiResponse<PaginatedData<PrescriptionTemplate> | PrescriptionTemplate[]>;
export type PrescriptionTemplateDetailResponse = ApiResponse<PrescriptionTemplate>;

export type PrescriptionHistoryResponse = ApiResponse<PaginatedData<PrescriptionHistory> | PrescriptionHistory[]>;
