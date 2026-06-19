import type { Sale as BaseSale, SaleItem as BaseSaleItem } from "@/features/dashboard/types";
import type { User } from "@/types/auth";
import type { Product } from "@/features/products/types";

export interface TransactionItem extends BaseSaleItem {
    product?: Product | null;
}

export interface Transaction extends BaseSale {
    user?: User | null;
    void_by?: User | null;
    voidBy?: User | null;
    items: TransactionItem[];
}
