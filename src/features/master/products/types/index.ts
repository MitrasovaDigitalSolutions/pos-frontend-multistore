import type { Category } from "@/features/master/categories/types";
import type { Brand } from "@/features/master/brands/types";

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
    merek: string;
    barcode: string | null;
    harga: number;
    stok: number;
    status: "active" | "inactive";
    harga_beli?: number | null;
    margin?: number | null;
    category_uid?: string | null;
    brand_uid?: string | null;
    image_path?: string | null;
    is_jasa?: boolean;
    category?: Category | null;
    brand?: Brand | null;
    created_at?: string;
    updated_at?: string;
}
