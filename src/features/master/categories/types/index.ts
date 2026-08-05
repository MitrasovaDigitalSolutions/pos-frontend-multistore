export interface Category {
    uid: string;
    nama: string;
    deskripsi: string | null;
    parent_category_uid?: string | null;
    created_at?: string;
    updated_at?: string;
}
