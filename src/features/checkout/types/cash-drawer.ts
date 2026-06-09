export interface CashDrawerMovement {
    id: number;
    cash_drawer_id: number;
    type: "cash_in" | "cash_out" | "initial";
    amount: number;
    note: string | null;
    created_at: string;
}

export interface CashDrawerSession {
    id: number;
    user_id: number;
    opening_balance: number;
    opening_note: string | null;
    expected_cash: number;
    actual_closing_balance: number | null;
    closing_note: string | null;
    status: "open" | "closed";
    opened_at: string;
    closed_at: string | null;
    user?: {
        id: number;
        name: string;
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
