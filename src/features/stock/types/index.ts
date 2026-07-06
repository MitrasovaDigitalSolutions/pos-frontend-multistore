import type { Product } from "@/features/products/types";
import type { Supplier } from "@/features/suppliers/types";

export interface StockMovement {
    uid: string;
    product_uid: string;
    tipe: "receive" | "void" | "sale" | "retur" | "penyesuaian" | "opname" | "adjustment" | "masuk" | "keluar" | "mutasi" | "sale_void";
    kuantitas: number;
    stok_sebelum: number;
    stok_sesudah: number;
    alasan: string | null;
    created_at: string;
    product?: Product;
    user?: {
        uid: string;
        name: string;
        username: string;
    };
}

export interface ReceivingItem {
    uid: string;
    receiving_uid: string;
    product_uid: string;
    kuantitas: number;
    harga_beli: number;
    created_at: string;
    product?: Product;
}

export interface Receiving {
    uid: string;
    nomor_penerimaan: string;
    supplier_uid: string | null;
    supplier_relationship?: Supplier | null;
    supplier: string | null;
    nomor_faktur: string | null;
    nilai_faktur: number | null;
    status: "draft" | "completed";
    status_pembayaran: "pending" | "unpaid" | "partial" | "paid";
    catatan: string | null;
    created_at: string;
    items?: ReceivingItem[];
}

import type { OpnameStatus } from "@/constants/stock";

export interface OpnameItem {
    uid: string;
    opname_uid: string;
    product_uid: string;
    stok_sistem: number;
    stok_fisik: number;
    selisih: number;
    alasan: string;
    created_at: string;
    product?: Product;
}

export interface Opname {
    uid: string;
    nomor_opname: string;
    catatan: string | null;
    status: OpnameStatus;
    created_at: string;
    items?: OpnameItem[];
    items_count?: number;
    user?: {
        uid: string;
        name: string;
        username: string;
    };
}
