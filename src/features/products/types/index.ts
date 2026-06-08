export interface Product {
    id: number;
    nama: string;
    merek: string;
    barcode: string | null;
    harga: number;
    stok: number;
    status: "active" | "inactive";
    created_at?: string;
    updated_at?: string;
}
