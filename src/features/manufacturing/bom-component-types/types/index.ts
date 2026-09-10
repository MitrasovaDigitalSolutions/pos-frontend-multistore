export interface BomComponentType {
    uid: string;
    kode: string;
    nama: string;
    kategori_bisnis?: string | null;
    is_main_driver: boolean;
    deskripsi?: string | null;
    product_boms_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface BomComponentTypeListParams {
    page?: number;
    per_page?: number;
    q?: string;
    search?: string;
    kategori_bisnis?: string;
    is_main_driver?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    all?: boolean;
}
