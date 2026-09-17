import type { AccountingTutorialId, AccountingTutorialStep } from "../types/accounting-tutorial";

export const COA_TUTORIAL_STEPS: Record<AccountingTutorialId, AccountingTutorialStep[]> = {
    tambah_akun: [
        {
            target: "#btn-tambah-akun",
            title: "1. Tombol Tambah Akun",
            content: "Klik tombol 'Tambah Akun' untuk membuka dialog pendaftaran akun baru pada Chart of Accounts.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#form-coa-parent",
            title: "2. Pilih Akun Induk",
            content: "Pilih akun induk (parent account) jika akun ini merupakan sub-akun (child account).",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#kode",
            title: "3. Input Kode Akun",
            content: "Masukkan kode unik akun sesuai dengan struktur penomoran sistem akuntansi.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Isi Kode Contoh",
                target: "#kode",
                value: "1101",
            },
        },
        {
            target: "#nama",
            title: "4. Input Nama Akun",
            content: "Masukkan nama deskriptif akun akuntansi.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Isi Nama Contoh",
                target: "#nama",
                value: "Kas Kecil (Demo)",
            },
        },
        {
            target: "#form-coa-tipe",
            title: "5. Tipe Akun & Saldo Normal",
            content: "Pilih klasifikasi tipe akun (Asset, Liability, Equity, Revenue, Expense) serta posisi saldo normalnya.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#btn-submit-coa",
            title: "6. Simpan Akun Baru",
            content: "Klik tombol ini untuk menyimpan data akun ke dalam Chart of Accounts.",
            placement: "top",
            skipScroll: true,
        },
    ],

    edit_akun: [
        {
            target: "#coa-tree-table .table-action-edit",
            title: "1. Tombol Edit Akun",
            content: "Klik tombol Edit pada baris akun di tabel untuk mengubah informasi akun.",
            placement: "left",
            skipScroll: true,
        },
        {
            target: "#edit_nama",
            title: "2. Perbarui Informasi Akun",
            content: "Ubah nama, kode, atau keterangan akun sesuai kebutuhan.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Ubah Nama Contoh",
                target: "#edit_nama",
                value: "Kas Kecil (Demo) (Diperbarui)",
            },
        },
        {
            target: "#btn-submit-coa",
            title: "3. Simpan Perubahan",
            content: "Klik tombol 'Simpan Perubahan' untuk menerapkan data terbaru.",
            placement: "top",
            skipScroll: true,
        },
    ],

    hapus_akun: [
        {
            target: "#coa-tree-table .table-action-delete",
            title: "1. Tombol Hapus Akun",
            content: "Klik ikon hapus pada baris akun yang ingin dihapus dari sistem.",
            placement: "left",
            skipScroll: true,
        },
        {
            target: "#confirm-delete-dialog-content",
            title: "2. Konfirmasi Penghapusan",
            content: "Sistem menampilkan dialog konfirmasi. Pada mode simulasi ini, data akun demo aman.",
            placement: "top",
            skipScroll: true,
            variant: "overlay_nav",
            overlayNav: true,
            spotlightClicks: false,
        },
        {
            target: "#confirm-delete-dialog-content",
            title: "3. Eksekusi Hapus",
            content: "Klik tombol Konfirmasi Hapus pada dialog. Data akun demo simulasi akan dihapus.",
            placement: "top",
            skipScroll: true,
            variant: "overlay_nav",
            overlayNav: true,
            spotlightClicks: false,
        },
        {
            target: "body",
            title: "4. Selesai",
            content: "Proses penghapusan akun demo selesai. Data toko Anda tetap aman.",
            placement: "bottom",
            skipScroll: true,
            variant: "overlay_nav",
            overlayNav: true,
        },
    ],
};
