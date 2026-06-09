import type { Transaction } from "@/types/common";

export interface CashDrawerMovement {
    id: number;
    cash_drawer_session_id: number;
    user_id: number;
    type: "opening" | "cash_sale" | "cash_in" | "cash_out" | "cash_refund" | string;
    amount: number;
    balance_before: number;
    balance_after: number;
    reference_id: number | null;
    reference_type: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        username: string;
        email: string;
        email_verified_at: string | null;
        store_id: number | null;
        status: string;
        created_at: string;
        updated_at: string;
    };
}

export interface CashDrawerSession {
    id: number;
    store_id: number | null;
    user_id: number;
    opening_balance: number;
    expected_cash: number;
    actual_closing_balance: number | null;
    cash_sales_total: number;
    cash_refunds_total: number;
    cash_in_total: number;
    cash_out_total: number;
    difference: number | null;
    status: "open" | "closed";
    opening_note: string | null;
    closing_note: string | null;
    opened_at: string;
    closed_at: string | null;
    closed_by: number | null | {
        id: number;
        name: string;
        username: string;
        email: string;
        email_verified_at: string | null;
        store_id: number | null;
        status: string;
        created_at: string;
        updated_at: string;
    };
    created_at: string;
    updated_at: string;
    transactions?: Transaction[];
    user?: {
        id: number;
        name: string;
        username: string;
        email: string;
        email_verified_at: string | null;
        store_id: number | null;
        status: string;
        created_at: string;
        updated_at: string;
    };
    movements?: CashDrawerMovement[];
}

export interface OpenCashDrawerPayload {
    opening_balance: number;
    opening_note?: string;
}

export interface CashInPayload {
    amount: number;
    note?: string;
}

export interface CashOutPayload {
    amount: number;
    note: string;
}

export interface CloseCashDrawerPayload {
    actual_closing_balance: number;
    closing_note?: string;
}
