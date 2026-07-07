import type { Member } from "@/features/members/types";

export interface CartItem {
    product_uid: string;
    itemId?: number; // backend transaction_item id
    name: string;
    price: number;
    qty: number;
    stock: number;
    barcode: string | null;
    is_jasa?: boolean;
}

export interface HoldTransaction {
    uid: string;
    nama_transaksi?: string;
    items_count: number;
    subtotal: number;
    discountType?: "nominal" | "percent";
    discountValue?: number;
    created_at: string;
    items: CartItem[];
    member?: Member | null;
}

export interface ReceiptItem {
    uid: string;
    nama_produk: string;
    kuantitas: number;
    harga_satuan: number;
}

export interface Receipt {
    uid: string;
    nama_transaksi?: string;
    items: ReceiptItem[];
    subtotal: number;
    diskon?: number;
    pajak: number;
    total: number;
    metode_pembayaran: "cash" | "card" | "debt";
    nominal_bayar?: number;
    kembalian?: number;
    jenis_kartu?: string;
    nomor_kartu_akhir?: string;
    member?: Member | null;
    member_uid?: string | null;
    cash_received?: number;
    cash_amount?: number;
    card_amount?: number;
    debt_amount?: number;
}

export interface TrxItem {
    uid: string;
    product_uid: string;
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
