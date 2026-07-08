export interface ManualJournalLine {
    id?: number;
    manual_journal_id?: number;
    account_id: string;
    debit: number;
    credit: number;
    account?: {
        uid: string;
        kode: string;
        nama: string;
    };
}

export interface ManualJournal {
    id: number;
    reference_number: string;
    transaction_date: string;
    description: string;
    status: "draft" | "posted" | "voided";
    created_by: string | null;
    created_at: string;
    updated_at: string;
    lines?: ManualJournalLine[];
}

export interface CreateManualJournalInput {
    transaction_date: string;
    description: string;
    status: "draft" | "posted";
    lines: {
        account_id: string;
        debit: number;
        credit: number;
    }[];
}
