export interface CentralStoreBreakdown {
    store_uid: string;
    store_name: string;
    is_central: boolean;
    sales_count: number;
    net_sales: number;
    gross_profit: number;
    profit_margin: number;
    total_expenses: number;
    net_profit: number;
}

export interface CentralOverviewData {
    from: string;
    to: string;
    stores_count: number;
    sales_count: number;
    items_sold: number;
    gross_sales: number;
    discount_total: number;
    tax_total: number;
    net_sales: number;
    total_cogs: number;
    gross_profit: number;
    profit_margin: number;
    total_expenses: number;
    total_recurring_expenses: number;
    total_one_time_expenses: number;
    net_profit: number;
    stores: CentralStoreBreakdown[];
}

export interface CentralOverviewResponse {
    status: string;
    message: string;
    data: CentralOverviewData;
}

export interface CentralStoreComparisonRow extends CentralStoreBreakdown {
    average_transaction_value: number;
    stock_value: number;
    total_stock_qty: number;
    sku_count: number;
}

export interface CentralStoresComparisonTotals {
    sales_count: number;
    net_sales: number;
    gross_profit: number;
    total_expenses: number;
    net_profit: number;
    stock_value: number;
}

export interface CentralStoresComparisonData {
    from: string;
    to: string;
    stores: CentralStoreComparisonRow[];
    totals: CentralStoresComparisonTotals;
}

export interface CentralStoresComparisonResponse {
    status: string;
    message: string;
    data: CentralStoresComparisonData;
}

export interface CentralTrendSeriesItem {
    date: string;
    net_sales: number;
    gross_profit: number;
    expenses: number;
}

export interface CentralStoreTrendSeries {
    store_uid: string;
    store_name: string;
    data: CentralTrendSeriesItem[];
}

export interface CentralSalesTrendData {
    from: string;
    to: string;
    interval: "daily" | "weekly" | "monthly";
    by_store: boolean;
    series: CentralTrendSeriesItem[];
    stores?: CentralStoreTrendSeries[];
}

export interface CentralSalesTrendResponse {
    status: string;
    message: string;
    data: CentralSalesTrendData;
}

export interface CentralStoreInventoryRow {
    store_uid: string;
    store_name: string;
    is_central: boolean;
    stock_value: number;
    total_qty: number;
    sku_count: number;
}

export interface CentralInventoryTotals {
    stores_count: number;
    stock_value: number;
    total_qty: number;
    sku_count: number;
}

export interface CentralInventoryData {
    stores: CentralStoreInventoryRow[];
    totals: CentralInventoryTotals;
}

export interface CentralInventoryResponse {
    status: string;
    message: string;
    data: CentralInventoryData;
}
