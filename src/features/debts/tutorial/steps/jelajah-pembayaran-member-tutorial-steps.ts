import type { HutangTutorialStep } from "../types/hutang-tutorial";

export const JELAJAH_PEMBAYARAN_MEMBER_TUTORIAL_STEPS: HutangTutorialStep[] = [
    {
        id: "jpm-step-1",
        target: "#pembayaran-member-header",
        fallbackTarget: "body",
        title: "1. Riwayat Pembayaran Hutang",
        content: "Halaman ini mencatat seluruh pembayaran dan cicilan hutang member yang telah diproses di kasir.",
        placement: "bottom",
        skipScroll: true,
        variant: "overlay_nav",
        overlayNav: true,
    },
    {
        id: "jpm-step-2",
        target: "#pembayaran-member-filter-form",
        title: "2. Filter Pencarian",
        content: "Cari riwayat pembayaran berdasarkan nama atau kode member untuk menelusuri mutasi tertentu.",
        placement: "bottom",
        skipScroll: true,
        variant: "overlay_nav",
        overlayNav: true,
    },
    {
        id: "jpm-step-3",
        target: "#pembayaran-member-table",
        title: "3. Tabel Riwayat",
        content: "Kolom Mutasi Hutang memperlihatkan sisa hutang sebelum → sesudah pembayaran, beserta metode bayar dan status.",
        placement: "top",
        skipScroll: true,
        variant: "overlay_nav",
        overlayNav: true,
    },
    {
        id: "jpm-step-4",
        target: "#pembayaran-member-row-action",
        fallbackTarget: "#pembayaran-member-table",
        title: "4. Aksi Void (Batalkan)",
        content: "Tombol ini membatalkan pembayaran yang salah (void). Klik untuk membuka dialog konfirmasi.",
        placement: "bottom",
        skipScroll: true,
        // Pastikan dialog tertutup saat masuk step ini (baik dari step 3 maju maupun
        // dari step 5 mundur), supaya spotlight bersih di tombol aksi.
        closeDialog: "#pembayaran-void-dialog-content button:not(#pembayaran-void-submit)",
    },
    {
        id: "jpm-step-5",
        target: "#pembayaran-void-dialog",
        title: "5. Dialog Konfirmasi Void",
        content: "Void mengembalikan sisa hutang member ke kondisi sebelum pembayaran. Isi alasan pembatalan pada kolom yang tersedia.",
        placement: "bottom",
        skipScroll: true,
        variant: "overlay_nav",
        overlayNav: true,
        // Buka dialog void saat masuk step ini (dari step 4 maju maupun step 6 mundur).
        simulateClick: "#pembayaran-member-row-action, .table-action-delete",
    },
    {
        id: "jpm-step-6",
        target: "#pembayaran-void-submit",
        title: "6. Konfirmasi (Demo)",
        content: "Tombol ini mengeksekusi void. Pada mode tutorial kita berhenti di sini — pembatalan tidak akan difinalkan.",
        placement: "top",
        skipScroll: true,
        // Buka dialog lagi saat masuk step ini (mis. mundur dari step 7) agar tombol
        // konfirmasi di dalam dialog tersedia.
        simulateClick: "#pembayaran-member-row-action, .table-action-delete",
    },
    {
        id: "jpm-step-7",
        target: "body",
        title: "7. Selesai: Audit Pembayaran Dipahami",
        content: "Dialog ditutup dan Anda kembali ke daftar. Riwayat pembayaran membantu audit mutasi hutang member secara transparan.",
        placement: "center",
        skipScroll: true,
        closeDialog: "#pembayaran-void-dialog-content button:not(#pembayaran-void-submit)",
        isLastStep: true,
        nextLabel: "Selesai",
    },
];
