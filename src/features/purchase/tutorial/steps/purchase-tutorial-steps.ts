import type { PurchaseTutorialStep } from "../types/purchase-tutorial";
import {
    MOCK_PO_ITEMS,
    MOCK_PO_NOTES,
    MOCK_RECEIVING_ITEMS,
    MOCK_RETURN_ITEMS,
} from "../constants/purchase-tutorial-constants";

export const PURCHASE_TUTORIAL_STEPS: Record<string, PurchaseTutorialStep[]> = {
    po_create: [
        {
            target: "#po-barcode-box",
            title: "1. Scan Barcode / Cari Produk",
            content: "Arahkan barcode scanner atau ketik nama produk. Sistem simulasi demo akan otomatis menginput kode barcode dan menambahkan produk contoh ke daftar PO.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    { type: "type_text", target: "#po-barcode-input", text: "8991234567890" },
                    { type: "wait", ms: 400 },
                    { type: "inject_po_items", items: MOCK_PO_ITEMS },
                    { type: "clear_input", target: "#po-barcode-input" },
                ],
            },
        },
        {
            target: "#po-items-table",
            title: "2. Daftar Barang & Kuantitas Pesanan",
            content: "Barang yang dipesan tampil di tabel ini. Anda dapat mengatur jumlah kuantitas pesanan dan harga estimasi beli sesuai kesepakatan grosir dengan supplier.",
            placement: "top",
        },
        {
            target: "#po-supplier-field",
            title: "3. Pilih Supplier Distributor",
            content: "Tentukan distributor rekanan tempat barang dipesan. Jika supplier baru belum terdaftar, Anda dapat langsung menambahkannya lewat tombol tambah mitra.",
            placement: "left",
        },
        {
            target: "#po-date-field",
            title: "4. Tanggal Pemesanan (PO)",
            content: "Tanggal PO terisi otomatis hari ini dan dapat disesuaikan dengan jadwal rencana pengadaan berkala toko Anda.",
            placement: "left",
        },
        {
            target: "#po-notes-field",
            title: "5. Catatan Tambahan Pemesanan",
            content: "Tambahkan catatan instruksi khusus seperti jadwal pengiriman atau ketentuan tempo pembayaran faktur kepada distributor supplier.",
            placement: "left",
            action: {
                type: "set_po_notes",
                notes: MOCK_PO_NOTES,
            },
        },
        {
            target: "#po-submit-bar",
            title: "6. Simpan Draft atau Proses PO",
            content: "Pilih 'Simpan PO' untuk menyimpan pesanan sebagai Draft (dapat diedit lagi nanti), atau klik 'Proses PO' untuk menerbitkan pesanan resmi ke distributor.",
            placement: "top",
        },
        {
            target: "body",
            title: "7. Selesai: Pemesanan Pembelian Siap",
            content: "Pemesanan pembelian berhasil dipahami! Dokumen PO yang telah diproses akan otomatis muncul di menu Penerimaan saat barang tiba di gudang toko.",
            placement: "center",
            action: {
                type: "clear_po_items",
            },
        },
    ],

    receiving_create: [
        {
            target: "#rec-barcode-box",
            title: "1. Konsep 1: Penerimaan Langsung",
            content: "Pada penerimaan langsung tanpa PO, Anda dapat langsung memindai barcode barang fisik yang tiba atau mencari produk. Sistem simulasi otomatis menginput barcode dan memasukkan barang ke daftar.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    { type: "type_text", target: "#rec-barcode-input", text: "8991234567890" },
                    { type: "wait", ms: 400 },
                    { type: "inject_receiving_items", items: MOCK_RECEIVING_ITEMS },
                    { type: "clear_input", target: "#rec-barcode-input" },
                ],
            },
        },
        {
            target: "#rec-po-select-field",
            title: "2. Konsep 2: Penerimaan dari PO",
            content: "Jika barang dipesan melalui Purchase Order, pilih nomor PO di sini. Sistem akan otomatis mengisi data supplier, barang-barang yang dipesan, dan membatasi kuantitas maksimal sesuai sisa PO.",
            placement: "left",
        },
        {
            target: "#rec-supplier-field",
            title: "3. Supplier & Tanggal Terima",
            content: "Data supplier otomatis terkunci jika memilih PO, atau dapat Anda tentukan bebas jika penerimaan langsung. Tanggal penerimaan mencatat waktu resmi barang masuk ke stok gudang.",
            placement: "left",
        },
        {
            target: "#rec-table-header",
            title: "4. Verifikasi Fisik Barang Masuk",
            content: "Periksa fisik barang dan sesuaikan jumlah kuantitas yang benar-benar tiba di gudang. Masukkan juga harga beli faktur per item jika ada perubahan harga dari distributor.",
            placement: "top",
        },
        {
            target: "#rec-invoice-field",
            title: "5. Nomor & Nominal Faktur Supplier",
            content: "Masukkan nomor faktur tagihan fisik dari supplier dan total nominal yang tertera pada lembar faktur resmi. Nomor faktur ini menjadi acuan utama saat pelunasan hutang dan rekonsiliasi penerimaan.",
            placement: "left",
            action: {
                type: "type_text",
                target: "#rec-invoice-number-input",
                text: "INV-2024-089",
            },
        },
        {
            target: "#rec-notes-field",
            title: "6. Catatan Penerimaan",
            content: "Tuliskan catatan kondisi pengiriman atau informasi penting lainnya terkait penerimaan barang ini.",
            placement: "left",
        },
        {
            target: "#price-alert-banner",
            title: "7. Dialog Perubahan Harga Beli",
            content: "Jika harga beli dari distributor naik atau turun, dialog ini otomatis muncul! Anda dapat memilih apakah harga jual produk dinaikkan untuk melindungi margin keuntungan toko atau tetap.",
            placement: "bottom",
            action: {
                type: "open_dialog",
                dialog: "price_alert",
            },
        },
        {
            target: "#finalize-reconciliation-panel",
            title: "8. Dialog Finalisasi Penerimaan",
            content: "Dialog ini merekonsiliasi nilai fisik barang vs nominal faktur supplier. Jika ada selisih (ongkir/diskon/pembulatan), sistem memberikan indikator status dan tombol otomatisasi penyelarasan.",
            placement: "top",
            action: {
                type: "open_dialog",
                dialog: "finalize",
            },
        },
        {
            target: "#finalize-payment-method-toggle",
            title: "9. Metode Transaksi (Tunai vs Kredit)",
            content: "Pilih 'Tunai' untuk pelunasan langsung dari Akun Kas/Bank toko, atau pilih 'Kredit' untuk mencatat hutang dagang baru ke supplier beserta uang muka (DP) jika ada.",
            placement: "top",
        },
        {
            target: "body",
            title: "10. Selesai: Penerimaan Siap!",
            content: "Alur penerimaan barang berhasil dipahami! Saat disimpan, stok gudang otomatis bertambah, histori HPP diperbarui, dan pembukuan kas maupun hutang supplier tercatat secara real-time.",
            placement: "center",
            action: {
                type: "sequence",
                actions: [
                    { type: "close_dialog" },
                    { type: "clear_receiving_items" },
                ],
            },
        },
    ],

    payment_create: [
        {
            target: "#pay-receiving-field",
            title: "1. Pilih Faktur Penerimaan (Hutang)",
            content: "Pilih nomor faktur penerimaan barang yang memiliki sisa hutang ke supplier. Data supplier dan nominal sisa tagihan akan otomatis ditampilkan oleh sistem.",
            placement: "bottom",
            action: {
                type: "set_payment_field",
                field: "receiving_uid",
                value: "mock-rec-tut-1",
            },
        },
        {
            target: "#pay-summary-card",
            title: "2. Ringkasan Hutang & Histori Pembayaran",
            content: "Perhatikan total faktur, total nominal yang telah dibayarkan sebelumnya, dan sisa hutang yang belum lunas beserta riwayat termin pembayaran terdahulu.",
            placement: "left",
        },
        {
            target: "#pay-amount-field",
            title: "3. Input Nominal Pembayaran",
            content: "Tentukan nominal yang dibayarkan kali ini. Anda dapat mencicil sebagian (termin) atau langsung melunasi sisa tagihan secara fleksibel.",
            placement: "right",
            action: {
                type: "set_payment_field",
                field: "jumlah_bayar",
                value: 1500000,
            },
        },
        {
            target: "#pay-date-field",
            title: "4. Tanggal Pembayaran",
            content: "Pilih tanggal kas keluar/realisasi transfer saat pembayaran faktur disetorkan kepada pihak supplier.",
            placement: "right",
            action: {
                type: "set_payment_field",
                field: "tanggal_bayar",
                value: "2024-09-14",
            },
        },
        {
            target: "#pay-cash-account-field",
            title: "5. Pilih Akun Kas / Bank Sumber Dana",
            content: "Pilih sumber rekening kas toko (Kas Utama atau Rekening Bank) yang akan dipotong saldonya untuk transaksi pembayaran ini.",
            placement: "right",
            action: {
                type: "set_payment_field",
                field: "cash_account_uid",
                value: "mock-cash-acc-1",
            },
        },
        {
            target: "#pay-method-field",
            title: "6. Metode Pembayaran",
            content: "Pilih metode pembayaran yang digunakan: Cash/Tunai, Transfer Bank, atau Giro.",
            placement: "right",
            action: {
                type: "set_payment_field",
                field: "metode_pembayaran",
                value: "Transfer",
            },
        },
        {
            target: "#pay-ref-field",
            title: "7. Nomor Referensi / Bukti Transfer",
            content: "Masukkan kode referensi transaksi (nomor bukti transfer perbankan atau nomor warkat giro) untuk mempermudah audit rekonsiliasi mutasi.",
            placement: "top",
            action: {
                type: "type_text",
                target: "#pay-ref-input",
                text: "TRF-BCA-883921",
            },
        },
        {
            target: "#pay-notes-field",
            title: "8. Catatan Transaksi Pembayaran",
            content: "Tambahkan catatan keterangan seperti 'Pembayaran termin ke-2' atau keterangan perihal pengiriman bukti pembayaran ke sales distributor.",
            placement: "top",
            action: {
                type: "type_text",
                target: "#pay-notes-input",
                text: "Pembayaran termin ke-2 pengadaan barang distributor",
            },
        },
        {
            target: "#pay-submit-button",
            title: "9. Simpan & Konfirmasi Pembayaran",
            content: "Klik tombol 'Simpan Pembayaran' untuk memunculkan dialog konfirmasi akhir. Di dialog konfirmasi, Anda dapat memverifikasi ulang saldo hutang sebelum pembukuan resmi disimpan.",
            placement: "top",
        },
        {
            target: "body",
            title: "10. Selesai: Pembayaran Berhasil Dipahami!",
            content: "Alur pelunasan hutang pembelian berhasil dipahami! Saat pembayaran disimpan, saldo kas/bank otomatis berkurang, sisa hutang terpotong, dan riwayat termin tercatat rapi.",
            placement: "center",
            action: {
                type: "clear_payment_data",
            },
        },
    ],

    return_create: [
        {
            target: "#ret-receiving-field",
            title: "1. Pilih Faktur Penerimaan (Invoice)",
            content: "Pilih nomor faktur penerimaan barang (status Completed) yang memuat barang-barang yang akan diretur. Sistem otomatis mengunci supplier dan memuat seluruh daftar produk terkait beserta batas maksimal kuantitasnya.",
            placement: "bottom",
            action: {
                type: "set_return_field",
                field: "receiving_uid",
                value: "mock-rec-tut-1",
            },
        },
        {
            target: "#ret-date-field",
            title: "2. Tanggal Pengajuan Retur",
            content: "Tentukan tanggal transaksi pengembalian fisik barang kepada pihak distributor / supplier.",
            placement: "left",
            action: {
                type: "set_return_field",
                field: "tanggal_retur",
                value: "2024-09-14",
            },
        },
        {
            target: "#ret-notes-field",
            title: "3. Catatan / Alasan Retur",
            content: "Tuliskan rincian klaim pengembalian seperti nomor Berita Acara (BA) serah terima barang retur atau deskripsi kondisi cacat produk saat ditemukan.",
            placement: "left",
            action: {
                type: "type_text",
                target: "#ret-notes-input",
                text: "Klaim retur botol kopi bocor & roti berjamur",
            },
        },
        {
            target: "#ret-barcode-box",
            title: "4. Scan Barcode Produk yang Diretur",
            content: "Arahkan scanner ke produk fisik yang rusak untuk pencarian cepat. Sistem otomatis menyorot baris produk terkait di tabel dan menambah jumlah kuantitas retur.",
            placement: "bottom",
        },
        {
            target: "#ret-items-table",
            title: "5. Tabel Verifikasi Barang Retur",
            content: "Seluruh produk dari faktur penerimaan referensi terdaftar di sini. Kolom 'Sisa Penerimaan' menjadi batas pengaman agar jumlah unit yang diretur tidak melebihi stok yang pernah diterima.",
            placement: "top",
        },
        {
            target: "#ret-item-row-0",
            title: "6. Atur Kuantitas & Alasan Kerusakan",
            content: "Tentukan berapa unit barang yang diretur serta pilih alasan kerusakan (Rusak / Cacat, Kadaluarsa, Salah Kirim, atau Lainnya). Nilai subtotal retur otomatis terkalkulasi secara realtime.",
            placement: "bottom",
            action: {
                type: "inject_return_items",
                items: MOCK_RETURN_ITEMS,
            },
        },
        {
            target: "#ret-submit-bar",
            title: "7. Simpan Draft atau Proses Retur",
            content: "Pilih 'Simpan Retur' jika ingin menyimpannya sebagai Draft sementara, atau klik 'Proses Retur' untuk membuka dialog konfirmasi dan pemilihan solusi penyelesaian retur.",
            placement: "top",
        },
        {
            target: "#ret-finalize-resolution-field",
            title: "8. Solusi Penyelesaian: Potong Utang vs Refund",
            content: "Sistem cerdas mendeteksi status tagihan: jika faktur masih memiliki sisa utang, retur otomatis menjadi 'Potong Utang (Kredit Faktur)' sehingga utang toko berkurang. Jika faktur sudah lunas, solusi beralih ke 'Refund Tunai' yang menambah kas/bank toko.",
            placement: "top",
            variant: "overlay_nav",
            overlayNav: true,
            action: {
                type: "open_dialog",
                dialog: "return_finalize",
            },
        },
        {
            target: "body",
            title: "9. Selesai: Alur Retur Pembelian Sukses!",
            content: "Alur retur pembelian berhasil dipahami! Saat retur difinalisasi, stok fisik produk otomatis terpotong permanen, utang faktur berkurang (atau kas bertambah), serta seluruh jurnal akuntansi tercatat rapi secara otomatis.",
            placement: "center",
            action: {
                type: "sequence",
                actions: [
                    { type: "close_dialog" },
                    { type: "clear_return_items" },
                ],
            },
        },
    ],
};
