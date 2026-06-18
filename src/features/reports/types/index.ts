export interface PaymentMethodStats {
    count: number;
    total: number;
}

export interface ReportProduct {
    product_name: string;
    quantity: number;
    revenue: number;
    profit: number;
    profit_margin: number;
}

export interface DailyReport {
    date: string;
    total_sales: number;
    transactions_count: number;
    average_transaction_value: number;
    total_cogs: number;
    gross_profit: number;
    profit_margin: number;
    void_count: number;
    payment_methods: Record<string, PaymentMethodStats>;
    top_products: ReportProduct[];
}
