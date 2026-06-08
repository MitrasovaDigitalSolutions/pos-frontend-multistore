export interface TopProduct {
    product_name: string;
    quantity: number;
    revenue: number;
}

export interface DashboardSummary {
    net_sales: number;
    gross_sales: number;
    sales_count: number;
    items_sold: number;
    tax_total: number;
    discount_total: number;
    top_products: TopProduct[];
}
