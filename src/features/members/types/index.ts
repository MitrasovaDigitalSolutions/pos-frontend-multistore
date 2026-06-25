export interface Member {
    uid: string;
    kode: string;
    nama: string;
    email: string | null;
    nomor_telepon: string | null;
    alamat: string | null;
    tanggal_lahir: string | null;
    jenis_kelamin: "L" | "P" | null;
    poin: number;
    status: "active" | "inactive";
    hutang?: number;
    created_at?: string;
    updated_at?: string;
}
