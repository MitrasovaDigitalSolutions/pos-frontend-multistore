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
    status_pembayaran: "pending" | "partial" | "paid";
    purchase_order_id?: number | null;
    total_dibayar?: number;
    sisa_hutang?: number;
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
    sisa_belum_diterima: number;
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
    status: "draft" | "ordered" | "partially_received" | "received" | "closed" | "cancelled";
    nilai_estimasi: number;
    total_diterima: number;
    receivings_count: number;
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

// ─── Local Item (Zustand Persist — sebelum bulk submit ke server) ────────────

export interface PurchaseItemLocal {
    temp_id: string;
    product_id: number;
    barcode: string | null;
    nama: string;
    kuantitas: number;
    harga_estimasi: number;
    alasan?: string | null;
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
    nomor_referensi?: string | null;
    catatan?: string | null;
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

export interface PaymentSummary {
    receiving_id: number;
    nomor_penerimaan: string;
    total_faktur: number;
    total_dibayar: number;
    sisa_hutang: number;
    status_pembayaran: "pending" | "partially_paid" | "paid";
    payments: {
        id: number;
        jumlah: number;
        metode: string;
        tanggal: string;
    }[];
}

export interface PurchaseReturnItem {
    id: number;
    purchase_return_id: number;
    product_id: number;
    kuantitas: number;
    harga_beli: number;
    alasan?: string | null;
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
    resolution_type?: "refund" | "credit" | "credit_note" | "exchange" | null;
    catatan_penyelesaian?: string | null;
    user_id: number;
    user?: {
        id: number;
        name: string;
        username?: string;
    } | null;
    created_at: string;
    items?: PurchaseReturnItem[];
}
