import type { Member } from "@/features/members/types";

export interface CartItem {
    product_id: number;
    itemId?: number; // backend transaction_item id
    name: string;
    price: number;
    qty: number;
    stock: number;
    barcode: string | null;
    is_jasa?: boolean;
}

export interface HoldTransaction {
    id: number;
    items_count: number;
    subtotal: number;
    created_at: string;
    items: CartItem[];
    member?: Member | null;
}

export interface ReceiptItem {
    id: number;
    nama_produk: string;
    kuantitas: number;
    harga_satuan: number;
}

export interface Receipt {
    id: number;
    items: ReceiptItem[];
    subtotal: number;
    pajak: number;
    total: number;
    metode_pembayaran: "cash" | "card";
    nominal_bayar?: number;
    kembalian?: number;
    jenis_kartu?: string;
    nomor_kartu_akhir?: string;
    member?: Member | null;
    member_id?: number | null;
}

export interface TrxItem {
    id: number;
    product_id: number;
    nama_produk: string;
    harga_satuan: number;
    kuantitas: number;
    product?: {
        stok?: number;
        barcode?: string | null;
    };
    barcode?: string | null;
}

export interface TrxData {
    items?: TrxItem[];
}

export * from "./cash-drawer";
