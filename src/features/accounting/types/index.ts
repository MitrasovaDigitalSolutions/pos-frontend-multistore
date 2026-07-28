import { PaginatedResponse } from "@/types/api";

export type ChartOfAccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type NormalBalance = "debit" | "kredit";

export interface ChartOfAccount {
    uid: string;
    kode: string;
    nama: string;
    tipe: ChartOfAccountType;
    saldo_normal: NormalBalance | null;
    parent_uid: string | null;
    is_active: boolean;
    keterangan: string | null;
    created_at?: string;
    updated_at?: string;
    children?: ChartOfAccount[];
    parent?: ChartOfAccount | null;
}

export interface BalanceSheetDetailCategory {
    kategori: string;
    debit?: number;
    credit?: number;
    amount: number;
}

export interface BalanceSheetItem {
    kode: string | null;
    nama: string;
    tipe?: string;
    saldo_normal?: "debit" | "kredit" | null;
    debit: number;
    credit: number;
    amount: number;
    detail?: BalanceSheetDetailCategory[];
}

export interface BalanceSheetSection {
    items: BalanceSheetItem[];
}

export interface BalanceSheetAssets extends BalanceSheetSection {
    total_assets: number;
}

export interface BalanceSheetLiabilities extends BalanceSheetSection {
    total_liabilities: number;
}

export interface BalanceSheetEquity extends BalanceSheetSection {
    total_equity: number;
}

export interface BalanceSheetRevenue extends BalanceSheetSection {
    total_revenue: number;
}

export interface BalanceSheetExpense extends BalanceSheetSection {
    total_expense: number;
}

export interface BalanceSheetSHU {
    total: number;
    berjalan: number;
    lalu: number;
    lalu_label?: string;
}

export interface BalanceSheetData {
    as_of_date: string;
    assets: BalanceSheetAssets;
    liabilities: BalanceSheetLiabilities;
    equity: BalanceSheetEquity;
    revenue: BalanceSheetRevenue;
    expense: BalanceSheetExpense;
    shu?: BalanceSheetSHU;
    is_balanced: boolean;
}

export type BalanceSheetReport = BalanceSheetData;

export interface GeneralLedgerEntry {
    uid: string;
    transaction_date: string;
    chart_of_account_uid: string;
    kode: string | null;
    nama: string;
    saldo_normal: "debit" | "kredit" | null;
    debit: number;
    credit: number;
    reference_type: string | null;
    reference_uid: string | null;
    description: string | null;
    source: "gl" | "manual";
}

export type GeneralLedgerResponse = PaginatedResponse<GeneralLedgerEntry>;
