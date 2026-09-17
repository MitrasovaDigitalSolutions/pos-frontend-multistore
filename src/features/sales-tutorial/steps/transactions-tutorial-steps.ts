import type { SalesJoyrideStep } from "../types/sales-tutorial";

export const TRANSACTIONS_TUTORIAL_STEPS: SalesJoyrideStep[] = [
    {
        target: "#transactions-header-bar",
        fallbackTarget: "#transactions-container",
        title: "1. Pengenalan Riwayat Transaksi Penjualan",
        content:
            "Modul Daftar Transaksi adalah buku besar seluruh nota belanja kasir di toko. Setiap faktur mencatat waktu presisi, petugas kasir, memotong stok produk secara otomatis, dan membukukan pendapatan ke laporan keuangan.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#transactions-header-bar" },
    },
    {
        target: "#transactions-filter-header",
        fallbackTarget: "#transactions-header-bar",
        title: "2. Filter & Pencarian Cepat Transaksi",
        content:
            "Gunakan baris filter ini untuk menyaring transaksi berdasarkan rentang tanggal, status nota, metode pembayaran, atau melacak nomor nota belanja (TRX-...) secara instan.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#transactions-filter-header" },
    },
    {
        target: "#transactions-sample-row-0",
        fallbackTarget: "#transactions-header-bar",
        title: "3. Riwayat Faktur Penjualan (Sampel Baris)",
        content:
            "Setiap baris merangkum satu transaksi penjualan konsumen:\n• No. Transaksi: nomor unik faktur POS untuk audit struk belanja.\n• Kasir & Waktu: operator yang melayani dan waktu presisi transaksi.\n• Status, Metode Pembayaran, dan Total Nilai Belanja.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#transactions-sample-row-0" },
    },
    {
        target: "#transactions-col-total-0",
        fallbackTarget: "#transactions-sample-row-0",
        title: "4. Nominal Total & Tooltip Pembayaran",
        content:
            "Arahkan kursor ke ikon info pada kolom Total untuk melihat realisasi pembayaran:\n• Tunai: kas fisik yang masuk ke laci kasir.\n• Non-Tunai: pembayaran kartu debit/kredit/QRIS yang masuk ke rekening bank.\n• Piutang/Tempo: bila bertempo, rincian memuat Uang Muka (DP) serta Sisa Piutang pelanggan.",
        placement: "left",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#transactions-col-total-0" },
    },
    {
        target: "#transactions-col-status-0",
        fallbackTarget: "#transactions-sample-row-0",
        title: "5. Status Transaksi & Validitas Nota",
        content:
            "Memahami status keabsahan transaksi:\n• Selesai (Completed): transaksi sah, pembayaran lunas, dan stok barang telah otomatis terpotong.\n• Void / Batal: transaksi dibatalkan kasir/supervisor; nilai transaksi dikeluarkan dari omset, dan stok barang otomatis dikembalikan (rollback) ke gudang.\n• Draft: transaksi yang baru disimpan sementara.",
        placement: "left",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#transactions-col-status-0" },
    },
    {
        target: "#transactions-sample-row-0 [data-action='view'], #transactions-btn-view-0, #transactions-sample-row-0",
        fallbackTarget: "#transactions-sample-row-0",
        title: "6. Buka Halaman Detail Transaksi",
        content:
            "Klik tombol 'Detail' atau baris transaksi ini untuk berpindah ke halaman baru yang membedah seluruh rekaman transaksi secara utuh dan menyeluruh.",
        placement: "left",
        disableBeacon: true,
        action: {
            type: "click_element",
            selector: "#transactions-sample-row-0 [data-action='view'], #transactions-btn-view-0, #transactions-sample-row-0",
        },
    },
    {
        target: "#trx-detail-header-info",
        fallbackTarget: "#trx-detail-btn-back",
        title: "7. Nomor Nota & Status Halaman Detail",
        content:
            "Pada bagian atas halaman detail, Anda dapat melihat nomor transaksi unik, status faktur (Selesai/Void), nama transaksi, serta navigasi rekam jejak (breadcrumbs) untuk mempermudah navigasi sistem.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#trx-detail-header-info" },
    },
    {
        target: "#trx-detail-btn-print",
        fallbackTarget: "#trx-detail-header-info",
        title: "8. Cetak Ulang Struk Kasir Thermal",
        content:
            "Tombol ini mencetak ulang struk kasir thermal 58mm langsung ke printer Bluetooth atau USB POS toko kapan pun pelanggan membutuhkan nota fisik bukti pembelian.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#trx-detail-btn-print" },
    },
    {
        target: "#trx-detail-btn-void",
        fallbackTarget: "#trx-detail-header-info",
        title: "9. Fitur Pembatalan Transaksi (Void)",
        content:
            "Jika ada pembatalan belanja atau retur langsung kasir, tombol ini membatalkan transaksi, mencatat alasan void ke sistem audit log, dan otomatis mengembalikan seluruh stok barang ke gudang toko.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#trx-detail-btn-void" },
    },
    {
        target: "#trx-detail-sample-item-row-0",
        fallbackTarget: "#trx-detail-items-card",
        title: "10. Rincian Item Belanja & Profit Per Barang",
        content:
            "Tabel ini membedah seluruh produk yang dibeli: nama barang, barcode, harga modal (HPP), harga jual toko, jumlah (pcs), diskon grosir, subtotal, hingga estimasi laba kotor per item.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#trx-detail-sample-item-row-0" },
    },
    {
        target: "#trx-detail-summary-metrics",
        fallbackTarget: "#trx-detail-header-info",
        title: "11. Ringkasan Total Omset & Margin Keuntungan",
        content:
            "Kartu ringkas ini menyandingkan Total Penjualan yang diterima toko dengan Total Keuntungan Bersih serta Persentase Margin Laba dari transaksi ini untuk mengevaluasi profitabilitas bisnis.",
        placement: "top",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#trx-detail-summary-metrics" },
    },
    {
        target: "#trx-detail-summary-breakdown",
        fallbackTarget: "#trx-detail-header-info",
        title: "12. Rincian Biaya, Diskon & Aliran Kas Masuk",
        content:
            "Memeriksa kalkulasi finansial nota:\n• Subtotal kotor, Diskon Faktur/Kupon, Diskon Grosir, dan Pajak PPN.\n• Metode Pembayaran: Tunai, Kartu EDC, atau Tempo.\n• Realisasi kas: nominal uang diterima kasir dan kembalian pelanggan.",
        placement: "top",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#trx-detail-summary-breakdown" },
    },
    {
        target: "#trx-detail-summary-auth",
        fallbackTarget: "#trx-detail-header-info",
        title: "13. Otorisasi Petugas, Waktu & Data Pelanggan",
        content:
            "Mencatat nama operator kasir yang melayani pesanan, jam belanja presisi, data member/pelanggan setia, serta catatan transaksi atau nomor meja pesanan.",
        placement: "top",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#trx-detail-summary-auth" },
    },
    {
        target: "#trx-detail-btn-back",
        fallbackTarget: "#trx-detail-header-info",
        title: "14. Kembali ke Daftar Transaksi",
        content:
            "Gunakan tombol kembali ini untuk berpindah kembali ke halaman utama daftar riwayat transaksi penjualan.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#trx-detail-btn-back" },
    },
    {
        target: "body",
        title: "15. Selesai: Kuasai Audit Riwayat Transaksi!",
        content:
            "Selamat! Anda telah memahami seluruh alur pelacakan riwayat transaksi penjualan: dari penyaringan nota kasir, pembukaan halaman detail baru, analisis keranjang dan laba, hingga cetak struk dan pembatalan transaksi.",
        placement: "center",
        disableBeacon: true,
    },
];
