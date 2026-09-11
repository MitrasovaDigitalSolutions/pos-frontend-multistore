import type { MembersTutorialId, MembersTutorialStep } from "../types/members-tutorial";

export const MEMBERS_TUTORIAL_STEPS: Record<MembersTutorialId, MembersTutorialStep[]> = {
    tambah_member: [
        {
            target: "#btn-tambah-member",
            title: "1. Tombol Tambah Member",
            content: "Klik tombol 'Tambah Member' untuk membuka form pendaftaran pelanggan baru ke sistem loyalitas.",
            placement: "bottom",
        },
        {
            target: "#form-member-nama",
            title: "2. Input Nama Member",
            content: "Masukkan nama lengkap pelanggan. Nama ini akan tampil di struk kasir dan laporan transaksi.",
            placement: "bottom",
            autoFill: {
                label: "✨ Isi Nama Contoh",
                target: "#form-member-nama input",
                value: "Ahmad Rizky Pratama",
            },
        },
        {
            target: "#form-member-contact-row",
            title: "3. Email & No. Telepon",
            content: "Isi email dan nomor telepon pelanggan untuk keperluan notifikasi promo dan kontak follow-up.",
            placement: "bottom",
            autoFill: {
                label: "✨ Isi Kontak Contoh",
                fields: [
                    { target: "#form-member-email input", value: "ahmad.rizky@email.com" },
                    { target: "#form-member-telepon input", value: "081298765432" },
                ],
            },
        },
        {
            target: "#form-member-demografi-row",
            title: "4. Jenis Kelamin & Tanggal Lahir",
            content: "Data demografi opsional untuk segmentasi pelanggan dan promo ulang tahun otomatis.",
            placement: "bottom",
        },
        {
            target: "#form-member-poin-status-row",
            title: "5. Poin Awal & Status",
            content: "Tentukan poin awal loyalitas dan status keanggotaan (Aktif/Nonaktif).",
            placement: "bottom",
        },
        {
            target: "#btn-submit-member",
            title: "6. Simpan Member Baru",
            content: "Klik tombol ini untuk menyimpan data pelanggan baru ke dalam sistem.",
            placement: "top",
        },
    ],

    edit_member: [
        {
            target: ".table-action-edit",
            title: "1. Tombol Edit Member",
            content: "Klik tombol Edit (ikon pensil kuning) pada baris member di tabel untuk membuka form perubahan data.",
            placement: "left",
        },
        {
            target: "#form-member-nama",
            title: "2. Perbarui Data Member",
            content: "Ubah nama, kontak, alamat, atau informasi lainnya sesuai kebutuhan.",
            placement: "bottom",
            autoFill: {
                label: "✨ Ubah Nama Contoh",
                target: "#form-member-nama input",
                value: "Budi Santoso (Updated)",
            },
        },
        {
            target: "#btn-submit-member",
            title: "3. Simpan Perubahan",
            content: "Klik tombol 'Simpan Perubahan' untuk menerapkan data terbaru.",
            placement: "top",
        },
    ],

    sesuaikan_poin: [
        {
            target: ".table-action-adjust-points",
            title: "1. Tombol Sesuaikan Poin",
            content: "Klik tombol Poin (ikon bintang hijau) pada baris member untuk membuka dialog penyesuaian poin loyalitas.",
            placement: "left",
        },
        {
            target: "#adjust-points-type",
            title: "2. Pilih Tipe Penyesuaian",
            content: "Pilih apakah ingin menambah atau mengurangi poin member.",
            placement: "bottom",
        },
        {
            target: "#adjust-points-amount",
            title: "3. Jumlah Poin & Catatan",
            content: "Masukkan jumlah poin dan keterangan alasan penyesuaian (contoh: Bonus pembelian, Refund).",
            placement: "bottom",
            autoFill: {
                label: "✨ Isi Poin Contoh",
                fields: [
                    { target: "#adjust-points-amount input", value: "500" },
                    { target: "#adjust-points-note input", value: "Bonus pembelian bulanan" },
                ],
            },
        },
        {
            target: "#btn-submit-adjust-points",
            title: "4. Simpan Penyesuaian",
            content: "Klik tombol ini untuk menerapkan perubahan poin. Saldo poin member akan langsung diperbarui.",
            placement: "top",
        },
    ],

    hapus_member: [
        {
            target: ".table-action-delete",
            title: "1. Tombol Hapus Member",
            content: "Klik tombol Hapus (ikon tempat sampah merah) pada baris member yang ingin dihapus.",
            placement: "left",
        },
        {
            target: "#confirm-delete-dialog-content",
            title: "2. Konfirmasi Penghapusan",
            content: "Sistem meminta konfirmasi agar data member tidak terhapus secara tidak sengaja. Klik 'Ya, Hapus' untuk melanjutkan.",
            placement: "top",
        },
    ],

    filter_member: [
        {
            target: "#member-table-filters",
            title: "1. Pencarian Cepat",
            content: "Ketik kode member, nama, email, atau nomor telepon untuk menemukan pelanggan secara instan.",
            placement: "bottom",
            autoFill: {
                label: "✨ Cari 'Budi'",
                target: "#member-table-filters input",
                value: "Budi",
            },
        },
        {
            target: "#member-table-filters",
            title: "2. Filter Status Keanggotaan",
            content: "Saring daftar member berdasarkan status Aktif atau Nonaktif untuk manajemen keanggotaan.",
            placement: "bottom",
        },
    ],
};
