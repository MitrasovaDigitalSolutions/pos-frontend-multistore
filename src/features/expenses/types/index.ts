export interface ExpenseCategory {
    id: number;
    nama: string;
    keterangan: string | null;
    is_recurring: boolean;
    hari_jatuh_tempo: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface Expense {
    id: number;
    expense_category_id: number;
    cash_account_id: number;
    amount: number;
    nama: string | null;
    catatan: string | null;
    tanggal: string;
    nomor_pengeluaran?: string;
    category?: ExpenseCategory | null;
    cash_account?: { id: number; nama: string; nomor_rekening?: string } | null;
    cashAccount?: { id: number; nama: string } | null;
    user?: { id: number; name: string } | null;
    created_at?: string;
    updated_at?: string;
}

export interface UpcomingDue {
    expense_category_id: number;
    category_name: string;
    hari_jatuh_tempo: number;
    tanggal_jatuh_tempo: string;
    status: "overdue" | "upcoming";
    days_left: number;
}
