export type UnitType = "kuantitas" | "berat" | "panjang" | "volume" | "luas" | "lainnya";

export interface Unit {
    uid: string;
    nama: string;
    simbol: string;
    tipe?: UnitType | string | null;
    deskripsi?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface UnitListParams {
    page?: number;
    per_page?: number;
    q?: string;
    search?: string;
    tipe?: string;
    all?: boolean;
}
