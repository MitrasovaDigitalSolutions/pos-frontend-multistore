import type { PurchaseTutorialStep } from "../types/purchase-tutorial";
import {
    MOCK_PO_ITEMS,
    MOCK_PO_NOTES,
    MOCK_RECEIVING_ITEMS,
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
            content: "Periksa kuantitas fisik yang benar-benar diterima pada tabel ini. Anda dapat menyesuaikan jumlah tiba serta mengubah harga beli jika ada perbedaan dari kesepakatan awal.",
            placement: "bottom",
        },
        {
            target: "#rec-invoice-number-field",
            title: "5. Faktur & Tagihan Supplier",
            content: "Masukkan nomor faktur fisik distributor dan nilai tagihan faktur. Informasi ini akan direkonsiliasi dengan total nilai fisik barang yang dihitung oleh sistem.",
            placement: "left",
            action: {
                type: "type_text",
                target: "#rec-invoice-number-input",
                text: "INV-2024-089",
            },
        },
        {
            target: "#rec-submit-bar",
            title: "6. Proses Penerimaan Barang",
            content: "Klik 'Proses Penerimaan' untuk memvalidasi stok. Sistem otomatis memeriksa apakah harga beli dari distributor mengalami perubahan sebelum menyelesaikan dokumen penerimaan.",
            placement: "top",
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
            placement: "left",
            action: {
                type: "open_dialog",
                dialog: "finalize",
            },
        },
        {
            target: "#finalize-payment-method-toggle",
            title: "9. Metode Transaksi (Tunai vs Kredit)",
            content: "Pilih 'Tunai' untuk pelunasan langsung dari Akun Kas/Bank toko, atau pilih 'Kredit' untuk mencatat hutang dagang baru ke supplier beserta uang muka (DP) jika ada.",
            placement: "right",
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
};

