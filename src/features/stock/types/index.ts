import type { Product } from "@/features/products/types";

export interface StockMovement {
    id: number;
    product_id: number;
    tipe: "masuk" | "keluar" | "penyesuaian" | "opname";
    kuantitas: number;
    stok_sebelum: number;
    stok_sesudah: number;
    alasan: string | null;
    created_at: string;
    product?: Product;
}

export interface ReceivingItem {
    id: number;
    receiving_id: number;
    product_id: number;
    kuantitas: number;
    created_at: string;
    product?: Product;
}

export interface Receiving {
    id: number;
    nomor_penerimaan: string;
    supplier: string;
    nomor_faktur: string | null;
    catatan: string | null;
    created_at: string;
    items?: ReceivingItem[];
}

export interface OpnameItem {
    id: number;
    opname_id: number;
    product_id: number;
    stok_sistem: number;
    stok_fisik: number;
    selisih: number;
    alasan: string;
    created_at: string;
    product?: Product;
}

export interface Opname {
    id: number;
    nomor_opname: string;
    catatan: string | null;
    status: "draft" | "completed";
    created_at: string;
    items?: OpnameItem[];
}
