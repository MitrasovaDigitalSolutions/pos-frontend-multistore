import type { JournalTutorialStep } from "../types/journal-tutorial";

export const BUKU_BESAR_TUTORIAL_STEPS: JournalTutorialStep[] = [
    {
        id: "bb-step-1",
        target: "#bb-filter-from",
        title: "1. Filter Rentang Tanggal",
        content: "Gunakan filter tanggal untuk menetapkan periode transaksi buku besar yang ingin Anda tinjau.",
        placement: "bottom",
        skipScroll: true,
    },
    {
        id: "bb-step-2",
        target: "#bb-filter-coa",
        title: "2. Pilih Akun Perkiran",
        content: "Filter transaksi spesifik berdasarkan akun Chart of Accounts (CoA) yang diinginkan.",
        placement: "bottom",
        skipScroll: true,
    },
    {
        id: "bb-step-3",
        target: "#bb-table .overflow-auto",
        title: "3. Tabel Mutasi & Saldo",
        content: "Tabel ini menampilkan riwayat mutasi debit, kredit, dan saldo berjalan akun. Kolom tabel dapat digeser secara horizontal jika layar terbatas.",
        placement: "top",
        skipScroll: true,
    },
    {
        id: "bb-step-4",
        target: "body",
        title: "4. Selesai",
        content: "Anda telah mempelajari cara menjelajah dan memfilter laporan Buku Besar secara efektif.",
        placement: "bottom",
        skipScroll: true,
        isLastStep: true,
        nextLabel: "Selesai",
        variant: "overlay_nav",
        overlayNav: true,
    },
];
