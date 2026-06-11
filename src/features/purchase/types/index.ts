import type { Product } from "@/features/products/types";
import type { Supplier } from "@/features/suppliers/types";

export interface ReceivingItem {
    id: number;
    receiving_id: number;
    product_id: number;
    kuantitas: number;
    harga_beli: number;
    created_at: string;
    product?: Product;
}

export interface Receiving {
    id: number;
    nomor_penerimaan: string;
    supplier_id: number | null;
    supplier_relationship?: Supplier | null;
    supplier: string | null;
    nomor_faktur: string | null;
    nilai_faktur: number | null;
    status: "draft" | "completed";
    status_pembayaran: "pending" | "paid";
    catatan: string | null;
    created_at: string;
    items?: ReceivingItem[];
}
export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    product_id: number;
    kuantitas: number;
    kuantitas_diterima: number;
    harga_estimasi: number;
    created_at: string;
    product?: Product;
}

export interface PurchaseOrder {
    id: number;
    nomor_po: string;
    supplier_id: number | null;
    supplier_name: string | null;
    supplier?: Supplier | null;
    tanggal_po: string;
    status: "draft" | "ordered" | "received" | "cancelled";
    nilai_estimasi: number;
    catatan: string | null;
    user_id: number;
    user?: {
        id: number;
        name: string;
        username?: string;
    } | null;
    created_at: string;
    items?: PurchaseOrderItem[];
}

export interface CashAccount {
    id: number;
    nama: string;
    tipe: string;
    nomor_rekening?: string | null;
    saldo: number;
}

export interface ReceivingPayment {
    id: number;
    store_id: number;
    user_id: number;
    nomor_transaksi: string;
    tipe: "supplier_payment";
    cash_account_id: number;
    kategori: "pembelian_supplier";
    referensi_id: number;
    referensi_tipe: "receiving";
    total: number;
    status: "completed" | "void";
    metode_pembayaran: string;
    catatan_void?: string | null;
    void_by?: number | null;
    voided_at?: string | null;
    created_at: string;
    updated_at?: string | null;
    user?: {
        id: number;
        name: string;
        username?: string;
    } | null;
    receiving?: Receiving | null;
    cash_account?: CashAccount | null;
}

export interface PurchaseReturnItem {
    id: number;
    purchase_return_id: number;
    product_id: number;
    kuantitas: number;
    harga_beli: number;
    created_at: string;
    product?: Product;
}

export interface PurchaseReturn {
    id: number;
    nomor_retur: string;
    supplier_id: number;
    supplier?: Supplier | null;
    stock_receiving_id: number | null;
    stock_receiving?: Receiving | null;
    tanggal_retur: string;
    total_nominal: number;
    catatan: string | null;
    status: "draft" | "completed";
    user_id: number;
    user?: {
        id: number;
        name: string;
        username?: string;
    } | null;
    created_at: string;
    items?: PurchaseReturnItem[];
}
