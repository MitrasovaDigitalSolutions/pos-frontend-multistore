import type { Sale as BaseSale, SaleItem as BaseSaleItem } from "@/features/dashboard/types";
import type { User } from "@/types/auth";
import type { Product } from "@/features/products/types";
import type { PaginationParams } from "@/types/api";
import type { Member } from "@/features/members/types";

export interface TransactionItem extends BaseSaleItem {
    product?: Product | null;
}

export interface Transaction extends BaseSale {
    user?: User | null;
    void_by?: User | null;
    voidBy?: User | null;
    items: TransactionItem[];
    member?: Member | null;
    member_id?: number | null;
}

export interface TransactionQueryParams extends PaginationParams {
    status?: string;
    payment_method?: string;
    from?: string;
    to?: string;
}
