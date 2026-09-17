import type { AuditTutorialId, AuditTutorialStep } from "../types/audit-tutorial";

export const AUDIT_TUTORIAL_STEPS: Record<AuditTutorialId, AuditTutorialStep[]> = {
    inspeksi_aktivitas: [
        {
            target: ".table-action-view",
            title: "1. Tombol Lihat Detail",
            content: "Klik ikon informasi (i) pada baris aktivitas untuk membuka jendela inspeksi mendalam jejak audit sistem.",
            placement: "left",
        },
        {
            target: "#tab-audit-info",
            title: "2. Tab Informasi Utama",
            content: "Periksa rincian petugas pelaksana, alamat IP, sistem operasi, browser klien, serta waktu kejadian tercatat.",
            placement: "bottom",
        },
        {
            target: "#tab-audit-properties",
            title: "3. Tab Properti & Komparasi Data",
            content: "Lihat komparasi nilai sebelum ('Sebelum') dan sesudah ('Sesudah') perubahan data atribut, atau rincian item produk yang terlibat.",
            placement: "bottom",
        },
        {
            target: "#tab-audit-json",
            title: "4. Tab Data Mentah JSON",
            content: "Lihat payload data teknis JSON lengkap dan gunakan tombol 'Salin JSON' jika dibutuhkan untuk keperluan audit forensik.",
            placement: "bottom",
        },
        {
            target: "#btn-close-audit-inspector",
            title: "5. Tutup Jendela Inspeksi",
            content: "Klik tombol silang (X) untuk menutup jendela inspeksi dan kembali ke tabel log aktivitas.",
            placement: "left",
        },
    ],

    filter_aktivitas: [
        {
            target: "#filter-audit-search",
            title: "1. Cari Kata Kunci Aktivitas",
            content: "Ketikkan nomor referensi transaksi, nama petugas, atau tindakan khusus untuk menemukan riwayat log yang spesifik.",
            placement: "bottom",
            autoFill: {
                label: "✨ Isi Kata Kunci",
                target: "#filter-audit-search",
                value: "TRX-20260914",
            },
        },
        {
            target: "#filter-audit-modules",
            title: "2. Filter Berdasarkan Modul",
            content: "Pilih satu atau beberapa modul tertentu (seperti Penjualan, Inventori, Kas & Bank, atau Pengguna) untuk menyaring riwayat berdasarkan domain fitur.",
            placement: "bottom",
        },
        {
            target: "#filter-audit-actions",
            title: "3. Terapkan atau Reset Filter",
            content: "Klik tombol 'Cari & Filter' untuk menampilkan riwayat yang sesuai kriteria, atau klik 'Reset Filter' untuk memulihkan seluruh data.",
            placement: "top",
        },
    ],

    mode_linimasa: [
        {
            target: "#btn-view-mode-timeline",
            title: "1. Beralih ke Mode Linimasa",
            content: "Klik tombol 'Linimasa' untuk beralih dari tabel kolom terstruktur ke format feed kronologis yang dilengkapi ikon visual setiap tindakan.",
            placement: "bottom",
        },
        {
            target: "#timeline-log-card-first",
            title: "2. Kartu Riwayat Linimasa",
            content: "Setiap kartu memvisualisasikan aktor, badge aksi & modul, deskripsi aktivitas, serta waktu kejadian. Arahkan kursor atau klik kartu untuk membuka inspeksi langsung.",
            placement: "bottom",
        },
        {
            target: "#btn-view-mode-table",
            title: "3. Kembali ke Mode Tabel",
            content: "Klik tombol 'Tabel' untuk kembali ke mode tabel data dengan kemampuan pengurutan kolom tanggal dan pagination lengkap.",
            placement: "bottom",
        },
    ],
};
