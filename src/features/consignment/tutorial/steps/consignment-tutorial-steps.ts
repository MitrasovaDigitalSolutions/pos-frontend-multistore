import type { ConsignmentTutorialStep } from "../types/consignment-tutorial";
import {
    MOCK_CONSIGNMENT_SUPPLIER,
    MOCK_CONSIGNMENT_PRODUCTS,
    MOCK_CONSIGNMENT_ITEMS,
    MOCK_CONSIGNMENT_NOTES,
    MOCK_PAYMENT_NOTE,
} from "../constants/consignment-tutorial-constants";

export const CONSIGNMENT_TUTORIAL_STEPS: Record<string, ConsignmentTutorialStep[]> = {
    consignment_create: [
        {
            target: "#cons-supplier-field",
            title: "1. Pilih Supplier / Pemasok Titipan",
            content: "Pilih distributor atau mitra usaha yang menitipkan barang dagangannya di toko Anda. Jika supplier belum terdaftar, Anda dapat langsung menambahkannya lewat tombol tambah mitra.",
            placement: "left",
            action: {
                type: "set_field",
                field: "supplier_uid",
                value: MOCK_CONSIGNMENT_SUPPLIER.uid,
            },
        },
        {
            target: "#cons-date-field",
            title: "2. Tanggal Penerimaan Fisik",
            content: "Tanggal resmi saat barang titipan fisik tiba dan mulai masuk ke toko untuk dipajang atau dijual.",
            placement: "left",
        },
        {
            target: "#cons-due-date-field",
            title: "3. Tanggal Jatuh Tempo & Pengambilan",
            content: "Batas akhir masa penitipan barang. Pada tanggal ini, sisa barang yang tidak laku dapat diretur ke pemasok, sedangkan barang yang telah laku dibayarkan hasil penjualannya.",
            placement: "left",
            action: {
                type: "set_field",
                field: "tanggal_jatuh_tempo",
                value: "2026-10-15",
            },
        },
        {
            target: "#cons-notes-field",
            title: "4. Catatan & Perjanjian Titip Jual",
            content: "Tuliskan catatan tambahan seperti kesepakatan bagi hasil, nomor surat jalan penitipan, atau ketentuan khusus dari supplier rekanan.",
            placement: "left",
            action: {
                type: "type_text",
                target: "#cons-notes-input",
                text: MOCK_CONSIGNMENT_NOTES,
            },
        },
        {
            target: "#cons-barcode-box",
            title: "5. Scan Barcode / Cari Produk Titipan",
            content: "Arahkan barcode scanner atau ketik nama/kode produk yang dititipkan. Sistem simulasi demo otomatis menginput barcode dan memasukkan barang titipan ke tabel.",
            placement: "bottom",
            action: {
                type: "sequence",
                actions: [
                    { type: "type_text", target: "#cons-barcode-input", text: "8991234567890" },
                    { type: "wait", ms: 350 },
                    { type: "inject_items", items: MOCK_CONSIGNMENT_ITEMS, products: MOCK_CONSIGNMENT_PRODUCTS },
                    { type: "clear_input", target: "#cons-barcode-input" },
                ],
            },
        },
        {
            target: "#cons-items-table",
            title: "6. Tabel Verifikasi & Kuantitas Barang",
            content: "Periksa daftar barang yang dititipkan. Anda dapat menyesuaikan jumlah kuantitas fisik (Qty) yang diterima serta memverifikasi harga beli kesepakatan grosir dengan supplier.",
            placement: "top",
        },
        {
            target: "#cons-instruction-panel",
            title: "7. Konsep Akuntansi: Off-Book Inventory",
            content: "Penting! Penerimaan konsinyasi bersifat off-book: stok fisik toko bertambah, namun hutang dagang ke pemasok belum dicatat pada pembukuan toko. Hutang baru timbul otomatis ketika barang laku terjual di Kasir!",
            placement: "left",
        },
        {
            target: "#cons-submit-bar",
            title: "8. Pilihan: Simpan Draft vs Selesaikan",
            content: "Pilih 'Simpan Draft' untuk menyimpan data sementara jika masih ada barang susulan, atau klik 'Selesaikan Konsinyasi' untuk langsung memasukkan stok barang ke sistem penjualan toko.",
            placement: "top",
        },
        {
            target: "body",
            title: "9. Selesai: Alur Konsinyasi Sukses!",
            content: "Selamat! Anda telah memahami alur penerimaan barang konsinyasi secara menyeluruh. Seluruh barang titipan siap dijual di Kasir dan pencatatan komisi bagi hasil berjalan otomatis.",
            placement: "center",
            action: {
                type: "clear_items",
            },
        },
    ],

    consignment_payment: [
        {
            target: "#cons-payment-filter",
            title: "1. Filter & Pencarian Dokumen Konsinyasi",
            content: "Gunakan kolom pencarian untuk menyaring nomor konsinyasi atau nama supplier rekanan tertentu secara cepat.",
            placement: "bottom",
            action: {
                type: "inject_payment_mock",
            },
        },
        {
            target: "#cons-payment-table",
            title: "2. Sisa Hutang Konsinyasi (Hasil Jual)",
            content: "Perhatikan kolom 'Sisa Hutang Konsinyasi'. Nilai ini adalah akumulasi harga modal dari barang konsinyasi yang TELAH TERJUAL di Kasir. Toko hanya berhutang pada pemasok atas barang yang laku!",
            placement: "top",
        },
        {
            target: "#cons-btn-pay-0",
            title: "3. Tombol Bayar & Tutup Sesi",
            content: "Klik tombol kasir ini untuk membuka form pembayaran pelunasan dan memproses penutupan sesi konsinyasi.",
            placement: "left",
        },
        {
            target: "#cons-dialog-summary-cards",
            title: "4. Ringkasan Tagihan & Retur Otomatis",
            content: "Kotak ringkasan menampilkan total hutang atas barang yang terjual. Di sebelahnya, banner 'Auto-Retur Sisa Titipan' memastikan seluruh sisa barang fisik yang tidak laku otomatis dikembalikan dan status sesi berubah menjadi tertutup ('closed').",
            placement: "bottom",
            action: {
                type: "open_payment_modal",
            },
        },
        {
            target: "#cons-dialog-cash-account",
            title: "5. Pemilihan Akun Kas / Bank",
            content: "Pilih akun kas toko atau rekening bank yang digunakan untuk menyalurkan dana pembayaran kepada supplier titipan.",
            placement: "top",
            action: {
                type: "set_payment_field",
                field: "cash_account_uid",
                value: "mock-cash-main",
            },
        },
        {
            target: "#cons-dialog-amount-notes",
            title: "6. Nominal Bayar & Catatan",
            content: "Nominal pembayaran otomatis terisi penuh sesuai tagihan sisa hutang. Anda juga dapat menyematkan nomor kwitansi atau bukti transfer pada kolom catatan.",
            placement: "top",
            action: {
                type: "type_text",
                target: "#cons-dialog-notes-input",
                text: MOCK_PAYMENT_NOTE,
            },
        },
        {
            target: "#cons-dialog-submit-btn",
            title: "7. Finalisasi Pelunasan & Tutup Sesi",
            content: "Klik tombol 'Bayar & Tutup Sesi' untuk menyelesaikan transaksi. Jurnal pengeluaran kas otomatis tercatat dan sesi konsinyasi dinyatakan selesai (lunas & diretur).",
            placement: "top",
        },
        {
            target: "body",
            title: "8. Selesai: Manajemen Konsinyasi Berhasil!",
            content: "Selamat! Anda telah memahami seluruh alur konsinyasi: mulai dari penerimaan fisik (off-book), penjualan di kasir, hingga pelunasan dana dan auto-retur sisa produk. Pengelolaan konsinyasi di toko Anda kini jauh lebih rapi dan transparan!",
            placement: "center",
            action: {
                type: "sequence",
                actions: [
                    { type: "close_payment_modal" },
                    { type: "clear_payment_mock" },
                ],
            },
        },
    ],
};
