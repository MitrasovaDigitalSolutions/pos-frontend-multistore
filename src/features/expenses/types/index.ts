export interface ExpenseCategory {
    uid: string;
    nama: string;
    keterangan?: string | null;
    is_recurring?: boolean;
    hari_jatuh_tempo?: number | null;
    store_uid?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CashAccountInfo {
    uid: string;
    nama: string;
    tipe?: string;
    saldo?: number;
    nomor_rekening?: string;
    store_uid?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface UserInfo {
    uid: string;
    name: string;
    username?: string;
    email?: string | null;
    status?: string;
    store_uid?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Expense {
    uid: string;
    nomor_pengeluaran?: string;
    nama: string | null;
    amount: number;
    catatan: string | null;
    tanggal: string;
    expense_category_uid: string;
    cash_account_uid: string;
    user_uid?: string;
    store_uid?: string | null;
    status?: "active" | "completed" | "void" | string;
    catatan_void?: string | null;
    void_by_uid?: string | null;
    voided_at?: string | null;
    void_by?: UserInfo | null;
    category?: ExpenseCategory | null;
    cash_account?: CashAccountInfo | null;
    cashAccount?: CashAccountInfo | null;
    user?: UserInfo | null;
    created_at?: string;
    updated_at?: string;
}

export interface UpcomingDue {
    expense_category_uid: string;
    category_name: string;
    hari_jatuh_tempo: number;
    tanggal_jatuh_tempo: string;
    status: "overdue" | "upcoming";
    days_left: number;
}
