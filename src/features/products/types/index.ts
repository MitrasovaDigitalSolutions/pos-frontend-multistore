import type { Category } from "@/features/categories/types";
import type { Brand } from "@/features/brands/types";

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
