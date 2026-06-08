export interface PaymentMethodStats {
    count: number;
    total: number;
}

export interface ReportProduct {
    product_name: string;
    quantity: number;
    revenue: number;
}

export interface DailyReport {
    total_sales: number;
    transactions_count: number;
    average_transaction_value: number;
    void_count: number;
    payment_methods: Record<string, PaymentMethodStats>;
    top_products: ReportProduct[];
}
