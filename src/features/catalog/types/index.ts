import type { Category } from "@/features/master/categories/types";
import type { Brand } from "@/features/master/brands/types";

// Re-export from master products — catalog uses the same shape
export interface CatalogProduct {
    uid: string;
    nama: string;
    merek: string;
    barcode: string | null;
    harga: number;
    harga_beli?: number | null;
    margin?: number | null;
    stok: number;
    status: "active" | "inactive" | "archived";
    category_uid?: string | null;
    brand_uid?: string | null;
    image_path?: string | null;
    is_jasa?: boolean;
    category?: Category | null;
    brand?: Brand | null;
    created_at?: string;
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
