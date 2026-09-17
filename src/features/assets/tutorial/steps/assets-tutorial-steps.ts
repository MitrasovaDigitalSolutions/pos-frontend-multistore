import type { AssetTutorialId, AssetTutorialStep } from "../types/assets-tutorial";

export const ASSET_TUTORIAL_STEPS: Record<AssetTutorialId, AssetTutorialStep[]> = {
    catat_aset: [
        {
            target: "#btn-catat-aset",
            title: "1. Tombol Catat Aset",
            content: "Klik tombol 'Catat Aset' untuk membuka dialog pendaftaran aset baru ke dalam sistem.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#nama",
            title: "2. Input Nama Aset",
            content: "Masukkan nama aset yang akan didaftarkan, misalnya nama barang beserta merek dan tipe.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Isi Nama Contoh",
                target: "#nama input",
                value: "Laptop ThinkPad T14",
            },
        },
        {
            target: "#form-aset-kategori",
            title: "3. Pilih Kategori Aset",
            content: "Pilih kategori aset untuk menentukan pengelompokan serta akun akuntansi terkait.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#form-aset-harga-tgl",
            title: "4. Tanggal & Harga Perolehan",
            content: "Isi tanggal perolehan serta nominal harga beli (harga perolehan) aset.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Isi Nilai Contoh",
                fields: [
                    { target: "#harga_perolehan input", value: "18000000" },
                    { target: "#nilai_residu input", value: "3000000" },
                ],
            },
        },
        {
            target: "#form-aset-residu",
            title: "5. Nilai Residu & Perkiraan Masa",
            content: "Tentukan nilai sisa (residu) aset setelah nilai buku habis disusutkan.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#aset-sumber-tabs",
            title: "6. Sumber Perolehan Aset",
            content: "Pilih sumber perolehan: Kas (pembelian tunai), Non-Kas (kredit/offset CoA), atau Existing (saldo awal).",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#btn-submit-aset",
            title: "7. Simpan Aset Baru",
            content: "Klik tombol ini untuk menyimpan data aset baru ke dalam sistem dan mencatat jurnal terkait.",
            placement: "top",
            skipScroll: true,
        },
    ],

    edit_aset: [
        {
            target: ".table-action-edit",
            title: "1. Tombol Edit Aset",
            content: "Klik tombol Edit pada baris aset di tabel untuk mengubah informasi aset.",
            placement: "left",
            skipScroll: true,
        },
        {
            target: "#edit_nama",
            title: "2. Perbarui Data Aset",
            content: "Ubah nama, kode, nilai residu, atau catatan aset sesuai kebutuhan.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Ubah Nama Contoh",
                target: "#edit_nama input",
                value: "Laptop ThinkPad T14 (Updated)",
            },
        },
        {
            target: "#btn-submit-aset-edit",
            title: "3. Simpan Perubahan",
            content: "Klik tombol 'Simpan Perubahan' untuk menerapkan data terbaru.",
            placement: "top",
            skipScroll: true,
        },
    ],

    susut_single: [
        {
            target: ".table-action-susut",
            title: "1. Tombol Penyusutan Aset",
            content: "Klik tombol Penyusutan pada baris aset untuk membuka formulir penyusutan tunggal.",
            placement: "left",
            skipScroll: true,
        },
        {
            target: "#btn-susut-form",
            title: "2. Form Penyusutan",
            content: "Periksa saldo nilai buku aset dan tanggal transaksi sebelum menentukan nominal.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#susut-nominal",
            title: "3. Nominal & Keterangan",
            content: "Masukkan jumlah penyusutan periode ini beserta catatan keterangan transaksi.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Isi Nominal Contoh",
                fields: [
                    { target: "#susut-nominal input", value: "500000" },
                    { target: "#susut-keterangan input", value: "Penyusutan bulanan" },
                ],
            },
        },
        {
            target: "#btn-submit-susut",
            title: "4. Simpan Penyusutan",
            content: "Klik tombol 'Simpan' untuk mencatat transaksi penyusutan dan memperbarui Nilai Buku.",
            placement: "top",
            skipScroll: true,
        },
    ],

    susut_bulk: [
        {
            target: "#btn-susut-bulk",
            title: "1. Tombol Penyusutan Massal",
            content: "Klik tombol 'Penyusutan Massal' untuk memproses penyusutan beberapa aset sekaligus.",
            placement: "bottom",
            skipScroll: true,
            variant: "overlay_nav",
            overlayNav: true,
        },
        {
            target: "#bulk-select-all",
            title: "2. Pilih Semua Aset",
            content: "Pilih seluruh aset aktif yang akan disusutkan pada periode berjalan.",
            placement: "bottom",
            skipScroll: true,
            variant: "overlay_nav",
            overlayNav: true,
        },
        {
            target: "#bulk-auto-pct",
            title: "3. Hitung Otomatis Persentase",
            content: "Gunakan kalkulasi otomatis persentase/nominal penyusutan untuk mempercepat pengisian.",
            placement: "bottom",
            skipScroll: true,
            variant: "overlay_nav",
            overlayNav: true,
        },
        {
            target: "#btn-submit-bulk",
            title: "4. Eksekusi Penyusutan Massal",
            content: "Klik 'Proses Penyusutan' untuk menyimpan seluruh transaksi penyusutan secara kolektif.",
            placement: "top",
            skipScroll: true,
            variant: "overlay_nav",
            overlayNav: true,
        },
    ],

    detail_hapus: [
        {
            target: ".table-action-view",
            title: "1. Tombol Detail Aset",
            content: "Klik tombol View pada baris aset untuk membuka panel detail dan riwayat transaksi penyusutan.",
            placement: "left",
            skipScroll: true,
        },
        {
            target: "#aset-riwayat-table",
            title: "2. Tabel Riwayat Penyusutan",
            content: "Tinjau daftar historis penyusutan beserta tanggal dan nominal yang telah dicatat.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#btn-close-detail",
            title: "3. Tutup Panel Detail",
            content: "Klik tombol Tutup untuk kembali ke tabel utama manajemen aset.",
            placement: "top",
            skipScroll: true,
        },
        {
            target: ".table-action-delete",
            title: "4. Tombol Hapus Aset",
            content: "Ikon tempat sampah ini dipakai untuk menghapus aset. Klik Lanjut — dialog konfirmasi akan terbuka otomatis dengan data demo yang aman.",
            placement: "left",
            skipScroll: true,
            spotlightClicks: false,
        },
        {
            target: "#confirm-delete-dialog-content",
            title: "5. Konfirmasi Penghapusan",
            content: "Sistem memastikan data aset aman untuk dihapus. Ini data demo — klik Selesai untuk mengakhiri tanpa menghapus apa pun.",
            placement: "top",
            skipScroll: true,
            variant: "overlay_nav",
            overlayNav: true,
        },
    ],

    kategori_aset: [
        {
            target: "#btn-tambah-kategori",
            title: "1. Tombol Tambah Kategori",
            content: "Klik tombol 'Tambah Kategori' untuk membuka form pendaftaran kategori aset baru.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#nama",
            title: "2. Input Nama Kategori",
            content: "Masukkan nama pengelompokan aset, misalnya Kendaraan Operasional, Mesin, atau Bangunan.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Isi Nama Contoh",
                target: "#nama input",
                value: "Kendaraan Operasional",
            },
        },
        {
            target: "#kode",
            title: "3. Input Kode Kategori",
            content: "Isi kode prefiks singkat kategori yang digunakan dalam penomoran otomatis aset.",
            placement: "bottom",
            skipScroll: true,
            autoFill: {
                label: "✨ Isi Kode Contoh",
                target: "#kode input",
                value: "KND",
            },
        },
        {
            target: "#form-kategori-coa",
            title: "4. Pemetaan Akun CoA",
            content: "Tentukan akun CoA Asset, Akumulasi Penyusutan, dan Beban Penyusutan untuk otomatisasi jurnal.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#btn-submit-kategori",
            title: "5. Simpan Kategori Aset",
            content: "Klik tombol 'Simpan' untuk mendaftarkan kategori aset baru ke sistem.",
            placement: "top",
            skipScroll: true,
        },
    ],

    jual_aset: [
        {
            target: ".table-action-jual",
            title: "1. Tombol Jual / Pelepasan Aset",
            content:
                "Klik tombol 'Jual / Pelepasan Aset' berikon nota hijau pada baris aset untuk memulai proses pelepasan aset tetap.",
            placement: "left",
            skipScroll: true,
        },
        {
            target: "#sell-asset-header",
            title: "2. Ringkasan Finansial & Nilai Buku",
            content:
                "Sistem menampilkan rincian Harga Perolehan awal, Total Akumulasi Penyusutan, dan Nilai Buku saat ini sebagai acuan perhitungan untung atau rugi pelepasan aset.",
            placement: "bottom",
            skipScroll: true,
        },
        {
            target: "#sell-nominal-jual",
            title: "3. Input Nominal Harga Jual",
            content:
                "Masukkan harga jual tunai/bank yang disepakati dengan pembeli. Sistem mengetikkan contoh nominal Rp 16.500.000 secara otomatis.",
            placement: "bottom",
            skipScroll: true,
            action: {
                type: "type_text",
                target: "#sell-nominal-jual input",
                text: "16500000",
            },
        },
        {
            target: "#sell-cash-account",
            title: "4. Akun Kas / Bank Penerimaan Dana",
            content:
                "Tentukan rekening Kas atau Bank tempat penerimaan dana hasil penjualan disetorkan. Saldo akun kas terpilih otomatis didebet dalam jurnal GL.",
            placement: "bottom",
            skipScroll: true,
            action: {
                type: "set_field",
                field: "cash_account_uid",
                value: "__first__",
            },
        },
        {
            target: "#sell-offset-coa-section",
            title: "5. Deteksi Hasil Pelepasan & Akun Offset",
            content:
                "Sistem secara cerdas membandingkan Harga Jual (Rp 16.500.000) vs Nilai Buku (Rp 15.000.000). Karena harga jual lebih tinggi, terdeteksi Keuntungan (Gain) +Rp 1.500.000 dan sistem otomatis memilih Akun Pendapatan penyeimbang.",
            placement: "bottom",
            skipScroll: true,
            action: {
                type: "set_field",
                field: "offset_coa_uid",
                value: "__first__",
            },
        },
        {
            target: "#sell-catatan",
            title: "6. Catatan Keterangan Penjualan",
            content:
                "Dokumentasikan keterangan pembeli, nomor surat serah terima, atau alasan pelepasan aset untuk audit jejak transaksi.",
            placement: "bottom",
            skipScroll: true,
            action: {
                type: "type_text",
                target: "#sell-catatan input",
                text: "Pelepasan aset laptop inventaris lama ke vendor rekanan (Demo)",
            },
        },
        {
            target: "#sell-gl-simulation",
            title: "7. Simulasi Penjurnalan GL Real-Time",
            content:
                "Tinjau slip jurnal GL otomatis: [D] Kas bertambah, [D] Akumulasi Penyusutan ditutup ke 0, [K] Aset Tetap dinolkan, dan [K] Keuntungan Penjualan dicatat seimbang (balanced 0-0).",
            placement: "top",
            skipScroll: true,
        },
        {
            target: "#sell-status-warning",
            title: "8. Peringatan Penguncian Status Aset",
            content:
                "PENTING: Setelah konfirmasi disimpan, aset berubah status menjadi 'Dijual' secara permanen dan terkunci dari perubahan atau penghapusan demi menjaga integritas pembukuan akuntansi.",
            placement: "top",
            skipScroll: true,
        },
        {
            target: "#btn-submit-sell-asset",
            title: "9. Konfirmasi & Selesai Panduan",
            content:
                "Tombol ini kini aktif karena seluruh data telah terisi lengkap. Pada transaksi nyata, klik tombol ini untuk memproses pelepasan. Mode simulasi aman dan tidak akan memodifikasi data toko Anda. Klik Selesai untuk mengakhiri panduan.",
            placement: "top",
            skipScroll: true,
        },
    ],
};
