import type { Category } from "@/features/master/categories/types";
import type { Brand } from "@/features/master/brands/types";
import type { CreatedByUser, CreatedByToko } from "@/features/catalog/types";

export interface ProductStore {
    product_uid: string;
    store_uid: string;
    stok: number;
    harga_beli: number | null;
    harga_jual: number | null;
    margin: number | null;
    status: "active" | "inactive";
}

export interface Product {
    uid: string;
    nama: string;
    merek: string | null;
    barcode: string | null;
    harga: number;
    harga_jual?: number | null;
    stok: number;
    status: "active" | "inactive" | "archived";
    harga_beli?: number | null;
    harga_beli_avg?: number | null;
    margin?: number | null;
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

