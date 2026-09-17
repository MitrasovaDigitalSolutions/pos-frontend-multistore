import type { BalanceSheetTutorialMeta } from "../types/balance-sheet-tutorial";
import type { BalanceSheetData } from "@/features/accounting/types";

export const MOCK_BALANCE_SHEET: BalanceSheetData = {
    as_of_date: "2026-09-15",
    assets: {
        total_assets: 15000000,
        items: [
            {
                uid: "tutorial-mock-asset-1",
                kode: "1-1000",
                nama: "Aset Lancar (Demo)",
                debit: 15000000,
                credit: 0,
                amount: 15000000,
                is_parent: true,
                children: [
                    {
                        uid: "tutorial-mock-asset-101",
                        kode: "1-1001",
                        nama: "Kas Toko (Demo)",
                        debit: 5000000,
                        credit: 0,
                        amount: 5000000,
                        detail: [{ kategori: "Penerimaan Kasir", amount: 5000000 }],
                    },
                    {
                        uid: "tutorial-mock-asset-102",
                        kode: "1-1002",
                        nama: "Rekening Bank BCA (Demo)",
                        debit: 10000000,
                        credit: 0,
                        amount: 10000000,
                        detail: [{ kategori: "Transfer Penjualan", amount: 10000000 }],
                    },
                ],
            },
        ],
    },
    liabilities: {
        total_liabilities: 3000000,
        items: [
            {
                uid: "tutorial-mock-liab-1",
                kode: "2-1000",
                nama: "Kewajiban Jangka Pendek (Demo)",
                debit: 0,
                credit: 3000000,
                amount: 3000000,
                is_parent: true,
                children: [
                    {
                        uid: "tutorial-mock-liab-101",
                        kode: "2-1001",
                        nama: "Hutang Usaha Supplier (Demo)",
                        debit: 0,
                        credit: 3000000,
                        amount: 3000000,
                        detail: [{ kategori: "Pembelian Kredit", amount: 3000000 }],
                    },
                ],
            },
        ],
    },
    equity: {
        total_equity: 12000000,
        items: [
            {
                uid: "tutorial-mock-eq-1",
                kode: "3-1000",
                nama: "Modal Pemilik (Demo)",
                debit: 0,
                credit: 12000000,
                amount: 12000000,
                is_parent: false,
                detail: [{ kategori: "Setoran Modal", amount: 12000000 }],
            },
        ],
    },
    revenue: {
        total_revenue: 25000000,
        items: [
            {
                uid: "tutorial-mock-rev-1",
                kode: "4-1000",
                nama: "Pendapatan Penjualan Toko (Demo)",
                debit: 0,
                credit: 25000000,
                amount: 25000000,
                detail: [{ kategori: "Penjualan Kasir", amount: 25000000 }],
            },
        ],
    },
    expense: {
        total_expense: 15000000,
        items: [
            {
                uid: "tutorial-mock-exp-1",
                kode: "5-1000",
                nama: "Beban Operasional & HPP (Demo)",
                debit: 15000000,
                credit: 0,
                amount: 15000000,
                detail: [{ kategori: "HPP Penjualan", amount: 15000000 }],
            },
        ],
    },
    shu: {
        total: 0,
        berjalan: 0,
        lalu: 0,
    },
    is_balanced: true,
};

export const BALANCE_SHEET_TUTORIAL_LIST: BalanceSheetTutorialMeta[] = [
    {
        id: "jelajah_neraca",
        title: "Jelajah Neraca Keuangan",
        description: "Panduan memahami struktur posisi keuangan (Aset, Kewajiban, Ekuitas), rincian akun, dan ekspor laporan.",
        category: "Laporan Neraca",
        stepCount: 8,
        badge: "Posisi Keuangan",
        isAvailable: true,
    },
    {
        id: "mode_laporan",
        title: "Mode Laba Rugi & Persamaan",
        description: "Panduan beralih ke mode Laba Rugi dan Persamaan Akuntansi untuk analisis multi-perspektif.",
        category: "Laporan Neraca",
        stepCount: 4,
        badge: "Multi-Perspektif",
        isAvailable: true,
    },
];
