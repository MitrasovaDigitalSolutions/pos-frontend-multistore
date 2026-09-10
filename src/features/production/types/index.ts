import type { Product } from "@/features/master/products/types";

export type ProductionStatus = "draft" | "completed" | "void";

export interface ProductionUser {
    uid: string;
    name: string;
    email?: string;
}

export interface ProductionMaterial {
    uid: string;
    production_uid?: string | null;
    product_uid: string;
    kuantitas: number;
    harga_satuan: number;
    subtotal: number;
    product?: Product;
}

export interface ProductionAdditionalCost {
    uid?: string;
    production_uid?: string | null;
    nama_biaya: string;
    nominal: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProductionOutput {
    uid: string;
    production_uid?: string | null;
    product_uid: string;
    kuantitas: number;
    hpp_satuan: number;
    subtotal_hpp: number;
    update_harga_jual?: boolean;
    harga_jual_lama?: number;
    harga_jual_baru?: number | null;
    margin_baru?: number | null;
    product?: Product;
}

export interface Production {
    uid: string;
    store_uid?: string;
    nomor_produksi: string;
    tanggal?: string | null;
    tanggal_mulai?: string | null;
    tanggal_selesai?: string | null;
    status: ProductionStatus;
    catatan?: string | null;
    total_biaya_bahan: number;
    total_biaya_tambahan?: number;
    total_biaya_bersih?: number;
    metode_alokasi?: "actual_hybrid" | "flat_average" | "standard";
    total_qty_output?: number;
    voided_at?: string | null;
    created_by_user?: string | null;
    created_at: string;
    updated_at?: string;
    user?: ProductionUser | null;
    materials?: ProductionMaterial[];
    additional_costs?: ProductionAdditionalCost[];
    additionalCosts?: ProductionAdditionalCost[];
    outputs?: ProductionOutput[];
}

// ─── BoM & Costing Simulation Types ─────────────────────────────────────────

export interface BomCalculateOutputItem {
    product_uid: string;
    kuantitas: number;
}

export interface BomCalculateRequest {
    outputs: BomCalculateOutputItem[];
}

export interface BomMaterialRecommendation {
    material_product_uid: string;
    nama: string;
    satuan: string;
    barcode?: string | null;
    tipe_komponen?: string | null;
    stok_tersedia: number;
    harga_satuan: number;
    total_kebutuhan: number;
    estimasi_subtotal: number;
    stok_cukup: boolean;
}

export interface BomCalculateResponse {
    materials: BomMaterialRecommendation[];
    total_estimasi_biaya: number;
}

export interface HppPreviewOutputItem {
    uid?: string;
    product_uid: string;
    kuantitas: number;
    hpp_satuan: number;
    subtotal_hpp: number;
    update_harga_jual?: boolean;
    harga_jual_lama?: number;
    harga_jual_baru?: number | null;
    margin_baru?: number | null;
}

export interface HppPreviewResponse {
    total_biaya_bahan: number;
    total_biaya_tambahan: number;
    total_biaya_bersih: number;
    total_qty_output: number;
    total_alokasi_hpp: number;
    outputs: HppPreviewOutputItem[];
    materials: ProductionMaterial[];
    additional_costs: ProductionAdditionalCost[];
}

export interface ProductionListParams {
    page?: number;
    per_page?: number;
    dari?: string;
    sampai?: string;
    dari_mulai?: string;
    sampai_mulai?: string;
    dari_selesai?: string;
    sampai_selesai?: string;
    q?: string;
    status?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface ProductionFinalizeInput {
    tanggal_selesai?: string | null;
}
