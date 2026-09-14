import type { RequestLineItem } from "@/features/request-transfer/schemas/request-transfer-schema";
import type { RequestTransferDetail, RequestTransferSummary } from "@/features/request-transfer/types";
import type { TransferTutorialMeta } from "../types/transfer-tutorial";

export const MOCK_REQUEST_STORE = {
    uid: "mock-store-pusat",
    nama: "Gudang Pusat Surabaya (Pusat)",
    is_central: true,
};

export const MOCK_REQUEST_ITEMS: RequestLineItem[] = [
    {
        product_uid: "mock-prod-req-1",
        nama: "Minyak Goreng Sawit 2L Pouch",
        barcode: "8991111222333",
        kuantitas: 12,
    },
    {
        product_uid: "mock-prod-req-2",
        nama: "Beras Rojolele Premium 5kg",
        barcode: "8994444555666",
        kuantitas: 10,
    },
];

export const MOCK_REQUEST_NOTE =
    "Stok menipis menjelang promo weekend. Mohon diprioritaskan pengiriman segera.";

export const MOCK_INCOMING_SUMMARY_UID = "mock-incoming-summary-tutorial";

export const MOCK_INCOMING_SUMMARY: RequestTransferSummary = {
    summary_uid: MOCK_INCOMING_SUMMARY_UID,
    request_to: "mock-store-pusat",
    request_to_nama: "Gudang Pusat Surabaya",
    supplier_uid: "mock-sup-wilmar",
    supplier_nama: "PT Wilmar Nabati Indonesia",
    supplier_sales_uid: "mock-sales-sembako",
    supplier_sales_nama: "Katalog Minyak & Sembako Grosir",
    request_count: 2,
    total_item_lines: 3,
    tanggal_request_terakhir: "2026-09-14T08:30:00.000Z",
};

export const MOCK_INCOMING_DETAIL: RequestTransferDetail = {
    request_to: "mock-store-pusat",
    request_to_nama: "Gudang Pusat Surabaya",
    supplier_uid: "mock-sup-wilmar",
    supplier_nama: "PT Wilmar Nabati Indonesia",
    supplier_sales_uid: "mock-sales-sembako",
    supplier_sales_nama: "Katalog Minyak & Sembako Grosir",
    requests: [
        {
            uid: "mock-req-doc-1",
            nomor_request: "REQ-MLG/2026/09/001",
            status: "pending",
            catatan: "Kebutuhan etalase cabang Malang menjelang akhir pekan.",
            tanggal_request: "2026-09-14T07:15:00.000Z",
            user: "Raihan (Supervisor Malang)",
            store_uid: "mock-store-malang",
            store_nama: "Cabang Malang Kota",
            items: [
                {
                    product_uid: "mock-prod-req-1",
                    nama: "Minyak Goreng Sawit 2L Pouch",
                    kuantitas: 20,
                    qty_dipesan: 0,
                    qty_dikirim: 0,
                },
                {
                    product_uid: "mock-prod-req-2",
                    nama: "Beras Rojolele Super 5kg Karung",
                    kuantitas: 10,
                    qty_dipesan: 0,
                    qty_dikirim: 0,
                },
            ],
        },
        {
            uid: "mock-req-doc-2",
            nomor_request: "REQ-SDA/2026/09/004",
            status: "pending",
            catatan: "Restok rutin awal bulan untuk etalase grosir Sidoarjo.",
            tanggal_request: "2026-09-14T08:30:00.000Z",
            user: "Budi (Admin Sidoarjo)",
            store_uid: "mock-store-sidoarjo",
            store_nama: "Cabang Sidoarjo",
            items: [
                {
                    product_uid: "mock-prod-req-1",
                    nama: "Minyak Goreng Sawit 2L Pouch",
                    kuantitas: 30,
                    qty_dipesan: 0,
                    qty_dikirim: 0,
                },
                {
                    product_uid: "mock-prod-req-2",
                    nama: "Beras Rojolele Super 5kg Karung",
                    kuantitas: 15,
                    qty_dipesan: 0,
                    qty_dikirim: 0,
                },
                {
                    product_uid: "mock-prod-req-3",
                    nama: "Gula Pasir Kristal 1kg",
                    kuantitas: 25,
                    qty_dipesan: 0,
                    qty_dikirim: 0,
                },
            ],
        },
    ],
    items: [
        {
            product_uid: "mock-prod-req-1",
            nama: "Minyak Goreng Sawit 2L Pouch",
            barcode: "8991234567890",
            harga_beli: 28000,
            harga_jual: 34000,
            kuantitas: 50,
            qty_dipesan: 0,
            qty_dikirim: 0,
            stok_source: 120,
            cukup: true,
        },
        {
            product_uid: "mock-prod-req-2",
            nama: "Beras Rojolele Super 5kg Karung",
            barcode: "8992345678901",
            harga_beli: 65000,
            harga_jual: 75000,
            kuantitas: 25,
            qty_dipesan: 0,
            qty_dikirim: 0,
            stok_source: 40,
            cukup: true,
        },
        {
            product_uid: "mock-prod-req-3",
            nama: "Gula Pasir Kristal 1kg",
            barcode: "8993456789012",
            harga_beli: 14000,
            harga_jual: 17500,
            kuantitas: 25,
            qty_dipesan: 0,
            qty_dikirim: 0,
            stok_source: 50,
            cukup: true,
        },
    ],
};

export const TRANSFER_TUTORIAL_METAS: TransferTutorialMeta[] = [
    {
        id: "request_transfer_create",
        title: "Permintaan Transfer Stok (Request Transfer)",
        description:
            "Panduan lengkap mengajukan permintaan stok barang dari toko cabang ke gudang pusat atau toko sumber lainnya.",
        category: "Request Transfer",
        stepCount: 8,
        badge: "Fitur Inti",
        isAvailable: true,
    },
    {
        id: "request_transfer_incoming",
        title: "Kelola Request Masuk",
        description:
            "Panduan memproses dan menyetujui permintaan stok barang yang diajukan oleh toko cabang lain.",
        category: "Request Transfer",
        stepCount: 10,
        badge: "Incoming",
        isAvailable: true,
    },
    {
        id: "stock_transfer_create",
        title: "Pengiriman Transfer Keluar",
        description:
            "Panduan mengirim barang transfer antar toko, verifikasi surat jalan, dan pengurangan stok fisik.",
        category: "Transfer Stok Fisik",
        stepCount: 7,
        badge: "Segera Hadir",
        isAvailable: false,
    },
    {
        id: "stock_transfer_receive",
        title: "Penerimaan Transfer Masuk",
        description:
            "Panduan menerima kiriman barang dari cabang lain dan pengecekan fisik barang yang sampai.",
        category: "Transfer Stok Fisik",
        stepCount: 6,
        badge: "Segera Hadir",
        isAvailable: false,
    },
    {
        id: "stock_transfer_validation",
        title: "Validasi Selisih Transfer",
        description:
            "Panduan verifikasi dan penyesuaian bila terjadi perbedaan jumlah barang saat pengiriman dan penerimaan.",
        category: "Validasi & Selisih",
        stepCount: 5,
        badge: "Segera Hadir",
        isAvailable: false,
    },
];
