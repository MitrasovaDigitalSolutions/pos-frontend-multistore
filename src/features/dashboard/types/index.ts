export interface TopProduct {
    product_name: string;
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
    total_cogs: number;
    gross_profit: number;
    profit_margin: number;
    top_products: TopProduct[];
}

export interface SalesHistoryItem {
    period: string;
    gross_sales: number;
    net_sales: number;
}

export interface DashboardSummaryParams {
    from?: string;
    to?: string;
    payment_method?: string;
}

export interface SaleItem {
    id: number;
    transaction_id: number;
    product_id: number | null;
    nama_produk: string;
    barcode: string | null;
    harga_satuan: number;
    kuantitas: number;
    subtotal: number;
}

export interface Sale {
    id: number;
    store_id: number | null;
    user_id: number;
    nomor_transaksi: string;
    subtotal: number;
    pajak: number;
    diskon: number;
    total: number;
    status: string;
    metode_pembayaran: string | null;
    nominal_bayar: number | null;
    kembalian: number | null;
    jenis_kartu: string | null;
    nomor_kartu_akhir: string | null;
    items: SaleItem[];
    created_at: string;
    updated_at: string;
}
