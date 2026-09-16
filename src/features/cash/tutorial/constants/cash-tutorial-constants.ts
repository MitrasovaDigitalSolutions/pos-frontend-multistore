import type { CashAccount, CashLedger } from "../../api/cash-api";
import type { CashTutorialMeta } from "../types/cash-tutorial";

/**
 * Akun kas contoh untuk mode tutorial. Minimal 2 akun (1 kas + 1 bank) agar flow
 * transfer memiliki akun asal & tujuan yang berbeda.
 */
export const MOCK_CASH_ACCOUNTS: CashAccount[] = [
    {
        uid: "tutorial-mock-kas-1",
        nama: "Kas Toko (Demo)",
        tipe: "cash",
        nomor_rekening: null,
        deskripsi: "Kas operasional toko (Demo)",
        saldo: 5000000,
        is_active: true,
    },
    {
        uid: "tutorial-mock-kas-bank-1",
        nama: "Bank BCA Operasional (Demo)",
        tipe: "bank",
        nomor_rekening: "5220304050",
        deskripsi: "Rekening operasional (Demo)",
        saldo: 12500000,
        is_active: true,
    },
];

/**
 * Mutasi buku kas contoh untuk mode tutorial, dipakai saat data toko kosong.
 */
export const MOCK_CASH_LEDGER: CashLedger[] = [
    {
        uid: "tutorial-mock-ledger-1",
        cash_account_uid: "tutorial-mock-kas-1",
        amount: 1500000,
        tipe: "debit",
        kategori: "sale",
        catatan: "Penjualan tunai POS (Demo)",
        created_at: "2026-09-12T09:15:00.000Z",
        cash_account: {
            uid: "tutorial-mock-kas-1",
            nama: "Kas Toko (Demo)",
            tipe: "cash",
            saldo: 5000000,
        },
        user: { uid: "tutorial-mock-user-1", name: "Admin Demo" },
    },
    {
        uid: "tutorial-mock-ledger-2",
        cash_account_uid: "tutorial-mock-kas-1",
        amount: -750000,
        tipe: "credit",
        kategori: "expense",
        catatan: "Pembayaran listrik toko (Demo)",
        created_at: "2026-09-10T14:30:00.000Z",
        cash_account: {
            uid: "tutorial-mock-kas-1",
            nama: "Kas Toko (Demo)",
            tipe: "cash",
            saldo: 5000000,
        },
        user: { uid: "tutorial-mock-user-1", name: "Admin Demo" },
    },
    {
        uid: "tutorial-mock-ledger-3",
        cash_account_uid: "tutorial-mock-kas-bank-1",
        amount: 12500000,
        tipe: "transfer",
        kategori: "transfer",
        catatan: "Setoran kas ke bank (Demo)",
        created_at: "2026-09-08T11:00:00.000Z",
        cash_account: {
            uid: "tutorial-mock-kas-bank-1",
            nama: "Bank BCA Operasional (Demo)",
            tipe: "bank",
            nomor_rekening: "5220304050",
            saldo: 12500000,
        },
        user: { uid: "tutorial-mock-user-1", name: "Admin Demo" },
    },
];

export const MOCK_CASH_LEDGER_META = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: MOCK_CASH_LEDGER.length,
};

export const CASH_TUTORIAL_LIST: CashTutorialMeta[] = [
    {
        id: "jelajah_kas",
        title: "Jelajah Kas & Buku Kas",
        category: "Kas & Bank",
        description: "Memahami dashboard saldo akun, filter mutasi, dan buku arus kas.",
        stepCount: 8,
        badge: "Riwayat",
        isAvailable: true,
    },
    {
        id: "tambah_akun_kas",
        title: "Tambah Akun Kas / Bank",
        category: "Kas & Bank",
        description: "Simulasi membuat akun kas, rekening bank, atau laci kasir baru.",
        stepCount: 5,
        badge: "Tambah",
        isAvailable: true,
    },
    {
        id: "mutasi_kas",
        title: "Catat Mutasi Masuk & Keluar",
        category: "Kas & Bank",
        description: "Simulasi mencatat debit (uang masuk) & kredit (uang keluar) manual.",
        stepCount: 6,
        badge: "Mutasi",
        isAvailable: true,
    },
    {
        id: "transfer_kas",
        title: "Transfer Saldo Antar Akun",
        category: "Kas & Bank",
        description: "Simulasi memindahkan saldo antar kas toko, rekening bank, atau laci kasir.",
        stepCount: 6,
        badge: "Transfer",
        isAvailable: true,
    },
    {
        id: "kelola_akun_kas",
        title: "Ubah & Hapus Akun Kas",
        category: "Kas & Bank",
        description: "Memahami proteksi akun transaksi serta aturan ubah & hapus akun kas.",
        stepCount: 6,
        badge: "Kelola",
        isAvailable: true,
    },
];
