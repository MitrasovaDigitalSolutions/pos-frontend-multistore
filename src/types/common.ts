import type { ReactNode } from "react";

// ─── Component Props ────────────────────────────────────────────────────────

export interface ChildrenProps {
    children: ReactNode;
}

// ─── Common Entity Types ────────────────────────────────────────────────────

export interface Product {
    uid: string;
    nama: string;
    merek: string;
    barcode: string | null;
    harga: number;
    stok: number;
    status: "active" | "inactive";
}

export interface StockMovement {
    uid: string;
    product_uid: string;
    tipe: string;
    kuantitas: number;
    stok_sebelum: number;
    stok_sesudah: number;
    alasan: string | null;
    created_at: string;
    product?: Pick<Product, "nama">;
}

export interface Receiving {
    uid: string;
    nomor_penerimaan: string;
    supplier: string | null;
    nomor_faktur: string | null;
    catatan: string | null;
    created_at: string;
}

export interface OpnameItem {
    uid: string;
    product_uid: string;
    stok_sistem: number;
    stok_fisik: number;
    selisih: number;
    alasan: string | null;
    product?: Pick<Product, "nama">;
}

export interface Opname {
    uid: string;
    nomor_opname: string;
    catatan: string | null;
    status: "draft" | "completed";
    created_at: string;
    items?: OpnameItem[];
}

export interface TopCategory {
    category_name: string;
    quantity: number;
    revenue: number;
    profit: number;
    profit_margin: number;
}

export interface DashboardSummary {
    net_sales: number;
    gross_sales: number;
    sales_count: number;
    items_sold: number;
    tax_total: number;
    discount_total: number;
    top_products: TopProduct[];
    top_products_by_quantity?: TopProduct[];
    top_products_by_profit?: TopProduct[];
    top_categories?: TopCategory[];
}

export interface TopProduct {
    product_name: string;
    quantity: number;
    revenue: number;
    profit?: number;
    profit_margin?: number;
}

export interface DailyReport {
    total_sales: number;
    transactions_count: number;
    average_transaction_value: number;
    void_count: number;
    payment_methods: Record<string, { count: number; total: number }>;
    top_products: TopProduct[];
}

export interface SystemUser {
    uid: string;
    name: string;
    username: string;
    email: string | null;
    store_uid: string | null;
    status: "active" | "inactive";
    roles: string[];
    permissions: string[];
}

// ─── Cart Types ─────────────────────────────────────────────────────────────

export interface CartItem {
    product_uid: string;
    itemId?: number;
    name: string;
    price: number;
    qty: number;
    stock: number;
    barcode: string | null;
}

export interface HoldTransaction {
    uid: string;
    items_count: number;
    subtotal: number;
    created_at: string;
}

// ─── Transaction Types ──────────────────────────────────────────────────────

export interface TransactionItem {
    uid: string;
    product_uid: string | null;
    nama_produk: string;
    harga_satuan: number;
    kuantitas: number;
    barcode?: string | null;
    product?: Pick<Product, "stok" | "barcode"> | null;
}

export interface Transaction {
    uid: string;
    status: string;
    subtotal: number;
    pajak: number;
    total: number;
    metode_pembayaran?: string | null;
    nominal_bayar?: number | null;
    kembalian?: number | null;
    jenis_kartu?: string | null;
    nomor_kartu_akhir?: string | null;
    items: TransactionItem[];
    created_at: string;
    nomor_transaksi: string
}
