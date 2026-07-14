import type { Sale as BaseSale, SaleItem as BaseSaleItem } from "@/features/dashboard/types";
import type { User } from "@/types/auth";
import type { Product } from "@/features/products/types";
import type { PaginationParams } from "@/types/api";
import type { Member } from "@/features/members/types";

export interface TransactionItem extends BaseSaleItem {
    product?: Product | null;
    harga_beli?: number;
}

export interface Transaction extends BaseSale {
    user?: User | null;
    void_by?: User | null;
    voidBy?: User | null;
    items: TransactionItem[];
    member?: Member | null;
    member_uid?: string | null;
    cash_received?: number | null;
    cash_amount?: number | null;
    card_amount?: number | null;
    debt_amount?: number | null;
    catatan_void?: string | null;
    voided_at?: string | null;
    void_by_uid?: string | null;
}

export interface TransactionQueryParams extends PaginationParams {
    status?: string;
    payment_method?: string;
    from?: string;
    to?: string;
}
