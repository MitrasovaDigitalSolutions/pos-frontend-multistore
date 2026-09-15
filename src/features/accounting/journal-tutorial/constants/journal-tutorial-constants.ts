import type { JournalTutorialMeta } from "../types/journal-tutorial";
import type { ManualJournal } from "../../types/manual-journal";

export const MOCK_JOURNALS: ManualJournal[] = [
    {
        uid: "mock-journal-1",
        reference_number: "JRN-20260901-0001",
        transaction_date: "2026-09-01",
        description: "Setoran Modal Kas Awal",
        status: "posted",
        created_by: "user-admin",
        creator: { uid: "user-admin", name: "Administrator", username: "admin" },
        created_at: "2026-09-01T08:00:00Z",
        updated_at: "2026-09-01T08:00:00Z",
        lines: [
            {
                chart_of_account_uid: "coa-kas",
                description: "Debit Kas",
                debit: 10000000,
                credit: 0,
                account: { uid: "coa-kas", kode: "1-1001", nama: "Kas Utama" },
            },
            {
                chart_of_account_uid: "coa-modal",
                description: "Kredit Modal Pemilik",
                debit: 0,
                credit: 10000000,
                account: { uid: "coa-modal", kode: "3-1000", nama: "Modal Pemilik" },
            },
        ],
    },
    {
        uid: "mock-journal-2",
        reference_number: "JRN-20260905-0002",
        transaction_date: "2026-09-05",
        description: "Pembelian Perlengkapan Toko",
        status: "draft",
        created_by: "user-admin",
        creator: { uid: "user-admin", name: "Administrator", username: "admin" },
        created_at: "2026-09-05T09:30:00Z",
        updated_at: "2026-09-05T09:30:00Z",
        lines: [
            {
                chart_of_account_uid: "coa-perlengkapan",
                description: "Debit Perlengkapan",
                debit: 500000,
                credit: 0,
                account: { uid: "coa-perlengkapan", kode: "1-1050", nama: "Perlengkapan Toko" },
            },
            {
                chart_of_account_uid: "coa-kas",
                description: "Kredit Kas",
                debit: 0,
                credit: 500000,
                account: { uid: "coa-kas", kode: "1-1001", nama: "Kas Utama" },
            },
        ],
    },
];

export const JOURNAL_TUTORIAL_LIST: JournalTutorialMeta[] = [
    {
        id: "buku_besar",
        title: "Jelajah Buku Besar",
        description: "Panduan navigasi, filter tanggal, dan pemilihan akun pada laporan Buku Besar.",
        category: "Jurnal & Buku Besar",
        stepCount: 4,
        badge: "Dasar Laporan",
        isAvailable: true,
    },
    {
        id: "list_jurnal",
        title: "Kelola List Jurnal",
        description: "Panduan pencarian, filter status, dan peninjauan riwayat transaksi jurnal.",
        category: "Jurnal & Buku Besar",
        stepCount: 6,
        badge: "Manajemen Jurnal",
        isAvailable: true,
    },
    {
        id: "buat_jurnal",
        title: "Buat Jurnal Manual",
        description: "Panduan penginputan entri jurnal umum berpasangan secara eksplisit dan seimbang.",
        category: "Jurnal & Buku Besar",
        stepCount: 10,
        badge: "Alur Utama",
        isAvailable: true,
    },
];
