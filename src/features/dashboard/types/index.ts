export interface TopProduct {
    product_name: string;
    quantity: number;
    revenue: number;
    profit: number;
    profit_margin: number;
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
    total_cogs: number;
    gross_profit: number;
    profit_margin: number;
    total_expenses: number;
    total_recurring_expenses: number;
    total_one_time_expenses: number;
    net_profit: number;
    top_products: TopProduct[];
    top_products_by_quantity?: TopProduct[];
    top_products_by_profit?: TopProduct[];
    top_categories?: TopCategory[];
}

export interface SalesHistoryItem {
    date: string;
    net_sales: number;
    gross_profit: number;
    expenses: number;
}

export interface DashboardSummaryParams {
    from?: string;
    to?: string;
    payment_method?: string;
    interval?: string;
}

export interface SaleItem {
    uid: string;
    transaction_uid: string;
    product_uid: string | null;
    nama_produk: string;
    barcode: string | null;
    harga_satuan: number;
    kuantitas: number;
    subtotal: number;
}

export interface Sale {
    uid: string;
    store_uid: string | null;
    user_uid: string;
    nomor_transaksi: string;
    nama_transaksi?: string | null;
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

export interface JasaVsProductData {
    from: string;
    to: string;
    total_jasa_sales: number;
    total_product_sales: number;
    total_jasa_profit: number;
    total_product_profit: number;
    total_jasa_quantity: number;
    total_product_quantity: number;
}


