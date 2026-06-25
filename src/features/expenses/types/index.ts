export interface ExpenseCategory {
    uid: string;
    nama: string;
    keterangan: string | null;
    is_recurring: boolean;
    hari_jatuh_tempo: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface Expense {
    uid: string;
    expense_category_uid: string;
    cash_account_uid: string;
    amount: number;
    nama: string | null;
    catatan: string | null;
    tanggal: string;
    nomor_pengeluaran?: string;
    category?: ExpenseCategory | null;
    cash_account?: { uid: string; nama: string; nomor_rekening?: string } | null;
    cashAccount?: { uid: string; nama: string } | null;
    user?: { uid: string; name: string } | null;
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
