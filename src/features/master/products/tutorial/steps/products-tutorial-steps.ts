import type { ProductsTutorialId, ProductsTutorialStep } from "../types/products-tutorial";

export const PRODUCTS_TUTORIAL_STEPS: Record<ProductsTutorialId, ProductsTutorialStep[]> = {
    tambah_produk: [
        {
            target: "#btn-tambah-produk-master",
            title: "1. Tombol Tambah Produk",
            content: "Klik tombol 'Tambah Produk' untuk memulai alur pencocokan katalog pusat atau pembuatan produk baru.",
            placement: "bottom",
        },
        {
            target: "#catalog-match-search-input",
            title: "2. Pencarian Katalog Induk",
            content: "Ketik nama barang atau scan barcode untuk memeriksa apakah produk sudah terdaftar di Master Katalog pusat.",
            placement: "bottom",
            autoFill: {
                label: "✨ Cari 'Kopi Robusta'",
                target: "#catalog-match-search-input",
                value: "Kopi Robusta",
            },
        },
        {
            target: "#catalog-match-btn-new-product",
            title: "3. Buat Baru Secara Manual",
            content: "Jika produk tidak ditemukan di katalog pusat, klik tombol ini untuk membuka form input produk baru secara manual.",
            placement: "top",
        },
        {
            target: "#form-product-name-input input",
            title: "4. Input Nama Produk",
            content: "Masukkan nama barang yang jelas. Nama ini akan muncul di struk kasir dan laporan transaksi.",
            placement: "bottom",
            autoFill: {
                label: "✨ Isi Nama Produk",
                target: "#form-product-name-input input",
                value: "Kopi Robusta Lampung 250g",
            },
        },
        {
            target: "#btn-generate-barcode-addon",
            title: "5. Generator Barcode Otomatis",
            content: "Tekan tombol 'Buat Barcode' ini untuk membuat kode barcode SKU unik secara instan tanpa perlu memikirkan nomor manual.",
            placement: "left",
        },
        {
            target: "#form-product-category-brand",
            title: "6. Pemilihan Kategori & Brand",
            content: "Kelompokkan produk ke kategori dan brand yang tepat untuk kemudahan filter dan pembukuan laba rugi.",
            placement: "bottom",
        },
        {
            target: "#form-product-unit-select",
            title: "7. Satuan Unit Penjualan",
            content: "Tentukan satuan penjualan produk, misalnya Pcs, Pack, Botol, atau Kilogram.",
            placement: "bottom",
        },
        {
            target: "#form-product-type-select",
            title: "8. Klasifikasi Tipe Produk",
            content: "Pilih apakah barang ini 'Barang Jadi' siap jual, 'Bahan Baku' untuk resep manufaktur, atau 'Jasa' tanpa stok fisik.",
            placement: "bottom",
        },
        {
            target: "#form-product-pricing-col",
            title: "9. Kalkulator Margin, Harga & Grosir",
            content: "Isi harga beli modal dan margin keuntungan (%). Harga jual akan dihitung otomatis. Anda juga dapat mengaktifkan harga grosir bertingkat.",
            placement: "left",
            autoFill: {
                label: "✨ Isi Harga & Margin Contoh",
                fields: [
                    { target: "#form-product-harga-beli-box input", value: "18000" },
                    { target: "#form-product-margin-box input", value: "40" },
                ],
            },
        },
        {
            target: "#btn-submit-product-form",
            title: "10. Simpan ke Katalog Master",
            content: "Tekan tombol Simpan Produk. Produk baru langsung aktif dan siap didistribusikan ke seluruh gerai cabang.",
            placement: "top",
        },
    ],

    edit_produk: [
        {
            target: ".table-action-edit",
            title: "1. Tombol Edit Harga & Cabang",
            content: "Klik tombol Edit (ikon pensil kuning) pada baris produk di tabel untuk membuka form penyesuaian harga dan pengaturan toko.",
            placement: "left",
        },
        {
            target: "#store-edit-pricing-grid",
            title: "2. Penyesuaian Harga Beli, Jual & Margin",
            content: "Sesuaikan harga modal terbaru, harga jual, atau persentase margin keuntungan. Sistem menghitung margin secara otomatis.",
            placement: "left",
            autoFill: {
                label: "✨ Isi Update Harga Modal",
                fields: [
                    { target: 'input[name="harga_beli"]', value: "20000" },
                    { target: 'input[name="margin"]', value: "35" },
                ],
            },
        },
        {
            target: "#store-edit-grosir-switch",
            title: "3. Fitur Harga Grosir Khusus Toko",
            content: "Aktifkan sakelar Grosir untuk memberikan potongan harga bertingkat bagi pelanggan yang membeli dalam jumlah minimal tertentu.",
            placement: "left",
        },
        {
            target: "#btn-submit-store-edit",
            title: "4. Simpan Perubahan Harga",
            content: "Klik tombol 'Simpan Perubahan' untuk langsung menerapkan harga baru ke kasir cabang ini.",
            placement: "top",
        },
    ],

    hapus_produk: [
        {
            target: ".table-action-delete",
            title: "1. Tombol Hapus Produk",
            content: "Klik tombol Hapus (ikon tempat sampah merah) pada baris produk yang ingin diarsipkan dari toko aktif.",
            placement: "left",
        },
        {
            target: "#confirm-delete-dialog-content",
            title: "2. Dialog Konfirmasi Penghapusan",
            content: "Sistem meminta konfirmasi agar produk tidak terhapus secara tidak sengaja. Klik tombol konfirmasi untuk melanjutkan pengarsipan.",
            placement: "top",
        },
        {
            target: "#filter-status-select",
            title: "3. Filter Status 'Dihapus / Diarsipkan'",
            content: "Produk yang dihapus disimpan secara aman di sistem. Anda dapat melihat daftar produk yang diarsipkan melalui filter status ini.",
            placement: "bottom",
        },
        {
            target: "#unarchive-product-form",
            title: "4. Pemulihan Produk (Unarchive)",
            content: "Gunakan fitur Unarchive untuk mengaktifkan kembali produk yang sebelumnya diarsipkan agar kembali aktif di kasir cabang.",
            placement: "top",
        },
    ],

    filter_produk: [
        {
            target: "#product-table-filters",
            title: "1. Kolom Pencarian Cepat",
            content: "Ketik barcode, nama barang, atau nama merek untuk menemukan produk secara instan tanpa perlu scrolling tabel.",
            placement: "bottom",
            autoFill: {
                label: "✨ Cari 'Kopi'",
                target: "#product-table-filters input",
                value: "Kopi",
            },
        },
        {
            target: "#product-table-filters",
            title: "2. Filter Kategori & Merek",
            content: "Saring produk berdasarkan kategori dan brand tertentu untuk mempermudah pengecekan persediaan kelompok barang.",
            placement: "bottom",
        },
        {
            target: "#product-table-filters",
            title: "3. Filter Status Aktif & Arsip",
            content: "Tampilkan produk aktif, non-aktif, atau produk yang diarsipkan untuk audit inventori berkala.",
            placement: "bottom",
        },
        {
            target: "#product-table-filters",
            title: "4. Filter Tipe Produk",
            content: "Gunakan tombol filter tipe untuk memisahkan Barang Jadi, Bahan Baku resep, dan Jasa layanan.",
            placement: "bottom",
        },
    ],
};
