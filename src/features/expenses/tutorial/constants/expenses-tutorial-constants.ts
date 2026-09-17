import type { Expense, ExpenseCategory, UpcomingDue } from "../../types";
import type { ExpensesTutorialMeta } from "../types/expenses-tutorial";

export const MOCK_EXPENSES: Expense[] = [
    {
        uid: "tutorial-mock-exp-1",
        nomor_pengeluaran: "EXP/Demo/0001",
        nama: "Beban Listrik & Internet Toko (Demo)",
        amount: 750000,
        catatan: "Tagihan bulan berjalan (Demo)",
        tanggal: "2026-09-12",
        expense_category_uid: "tutorial-mock-expcat-1",
        cash_account_uid: "tutorial-mock-cash-1",
        status: "completed",
        category: { uid: "tutorial-mock-expcat-1", nama: "Operasional (Demo)" },
        cash_account: { uid: "tutorial-mock-cash-1", nama: "Kas Toko (Demo)", saldo: 5000000 },
        user: { uid: "tutorial-mock-user-1", name: "Admin Demo" },
    },
    {
        uid: "tutorial-mock-exp-2",
        nomor_pengeluaran: "EXP/Demo/0002",
        nama: "Pembelian ATK & Perlengkapan (Demo)",
        amount: 250000,
        catatan: null,
        tanggal: "2026-09-10",
        expense_category_uid: "tutorial-mock-expcat-2",
        cash_account_uid: "tutorial-mock-cash-1",
        status: "completed",
        category: { uid: "tutorial-mock-expcat-2", nama: "Perlengkapan (Demo)" },
        cash_account: { uid: "tutorial-mock-cash-1", nama: "Kas Toko (Demo)", saldo: 5000000 },
        user: { uid: "tutorial-mock-user-1", name: "Admin Demo" },
    },
];

export const MOCK_EXPENSES_META = {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: MOCK_EXPENSES.length,
};

export const MOCK_CATEGORIES: ExpenseCategory[] = [
    {
        uid: "tutorial-mock-expcat-1",
        nama: "Operasional (Demo)",
        chart_of_account_uid: "tutorial-mock-coa-1",
        keterangan: "Listrik, air, dan internet toko",
        is_recurring: true,
        hari_jatuh_tempo: 10,
    },
    {
        uid: "tutorial-mock-expcat-2",
        nama: "Perlengkapan (Demo)",
        chart_of_account_uid: null,
        keterangan: "ATK & kebutuhan kantor",
        is_recurring: false,
        hari_jatuh_tempo: null,
    },
];

export const MOCK_UPCOMING: UpcomingDue[] = [
    {
        expense_category_uid: "tutorial-mock-expcat-1",
        category_name: "Operasional (Demo)",
        hari_jatuh_tempo: 10,
        tanggal_jatuh_tempo: "2026-09-10",
        status: "upcoming",
        days_left: 3,
    },
    {
        expense_category_uid: "tutorial-mock-expcat-3",
        category_name: "Sewa Ruko (Demo)",
        hari_jatuh_tempo: 5,
        tanggal_jatuh_tempo: "2026-09-05",
        status: "overdue",
        days_left: -2,
    },
];

export const MOCK_CASH_ACCOUNTS = [
    { uid: "tutorial-mock-cash-1", nama: "Kas Toko (Demo)", saldo: 5000000, tipe: "cash" },
];

export const EXPENSES_TUTORIAL_LIST: ExpensesTutorialMeta[] = [
    {
        id: "jelajah_pengeluaran",
        title: "Jelajah Catatan Pengeluaran",
        category: "Pengeluaran",
        description: "Memahami log pengeluaran kas, filter, aksi ubah, dan hapus.",
        stepCount: 8,
        badge: "Riwayat",
        isAvailable: true,
    },
    {
        id: "catat_pengeluaran",
        title: "Catat Pengeluaran Baru",
        category: "Pengeluaran",
        description: "Simulasi mencatat pengeluaran baru lewat form dialog.",
        stepCount: 6,
        badge: "Input",
        isAvailable: true,
    },
    {
        id: "edit_pengeluaran",
        title: "Ubah Catatan Pengeluaran",
        category: "Pengeluaran",
        description: "Simulasi menyunting pengeluaran yang sudah tercatat.",
        stepCount: 6,
        badge: "Ubah",
        isAvailable: true,
    },
    {
        id: "kelola_kategori",
        title: "Kelola Kategori Pengeluaran",
        category: "Pengeluaran",
        description: "Memahami pos pengeluaran (rutin/insidentil) dan pembuatan kategori.",
        stepCount: 7,
        badge: "Kategori",
        isAvailable: true,
    },
];
