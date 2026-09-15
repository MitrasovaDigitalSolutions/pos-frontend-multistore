"use client";

import React from "react";
import type { StockTutorialStep, StockTutorialBranch } from "../types/stock-tutorial";
import { StockTutorialBranchSelector } from "../components/stock-tutorial-branch-selector";

// Common Steps (Langkah 1 s/d 3)
const COMMON_STEPS: StockTutorialStep[] = [
    {
        target: "#stock-opname-header",
        title: "1. Pengenalan Modul Stock Opname",
        content:
            "Stock Opname adalah modul audit inventori untuk mencocokkan stok fisik barang di rak/gudang toko dengan catatan sistem komputer. Modul ini penting untuk mendeteksi barang hilang/rusak, mencegah kebocoran stok, dan memastikan nilai aset inventori di neraca keuangan akurat.",
        placement: "bottom",
    },
    {
        target: "#btn-opname-documents",
        title: "2. Unduh Dokumen & Lembar Hitung Lapangan",
        content:
            "Sebelum tim mulai menghitung barang di toko, klik menu ini untuk mengunduh 'Lembar Cetak Opname (PDF)' sebagai formulir fisik manual bagi petugas pencatat di rak, atau 'Template Excel (.xlsx)' untuk pengisian data massal via komputer.",
        placement: "left",
    },
    {
        target: "#btn-new-opname",
        title: "3. Tombol Membuka Sesi Opname Baru",
        content:
            "Klik tombol 'Opname Baru' untuk memulai sesi audit inventori toko. Anda dapat memilih metode penghitungan fisik melalui file Excel hasil input tim atau membuat draf kosong untuk pemindaian langsung menggunakan scanner barcode.",
        placement: "left",
    },
];

// Branching Step (Langkah 4: Pemilihan Jalur)
const BRANCHING_STEP: StockTutorialStep = {
    target: "#opname-dialog-tabs",
    title: "4. Pilihan Metode: Upload Excel vs Input Manual",
    content: <StockTutorialBranchSelector />,
    placement: "bottom",
};

// Jalur 1: Upload Excel Steps (Langkah 5 s/d 11)
const EXCEL_STEPS: StockTutorialStep[] = [
    {
        target: "#opname-excel-dropzone",
        title: "5. Unggah File Spreadsheet Excel (.xlsx)",
        content:
            "Pada tab 'Upload Excel', klik area dropzone ini atau tarik file spreadsheet Excel (.xlsx/.xls) yang sudah diisi kolom kuantitas fisiknya oleh tim lapangan. Sistem akan memverifikasi keabsahan data kolom dan kode barcode secara otomatis.",
        placement: "bottom",
        action: {
            type: "set_mock_excel_file",
        },
    },
    {
        target: "#opname-excel-notes-input",
        title: "6. Tambahkan Catatan Dokumen Excel",
        content:
            "Berikan catatan spesifik sesi opname, seperti nama petugas/shift ('Tim Audit Shift Pagi') atau area gudang ('Gudang Penyimpanan Depan') agar histori audit terdokumentasi jelas saat pelaporan.",
        placement: "bottom",
        action: {
            type: "type_text",
            target: "#opname-excel-notes-input",
            text: "Audit Massal Excel - Gudang Pusat",
        },
    },
    {
        target: "#opname-excel-submit-btn",
        title: "7. Klik 'Upload & Buat Draf'",
        content:
            "Klik tombol 'Upload & Buat Draf' untuk mengunggah file Excel. Sistem otomatis memparsing seluruh baris item, membandingkannya dengan stok sistem, dan membuka lembar kerja audit berstatus 'Draft'.",
        placement: "top",
    },
    {
        target: "#opname-stats-cards",
        title: "8. Ringkasan Statistik Hasil Impor Excel",
        content:
            "Periksa kartu statistik ringkasan hasil impor: 'Total Dihitung' menampilkan jumlah SKU terimpor, 'Sesuai Sistem' menunjukkan barang yang klop, serta 'Selisih Lebih (+)' dan 'Selisih Kurang (-)' menandai item yang memerlukan perhatian khusus.",
        placement: "bottom",
    },
    {
        target: "#opname-item-row-0-reason",
        title: "9. Verifikasi Baris Item & Alasan Selisih",
        content:
            "Periksa baris produk yang memiliki selisih. Jika dari file Excel belum terisi alasannya, Anda dapat langsung melengkapinya di kolom 'Alasan Selisih' (contoh: '2 botol bocor/pecah di rak belakang') sebelum audit disahkan.",
        placement: "top",
        action: {
            type: "type_text",
            target: "#opname-item-row-0-reason input",
            text: "2 botol bocor/pecah di rak belakang",
        },
    },
    {
        target: "#btn-opname-finalize",
        title: "10. Tombol Finalisasi Stock Opname",
        content:
            "Setelah seluruh data verifikasi hasil impor Excel dipastikan valid dan akurat, klik tombol 'Finalisasi'. Sistem akan memunculkan dialog konfirmasi sebelum stok master produk resmi disesuaikan secara permanen.",
        placement: "left",
    },
    {
        target: "body",
        title: "11. Selesai: Audit Jalur Upload Excel Berhasil!",
        content:
            "Selamat! Anda telah menguasai alur Stock Opname menggunakan metode Upload Excel. Stok sistem kini otomatis terkoreksi sesuai fisik barang, mutasi tercatat di Kartu Stok, dan neraca inventori toko kembali sinkron.",
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

// Jalur 2: Input Manual Steps (Langkah 5 s/d 14)
const MANUAL_STEPS: StockTutorialStep[] = [
    {
        target: "#opname-tab-manual-btn",
        title: "5. Memilih Tab 'Input Manual'",
        content:
            "Klik tab 'Input Manual' untuk membuat draf lembar kerja opname baru yang siap diisi produk satu per satu menggunakan pemindaian scanner barcode atau pencarian nama produk.",
        placement: "bottom",
        action: {
            type: "set_dialog_tab",
            tab: "manual",
        },
    },
    {
        target: "#opname-manual-notes-field",
        title: "6. Catatan Dokumen & Area Rak",
        content:
            "Berikan catatan spesifik sesi opname, seperti nama petugas/shift ('Tim Pagi - Rak A'), area rak ('Rak Makanan Ringan & Minuman'), atau periode audit ('Audit Bulanan Juni 2026') agar riwayat audit mudah ditelusuri.",
        placement: "bottom",
        action: {
            type: "type_text",
            target: "#opname-manual-notes-input",
            text: "Audit Rutin Bulanan - Toko Pusat",
        },
    },
    {
        target: "#opname-manual-submit-btn",
        title: "7. Terbitkan Draf & Buka Lembar Hitung",
        content:
            "Klik tombol 'Buat Draf Manual' untuk menerbitkan nomor dokumen resmi (contoh: SO-2024-DEMO) berstatus 'Draft' dan langsung membuka lembar kerja penghitungan fisik barang.",
        placement: "top",
    },
    {
        target: "#opname-stats-cards",
        title: "8. Kartu Statistik Selisih Real-Time",
        content:
            "Pantau ringkasan hasil audit langsung: 'Total Dihitung' (seluruh jenis SKU yang dicek), 'Sesuai Sistem' (stok klop), 'Selisih Lebih (+)' (stok fisik lebih banyak), dan 'Selisih Kurang (-)' (indikasi barang hilang/rusak). Angka ini terkalkulasi otomatis saat data dimasukkan.",
        placement: "bottom",
    },
    {
        target: "#barcode-scanner-section",
        title: "9. Scan Barcode Cepat di Rak Toko",
        content:
            "Gunakan barcode scanner fisik atau ketik kode barcode produk. Setiap kali barcode dipindai, sistem otomatis mencocokkan produk dan menambahkan kuantitas fisik (+1 pcs) secara instan tanpa perlu reload halaman.",
        placement: "bottom",
        action: {
            type: "sequence",
            actions: [
                { type: "type_text", target: "#barcode-scanner-section input", text: "8991234567890" },
                { type: "wait", ms: 400 },
                { type: "inject_mock_item" },
            ],
        },
    },
    {
        target: "#opname-item-row-0-qty",
        title: "10. Mengatur Kuantitas Fisik Riil",
        content:
            "Untuk produk dalam jumlah karton, lusinan, atau kemasan besar, Anda dapat mengetik angka kuantitas fisik secara langsung di kotak input ini atau menekan tombol kontrol '+' dan '-' tanpa perlu scan berulang kali.",
        placement: "top",
    },
    {
        target: "#opname-item-row-0-reason",
        title: "11. Pencatatan Alasan Selisih Barang",
        content:
            "Jika ditemukan selisih fisik vs sistem (misal selisih kurang -2 pcs), wajib cantumkan alasan selisih (contoh: '2 botol bocor/pecah di rak belakang') sebagai bukti pertanggungjawaban audit bagi pemilik toko dan akuntan.",
        placement: "top",
        action: {
            type: "type_text",
            target: "#opname-item-row-0-reason input",
            text: "2 botol bocor/pecah di rak belakang",
        },
    },
    {
        target: "#opname-items-filter-bar",
        title: "12. Filter Kategori & Pencarian Barang",
        content:
            "Untuk toko retail dengan ratusan hingga ribuan produk, manfaatkan filter Kategori, Brand, atau pencarian nama produk untuk memprioritaskan pengecekan rak tertentu secara bertahap.",
        placement: "bottom",
    },
    {
        target: "#btn-opname-finalize",
        title: "13. Finalisasi & Koreksi Stok Otomatis",
        content:
            "Setelah seluruh rak selesai dihitung dan diverifikasi, klik 'Finalisasi'. Sistem akan memunculkan dialog konfirmasi sebelum stok master produk resmi diperbarui secara permanen.",
        placement: "left",
    },
    {
        target: "body",
        title: "14. Selesai: Alur Input Manual Berhasil Dipahami!",
        content:
            "Hebat! Saat difinalisasi, seluruh stok master produk otomatis disinkronkan, histori tercatat di Kartu Stok (Stock Ledger), dan laporan audit tersimpan rapi untuk pembukuan akuntansi.",
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

/**
 * Returns dynamic steps according to current branch selection
 */
export function getStockTutorialSteps(branch: StockTutorialBranch | null): StockTutorialStep[] {
    if (branch === "excel") {
        return [...COMMON_STEPS, BRANCHING_STEP, ...EXCEL_STEPS];
    }
    if (branch === "manual") {
        return [...COMMON_STEPS, BRANCHING_STEP, ...MANUAL_STEPS];
    }
    // Before a branch is chosen, show common steps and the branching card (with a fallback default)
    return [...COMMON_STEPS, BRANCHING_STEP, ...EXCEL_STEPS];
}

// Backward compatibility map
export const STOCK_TUTORIAL_STEPS: Record<string, StockTutorialStep[]> = {
    stock_opname: [...COMMON_STEPS, BRANCHING_STEP, ...EXCEL_STEPS],
};
