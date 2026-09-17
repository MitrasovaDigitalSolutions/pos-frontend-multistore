import type { StockTutorialStep } from "../types/stock-tutorial";

export const STOCK_ADJUSTMENT_STEPS: StockTutorialStep[] = [
    {
        target: "#stock-opname-header",
        title: "1. Pengenalan Fitur Penyesuaian Stok",
        content:
            "Penyesuaian Stok (Stock Adjustment) digunakan untuk mengoreksi stok 1 produk secara langsung saat terjadi kejadian insidental (seperti barang rusak, pecah, kadaluarsa, atau hilang), tanpa perlu membuat sesi audit Stock Opname massal.",
        placement: "bottom",
    },
    {
        target: "#btn-stock-adjustment",
        title: "2. Tombol Membuka Penyesuaian Stok",
        content:
            "Klik tombol 'Penyesuaian Stok' untuk membuka jendela pemilihan produk yang ingin dikoreksi kuantitas stoknya.",
        placement: "left",
    },
    {
        target: "#adjustment-search-filter",
        title: "3. Cari Produk yang Ingin Disesuaikan",
        content:
            "Ketik nama barang, kode barcode/SKU, atau merek produk yang ingin disesuaikan. Kotak pencarian ini mempermudah pencarian cepat dari ribuan daftar produk di toko Anda.",
        placement: "bottom",
        action: {
            type: "type_text",
            target: "#adjustment-search-filter input",
            text: "Kopi Arabika",
        },
    },
    {
        target: "#btn-adjust-product-row-0",
        title: "4. Pilih Produk & Buka Form Penyesuaian",
        content:
            "Klik tombol 'Sesuaikan' pada baris produk yang ingin diubah stoknya untuk membuka formulir pengisian kuantitas perubahan.",
        placement: "left",
    },
    {
        target: "#adjustment-selected-product-card",
        title: "5. Ringkasan Informasi Produk Terpilih",
        content:
            "Periksa kartu produk terpilih: pastikan nama barang, kode SKU/barcode, dan angka 'Stok Saat Ini' di sistem sesuai dengan fisik sebelum melakukan penyesuaian.",
        placement: "bottom",
    },
    {
        target: "#adjustment-quantity-field",
        title: "6. Input Kuantitas Perubahan (+ / -)",
        content:
            "PENTING: Masukkan selisih perubahan stok, BUKAN total stok akhir! Gunakan angka minus (-) untuk mengurangi stok (contoh: -2 jika botol rusak/pecah), atau angka plus (+) jika ada stok bertambah/bonus.",
        placement: "top",
        action: {
            type: "type_text",
            target: "#adjustment-quantity-input",
            text: "-2",
        },
    },
    {
        target: "#adjustment-reason-field",
        title: "7. Wajib Mengisi Alasan Penyesuaian",
        content:
            "Tuliskan keterangan jelas kenapa stok disesuaikan (contoh: '2 botol pecah saat display di rak kasir') sebagai bukti pertanggungjawaban audit dan transparansi pembukuan toko.",
        placement: "top",
        action: {
            type: "type_text",
            target: "#adjustment-reason-input",
            text: "2 botol pecah saat display di rak kasir",
        },
    },
    {
        target: "#btn-submit-adjustment",
        title: "8. Simpan & Sinkronisasi Stok Instan",
        content:
            "Klik tombol 'Simpan Penyesuaian' untuk mengonfirmasi perubahan. Stok master produk akan langsung diperbarui saat itu juga tanpa menunggu proses finalisasi lanjutan.",
        placement: "top",
    },
    {
        target: "body",
        title: "9. Selesai: Mutasi Tercatat di Kartu Stok!",
        content:
            "Hebat! Setiap penyesuaian stok otomatis tercatat sebagai mutasi bertipe 'Penyesuaian' (Adjustment) pada menu Kartu Stok (Stock Ledger) lengkap dengan waktu, kuantitas perubahan, dan nama petugas.",
        placement: "center",
        action: {
            type: "sequence",
            actions: [
                { type: "close_dialog" },
                { type: "navigate", url: "/admin/inventory/stock-opname" },
            ],
        },
    },
];
