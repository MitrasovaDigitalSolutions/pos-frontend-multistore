import type { Product } from "@/features/master/products/types";

export type ProductionStatus = "draft" | "completed" | "void";

export interface ProductionUser {
    uid: string;
    name: string;
    email?: string;
}

export interface ProductionMaterial {
    uid: string;
    production_uid: string;
    product_uid: string;
    kuantitas: number;
    harga_satuan: number;
    subtotal: number;
    product?: Product;
}

export interface ProductionOutput {
    uid: string;
    production_uid: string;
    product_uid: string;
    kuantitas: number;
    hpp_satuan: number;
    subtotal_hpp: number;
    update_harga_jual?: boolean;
    harga_jual_baru?: number | null;
    margin_baru?: number | null;
    product?: Product;
}

export interface Production {
    uid: string;
    nomor_produksi: string;
    tanggal?: string | null;
    tanggal_mulai?: string | null;
    tanggal_selesai?: string | null;
    status: ProductionStatus;
    catatan?: string | null;
    total_biaya_bahan: number;
    total_qty_output?: number;
    voided_at?: string | null;
    created_by_user?: string | null;
    created_at: string;
    updated_at?: string;
    user?: ProductionUser | null;
    materials?: ProductionMaterial[];
    outputs?: ProductionOutput[];
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
