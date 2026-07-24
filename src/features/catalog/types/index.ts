import type { Category } from "@/features/master/categories/types";
import type { Brand } from "@/features/master/brands/types";

export interface CreatedByUser {
    uid: string;
    name: string;
}

export interface CreatedByToko {
    uid: string;
    nama: string;
}

// Re-export from master products — catalog uses the same shape
export interface CatalogProduct {
    uid: string;
    nama: string;
    merek?: string | null;
    barcode?: string | null;
    harga: number;
    harga_jual?: number | null;
    harga_beli?: number | null;
    harga_beli_avg?: number | null;
    margin?: number | null;
    stok: number;
    status: "active" | "inactive" | "archived";
    category_uid?: string | null;
    brand_uid?: string | null;
    archived_barcode?: string | null;
    archived_at?: string | null;
    image_path?: string | null;
    image_url?: string | null;
    is_jasa?: boolean;
    created_by_user?: CreatedByUser | null;
    created_by_toko?: CreatedByToko | null;
    category?: Category | null;
    brand?: Brand | null;
    created_at?: string;
    updated_at?: string;
}

export interface BulkAssignmentItem {
    store_uid: string;
    stok?: number;
    harga_beli?: number | null;
    harga_jual?: number | null;
    margin?: number | null;
    status?: "active" | "inactive";
}

export interface BulkAssignPayload {
    assignments: BulkAssignmentItem[];
}

