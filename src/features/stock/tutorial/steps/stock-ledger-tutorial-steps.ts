import type { StockTutorialStep } from "../types/stock-tutorial";

export const STOCK_LEDGER_STEPS: StockTutorialStep[] = [
    {
        target: "#stock-ledger-header",
        title: "1. Pengenalan Modul Kartu Stok",
        content:
            "Kartu Stok (Buku Mutasi) mencatat seluruh riwayat keluar-masuk barang secara otomatis dan kronologis dari segala aktivitas: kasir POS, penerimaan gudang, hasil produksi, transfer cabang, dan opname.",
        placement: "bottom",
    },
    {
        target: "#ledger-search-input",
        title: "2. Pencarian Produk & Transaksi",
        content:
            "Cari riwayat mutasi untuk produk tertentu berdasarkan nama barang, barcode, atau telusuri nomor nota transaksi dan kode batch produksi.",
        placement: "bottom",
        action: {
            type: "type_text",
            target: "#ledger-search-input input",
            text: "Kopi Arabika",
        },
    },
    {
        target: "#ledger-type-filter",
        title: "3. Filter Tipe Perubahan Stok",
        content:
            "Saring mutasi berdasarkan aktivitas bisnis: Penjualan POS, Penerimaan Supplier, Hasil/Bahan Produksi, Transfer Cabang, Stok Keluar (Pemakaian), Penyesuaian, Retur, hingga Opname.",
        placement: "bottom",
    },
    {
        target: "#ledger-sample-row-0",
        title: "4. Riwayat Mutasi (Sampel Baris)",
        content:
            "Setiap baris mencatat 1 mutasi: waktu presisi, nama barang, tipe aktivitas, perubahan saldo stok (+/-), hingga petugas penanggung jawab.",
        placement: "bottom",
    },
    {
        target: "#ledger-col-change",
        title: "5. Lencana Tipe & Angka Perubahan",
        content:
            "Lencana warna membedakan tipe mutasi (Hijau = Masuk, Biru = Penjualan, Ungu = Produksi, Merah = Keluar). Angka hijau (+) menambah stok, dan angka merah (-) mengurangi stok.",
        placement: "bottom",
    },
    {
        target: "#ledger-col-balance",
        title: "6. Integritas Saldo: Sebelum vs Sesudah",
        content:
            "Rumus kepastian stok: 'Stok Sebelum + Perubahan = Stok Sesudah'. Menjamin saldo akhir selalu transparan, akurat, dan dapat dipertanggungjawabkan.",
        placement: "bottom",
    },
    {
        target: "#ledger-col-notes",
        title: "7. Catatan, Alasan & Fitur Tooltip",
        content:
            "Catatan transaksi yang panjang diringkas rapi (truncate) agar tabel tetap ergonomis. Cukup arahkan kursor mouse ke teks catatan untuk melihat isi lengkapnya via Tooltip!",
        placement: "bottom",
    },
    {
        target: "body",
        title: "8. Selesai: Kuasai Audit Mutasi Toko",
        content:
            "Gunakan Kartu Stok sebagai alat investigasi utama Anda untuk menelusuri riwayat pergerakan stok atau melacak selisih barang yang ditemukan saat Stock Opname.",
        placement: "center",
    },
];
