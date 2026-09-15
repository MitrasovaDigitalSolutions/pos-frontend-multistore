import type { RequestLineItem } from "@/features/request-transfer/schemas/request-transfer-schema";
import type { RequestTransferDetail, RequestTransferSummary } from "@/features/request-transfer/types";
import type { TransferTutorialMeta } from "../types/transfer-tutorial";
import type { TransferItem } from "../../components/create/transfer-items-section";
import type { StockTransfer } from "../../types";

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

export const MOCK_STOCK_TRANSFER_DEST_STORE = {
    uid: "mock-store-malang",
    nama: "Cabang Malang Kota",
    is_central: false,
};

export const MOCK_STOCK_TRANSFER_ITEMS: TransferItem[] = [
    {
        product_uid: "mock-prod-trf-1",
        nama: "Minyak Goreng Sawit 2L Pouch",
        barcode: "8991111222333",
        stok_tersedia: 48,
        kuantitas: 12,
    },
    {
        product_uid: "mock-prod-trf-2",
        nama: "Beras Rojolele Super 5kg Karung",
        barcode: "8994444555666",
        stok_tersedia: 30,
        kuantitas: 6,
    },
];

export const MOCK_STOCK_TRANSFER_NOTE =
    "Pengiriman restok mingguan untuk promo akhir pekan Cabang Malang. Mohon periksa segel kemasan saat kurir tiba.";


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

export const MOCK_INCOMING_STOCK_TRANSFER_UID = "mock-incoming-transfer-1";

export const MOCK_INCOMING_STOCK_TRANSFER: StockTransfer = {
    uid: MOCK_INCOMING_STOCK_TRANSFER_UID,
    store_uid_source: "mock-store-pusat",
    store_uid_destination: "mock-store-cabang",
    nomor_transfer: "TRF-2026-0901",
    status: "sent",
    status_penerimaan: "pending",
    status_pengiriman: "pending",
    user_uid_source: "mock-user-1",
    user_uid_destination: null,
    catatan: "Pengiriman stok mingguan armada logistik internal. Mohon periksa segel kemasan & fisik saat tiba.",
    tanggal_kirim: "2026-09-15T08:00:00.000Z",
    tanggal_terima: null,
    created_at: "2026-09-15T07:30:00.000Z",
    updated_at: "2026-09-15T08:00:00.000Z",
    source_store: {
        uid: "mock-store-pusat",
        nama: "Gudang Pusat Surabaya",
        is_central: true,
    },
    destination_store: {
        uid: "mock-store-cabang",
        nama: "Cabang Anda (Penerima)",
        is_central: false,
    },
    source_user: {
        uid: "mock-user-1",
        name: "Admin Logistik Pusat",
    },
    destination_user: null,
    items: [
        {
            uid: "mock-item-1",
            stock_transfer_uid: MOCK_INCOMING_STOCK_TRANSFER_UID,
            product_uid: "mock-prod-trf-1",
            kuantitas: 24,
            kuantitas_diterima: null,
            kuantitas_return: null,
            validated_at: null,
            jenis_validasi: null,
            kuantitas_koreksi: null,
            keterangan: null,
            status: null,
            jenis_selisih: null,
            stok_sebelum_source: 100,
            stok_sesudah_source: 76,
            stok_sebelum_dest: 10,
            stok_sesudah_dest: 34,
            harga_beli_avg: 18000,
            product: {
                uid: "mock-prod-trf-1",
                nama: "Minyak Goreng Sawit 2L Pouch",
                barcode: "8991111222333",
                satuan: "Pcs",
            },
        },
        {
            uid: "mock-item-2",
            stock_transfer_uid: MOCK_INCOMING_STOCK_TRANSFER_UID,
            product_uid: "mock-prod-trf-2",
            kuantitas: 12,
            kuantitas_diterima: null,
            kuantitas_return: null,
            validated_at: null,
            jenis_validasi: null,
            kuantitas_koreksi: null,
            keterangan: null,
            status: null,
            jenis_selisih: null,
            stok_sebelum_source: 50,
            stok_sesudah_source: 38,
            stok_sebelum_dest: 5,
            stok_sesudah_dest: 17,
            harga_beli_avg: 65000,
            product: {
                uid: "mock-prod-trf-2",
                nama: "Beras Rojolele Super 5kg Karung",
                barcode: "8994444555666",
                satuan: "Karung",
            },
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
        stepCount: 10,
        badge: "Pengiriman",
        isAvailable: true,
    },
    {
        id: "stock_transfer_receive",
        title: "Penerimaan Transfer Masuk",
        description:
            "Panduan memeriksa kiriman fisik dari cabang lain, verifikasi surat jalan, dan input penerimaan stok.",
        category: "Transfer Stok Fisik",
        stepCount: 11,
        badge: "Penerimaan",
        isAvailable: true,
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
