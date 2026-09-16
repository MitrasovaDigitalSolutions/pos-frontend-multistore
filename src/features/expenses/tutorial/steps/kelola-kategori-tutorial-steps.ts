import type { ExpensesTutorialStep } from "../types/expenses-tutorial";

export const KELOLA_KATEGORI_TUTORIAL_STEPS: ExpensesTutorialStep[] = [
    {
        id: "kk-step-1",
        target: "#kategori-header",
        fallbackTarget: "body",
        title: "1. Kategori Pengeluaran",
        content: "Kategori adalah pos-pos pengeluaran toko (mis. Listrik, Sewa, Gaji Karyawan) yang mempermudah pelaporan biaya.",
        placement: "bottom",
        skipScroll: true,
        variant: "overlay_nav",
        overlayNav: true,
        // Pastikan dialog tertutup saat masuk step ini (termasuk mundur dari step berikutnya).
        closeDialog: "#category-dialog-close",
    },
    {
        id: "kk-step-2",
        target: "#kategori-table",
        title: "2. Tabel Kategori",
        content: "Setiap baris memuat nama kategori, tipe (rutin/insidentil), tanggal jatuh tempo, Chart of Account, dan keterangan.",
        placement: "top",
        skipScroll: true,
        variant: "overlay_nav",
        overlayNav: true,
        // Saat mundur dari step 3 (dialog terbuka) dialog ditutup agar spotlight di tabel bersih.
        closeDialog: "#category-dialog-close",
    },
    {
        id: "kk-step-3",
        target: "#kategori-btn-add",
        fallbackTarget: "#kategori-table",
        title: "3. Tambah Kategori",
        content: "Tombol ini membuka form untuk membuat kategori pengeluaran baru.",
        placement: "bottom",
        skipScroll: true,
        // Step ini hanya menyorot tombol (bukan membuka dialog). Tutup dialog bila
        // sedang terbuka (mis. mundur dari step 4) supaya tombol tetap terlihat.
        closeDialog: "#category-dialog-close",
    },
    {
        id: "kk-step-4",
        target: "#category-dialog-body",
        title: "4. Form Kategori Baru",
        content: "Isi detail kategori baru pada form ini: nama pos pengeluaran, Chart of Account (opsional), jenis (rutin/insidentil), dan keterangan.",
        placement: "bottom",
        skipScroll: true,
        variant: "overlay_nav",
        overlayNav: true,
        // Buka dialog saat masuk step ini (maju dari step 3 maupun mundur dari step 5+).
        simulateClick: "#kategori-btn-add",
    },
    {
        id: "kk-step-5",
        target: "#category-dialog-fields",
        title: "5. Nama, CoA & Jenis",
        content: "Masukkan nama kategori dan pilih Chart of Account. Untuk pengeluaran rutin/berulang (mis. listrik bulanan), tentukan tanggal jatuh tempo bulanan (1–31) agar muncul di pengingat jadwal pengeluaran.",
        placement: "bottom",
        skipScroll: true,
        variant: "overlay_nav",
        overlayNav: true,
        simulateClick: "#kategori-btn-add",
    },
    {
        id: "kk-step-6",
        target: "#category-dialog-submit",
        title: "6. Buat Kategori (Demo)",
        content: "Tombol ini menyimpan kategori baru. Pada mode tutorial kita berhenti di sini — kategori tidak akan disimpan.",
        placement: "top",
        skipScroll: true,
        simulateClick: "#kategori-btn-add",
    },
    {
        id: "kk-step-7",
        target: "body",
        title: "7. Selesai: Kategori Terkelola",
        content: "Dialog ditutup dan Anda kembali ke daftar kategori. Kategori baru dapat langsung dipakai saat mencatat pengeluaran.",
        placement: "center",
        skipScroll: true,
        closeDialog: "#category-dialog-close",
        isLastStep: true,
        nextLabel: "Selesai",
    },
];
