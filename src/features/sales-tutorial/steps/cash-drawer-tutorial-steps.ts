import type { SalesJoyrideStep } from "../types/sales-tutorial";

export const CASH_DRAWER_TUTORIAL_STEPS: SalesJoyrideStep[] = [
    {
        target: "#cash-drawer-header-bar",
        fallbackTarget: "#cash-drawer-sample-row-0",
        title: "1. Pengenalan Modul Sesi Kasir & Shift",
        content:
            "Modul Sesi Kasir berfungsi mengontrol seluruh perputaran uang fisik di laci kasir (Cash Drawer). Sistem mencatat jam buka/tutup shift, operator kasir bertugas, modal awal, hingga rekonsiliasi selisih kas saat tutup kasir.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#cash-drawer-header-bar" },
    },
    {
        target: "#cash-drawer-filter-header",
        fallbackTarget: "#cash-drawer-header-bar",
        title: "2. Filter & Pencarian Sesi Shift",
        content:
            "Gunakan baris filter ini untuk menyaring riwayat shift berdasarkan Operator Kasir, Status Sesi (Terbuka/Ditutup), serta Rentang Tanggal operasional.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#cash-drawer-filter-header" },
    },
    {
        target: "#cash-drawer-sample-row-0",
        fallbackTarget: "#cash-drawer-header-bar",
        title: "3. Riwayat Sesi Kasir (Ringkasan Baris)",
        content:
            "Setiap baris merangkum satu sesi shift kasir lengkap: nama petugas kasir, jam buka & tutup shift, total kas sistem (Expected Cash), nilai selisih fisik kas, serta status sesi saat ini.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#cash-drawer-sample-row-0" },
    },
    {
        target: "#cash-drawer-col-expected-cash",
        fallbackTarget: "#cash-drawer-sample-row-0",
        title: "4. Nilai Expected Cash & Selisih Laci",
        content:
            "Expected Cash adalah saldo kas yang seharusnya ada di laci kasir:\n\nModal Awal + Penjualan Tunai + Kas Masuk - Kas Keluar.\n\nKolom Selisih menunjukkan status kas fisik: '0' jika seimbang/pas, hijau (+) jika ada uang fisik berlebih (surplus), atau merah (-) jika uang fisik kurang (defisit).",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#cash-drawer-col-expected-cash" },
    },
    {
        target: "#cash-drawer-btn-detail-0, #cash-drawer-sample-row-0 button[data-action=\"view\"]",
        fallbackTarget: "#cash-drawer-sample-row-0",
        title: "5. Membuka Detail & Audit Sesi Kasir",
        content:
            "Klik tombol 'Detail' untuk membuka dialog pemeriksaan komprehensif. Mari kita masuk ke dalam dialog untuk membedah seluruh rekonsiliasi dan laporan keuangan shift kasir.",
        placement: "bottom",
        disableBeacon: true,
        action: {
            type: "click_element",
            selector: "#cash-drawer-btn-detail-0, #cash-drawer-sample-row-0 button[data-action=\"view\"]",
        },
    },
    {
        target: "#session-detail-header",
        fallbackTarget: "body",
        title: "6. Identitas & Status Sesi Kasir",
        content:
            "Di bagian paling atas, tertera nomor unik ID Sesi Kasir (lengkap dengan tombol salin), nama operator kasir penanggung jawab laci, serta StatusBadge yang menunjukkan apakah sesi sedang 'Terbuka' aktif melayani atau sudah 'Ditutup'.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-header" },
    },
    {
        target: "#session-detail-tabs-nav",
        fallbackTarget: "#session-detail-header",
        title: "7. Mengenal 3 Tab Utama Audit Sesi",
        content:
            "Di dalam dialog detail sesi kasir ini terdapat 3 tab utama untuk audit komprehensif:\n1. Tab Ringkasan: ikhtisar status shift, rekonsiliasi kas, arus kas masuk/keluar, dan rasio omset.\n2. Tab Riwayat Arus Kas: log kronologis mutasi kas detik demi detik.\n3. Tab Daftar Penjualan: seluruh struk transaksi yang diterbitkan selama shift.\n\nMari kita bedah mulai dari Tab Ringkasan dari atas sampai ke bawah!",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-tabs-nav" },
    },
    {
        target: "#session-detail-status-banner",
        fallbackTarget: "#session-detail-header",
        title: "8. Banner Status Operasional Shift",
        content:
            "Banner ini menginformasikan status real-time shift kasir. Jika sesi sedang berjalan (Terbuka), perkiraan saldo diperbarui secara otomatis setiap ada transaksi tunai di POS. Jika telah ditutup, banner mencatat nama petugas/supervisor yang memvalidasi penutupan shift.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-status-banner" },
    },
    {
        target: "#session-detail-metadata-grid",
        fallbackTarget: "#session-detail-header",
        title: "9. Informasi Waktu & Durasi Shift",
        content:
            "Empat kartu ringkas menampilkan:\n• Waktu Buka: jam kasir mulai membuka laci kasir.\n• Waktu Tutup: jam kasir mengakhiri shift kerjanya.\n• Durasi Shift: total waktu operasional shift (misal 7 Jam 30 Menit).\n• Petugas Shift: nama resmi kasir yang bertugas.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-metadata-grid" },
    },
    {
        target: "#session-detail-reconciliation",
        fallbackTarget: "#session-detail-header",
        title: "10. Rekonsiliasi Kas Laci (Drawer Cash)",
        content:
            "Jantung transparansi keuangan kasir yang membandingkan 3 angka krusial:\n• Ekspektasi Kas Sistem: perhitungan matematis sistem dari modal awal dan penjualan.\n• Uang Fisik Dilaporkan: jumlah uang tunai fisik yang dihitung kasir saat tutup shift.\n• Selisih Kas: mendeteksi kas Pas (Rp 0), Kelebihan Kas (Surplus), atau Kekurangan Kas (Shortage) beserta kotak analisis potensi penyebabnya.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-reconciliation" },
    },
    {
        target: "#session-detail-inflow-outflow",
        fallbackTarget: "#session-detail-header",
        title: "11. Rincian Arus Kas Masuk & Kas Keluar",
        content:
            "Membedah pergerakan uang tunai fisik di laci kas:\n• Aliran Kas Masuk (Inflow): Modal Awal buka laci + Total Penjualan Tunai + Kas Masuk Manual (Cash In).\n• Aliran Kas Keluar (Outflow): Pengeluaran Operasional Toko dari laci (Cash Out) + Refund Tunai ke pelanggan.",
        placement: "top",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-inflow-outflow" },
    },
    {
        target: "#session-detail-sales-summary-header",
        fallbackTarget: "#session-detail-sales-summary",
        title: "12. Ikhtisar Penjualan & Rasio Metode Bayar",
        content:
            "Merangkum performa bisnis: Penjualan Kotor, Diskon, Pajak, dan Penjualan Bersih.\n\nDilengkapi Bar Rasio Metode Bayar yang memisahkan uang Tunai (masuk laci), Card/EDC (masuk bank), serta Piutang/Tempo konsumen (lengkap dengan rincian DP Tunai/Card dan sisa piutang berjalan).",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-sales-summary-header" },
    },
    {
        target: "#session-detail-notes-section",
        fallbackTarget: "#session-detail-header",
        title: "13. Catatan Buka & Tutup Shift",
        content:
            "Berisi memo atau pesan penting yang dicatat kasir:\n• Catatan Buka: keterangan saat mulai buka shift (misal kondisi uang pecahan kembalian).\n• Catatan Tutup: penjelasan kasir saat mengakhiri shift, terutama jika terdapat selisih uang kas fisik.",
        placement: "top",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-notes-section" },
    },
    {
        target: "#session-detail-btn-close-shift, #session-detail-status-banner",
        fallbackTarget: "#session-detail-header",
        title: "14. Prosedur & Fitur Tutup Sesi (Close Shift)",
        content:
            "Saat kasir mengakhiri shift kerjanya:\n1. Klik tombol 'Tutup Sesi'.\n2. Melakukan Cash Count (hitung fisik seluruh uang di laci kas) dan input ke form.\n3. Sistem mencocokkan fisik dengan ekspektasi kas.\n4. Konfirmasi penutupan akan mengunci shift dan otomatis mencetak struk setoran/rekap kasir.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-btn-close-shift, #session-detail-status-banner" },
    },
    {
        target: "#session-detail-tab-trigger-movements",
        fallbackTarget: "#session-detail-tabs-nav",
        title: "15. Beralih ke Tab Riwayat Arus Kas",
        content:
            "Sekarang, mari kita beralih ke Tab 'Riwayat Arus Kas' untuk melihat seluruh kronologi mutasi uang tunai di laci kasir detik demi detik.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "click_element", selector: "#session-detail-tab-trigger-movements" },
    },
    {
        target: "#session-detail-movement-item-first",
        fallbackTarget: "#session-detail-movements-content",
        title: "16. Informasi Riwayat Arus Kas (Timeline Mutasi)",
        content:
            "Tab ini menyajikan catatan kronologis mutasi kas laci:\n• Garis waktu (timeline) urut dari mutasi terbaru hingga modal awal.\n• Jenis Aktivitas: Buka Shift (Modal), Penjualan Tunai POS, Kas Masuk (Cash In), Kas Keluar (Cash Out), Refund Tunai, hingga Tutup Shift.\n• Waktu presisi kejadian dan nominal kas (+ hijau masuk, - merah keluar).\n• Sangat efektif untuk melacak pengeluaran kas kecil toko!",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-movement-item-first" },
    },
    {
        target: "#session-detail-tab-trigger-transactions",
        fallbackTarget: "#session-detail-tabs-nav",
        title: "17. Beralih ke Tab Daftar Penjualan",
        content:
            "Terakhir, mari kita buka Tab 'Daftar Penjualan' untuk memeriksa seluruh nota belanja yang dihasilkan kasir selama shift berlangsung.",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "click_element", selector: "#session-detail-tab-trigger-transactions" },
    },
    {
        target: "#session-detail-transaction-row-first",
        fallbackTarget: "#session-detail-transactions-content",
        title: "18. Informasi Daftar Penjualan Shift",
        content:
            "Tab ini menampilkan tabel seluruh faktur belanja di shift ini:\n• Nomor Transaksi unik dan nama pelanggan/member.\n• Waktu jam transaksi dicetak.\n• Metode Pembayaran yang digunakan pembeli (Tunai, Kartu, atau Tempo).\n• Jumlah item barang yang dibeli dan total nilai nota.\n• Jika terjadi selisih kas, supervisor dapat mencocokkan fisik nota dari daftar ini!",
        placement: "bottom",
        disableBeacon: true,
        action: { type: "highlight_only", selector: "#session-detail-transaction-row-first" },
    },
    {
        target: "body",
        title: "19. Selesai: Kuasai Modul Sesi Kasir & Shift!",
        content:
            "Selamat! Anda telah memahami seluruh alur modul Sesi Kasir secara runtut dan mendalam: mulai dari daftar shift, rekonsiliasi laci kas, rincian arus kas masuk/keluar, log pergerakan uang tunai, hingga daftar transaksi penjualan.",
        placement: "center",
        disableBeacon: true,
    },
];
