import type { ChartOfAccount } from "../../types";
import type { AccountingTutorialMeta } from "../types/accounting-tutorial";

export const COA_TUTORIAL_LIST: AccountingTutorialMeta[] = [
    {
        id: "tambah_akun",
        title: "Tambah Akun Baru",
        description: "Panduan mendaftarkan akun baru ke dalam struktur Chart of Accounts (CoA).",
        category: "Chart of Accounts",
        stepCount: 6,
        badge: "Alur Utama",
        isAvailable: true,
    },
    {
        id: "edit_akun",
        title: "Ubah Akun",
        description: "Perbarui nama, kode, atau informasi akun akuntansi yang terdaftar.",
        category: "Chart of Accounts",
        stepCount: 3,
        isAvailable: true,
    },
    {
        id: "hapus_akun",
        title: "Hapus Akun",
        description: "Panduan aman menghapus akun demo atau akun yang tidak lagi digunakan.",
        category: "Chart of Accounts",
        stepCount: 4,
        isAvailable: true,
    },
];

export const MOCK_COA: ChartOfAccount[] = [
    {
        uid: "tutorial-mock-parent",
        kode: "1-0000",
        nama: "Aset (Demo)",
        tipe: "asset",
        saldo_normal: "debit",
        parent_uid: null,
        is_active: true,
        is_postable: false,
        keterangan: "Akun demo",
    },
    {
        uid: "tutorial-mock-leaf",
        kode: "1-1001",
        nama: "Kas Kecil (Demo)",
        tipe: "asset",
        saldo_normal: "debit",
        parent_uid: "tutorial-mock-parent",
        is_active: true,
        is_postable: true,
        keterangan: "Akun demo",
    },
];
