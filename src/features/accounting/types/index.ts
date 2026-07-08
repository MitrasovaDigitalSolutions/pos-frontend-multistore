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
