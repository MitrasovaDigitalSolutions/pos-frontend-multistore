import type { PurchaseTutorialStep } from "../types/purchase-tutorial";
import { MOCK_PO_ITEMS, MOCK_PO_NOTES } from "../constants/purchase-tutorial-constants";

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
};

