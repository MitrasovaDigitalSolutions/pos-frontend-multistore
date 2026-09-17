import type { PurchaseItemLocal, Receiving, PaymentSummary } from "@/features/purchase/types";
import type { PurchaseTutorialMeta } from "../types/purchase-tutorial";
import type { ComparePricesResult } from "@/features/purchase/api/purchase-api";

export const PURCHASE_TUTORIAL_LIST: PurchaseTutorialMeta[] = [
    {
        id: "po_create",
        submenu: "order",
        title: "Pembuatan Purchase Order (PO)",
        description: "Panduan lengkap membuat dokumen pesanan pembelian baru ke supplier / distributor, scan produk, dan proses PO.",
        category: "Pemesanan",
        stepCount: 7,
        badge: "Tersedia",
        isAvailable: true,
    },
    {
        id: "receiving_create",
        submenu: "receiving",
        title: "Penerimaan Barang (Goods Receiving)",
        description: "Alur verifikasi dan pengecekan fisik barang yang tiba: penerimaan langsung vs PO, proteksi margin harga, dan finalisasi faktur.",
        category: "Penerimaan",
        stepCount: 10,
        badge: "Tersedia",
        isAvailable: true,
    },
    {
        id: "payment_create",
        submenu: "payment",
        title: "Pembayaran Pembelian",
        description: "Pencatatan kas keluar untuk pembayaran faktur hutang pembelian ke supplier secara bertahap (termin) atau lunas.",
        category: "Pembayaran",
        stepCount: 10,
        badge: "Tersedia",
        isAvailable: true,
    },
    {
        id: "return_create",
        submenu: "return",
        title: "Retur Pembelian Barang",
        description: "Proses pengembalian barang rusak atau cacat ke distributor serta penyelesaian potong hutang atau refund tunai.",
        category: "Retur",
        stepCount: 9,
        badge: "Tersedia",
        isAvailable: true,
    },
];

export const MOCK_PO_ITEMS: PurchaseItemLocal[] = [
    {
        temp_uid: "mock-po-item-1",
        product_uid: "tutorial-po-prod-1",
        barcode: "8991234567890",
        nama: "Kopi Susu Gula Aren 250ml",
        kuantitas: 24,
        harga_estimasi: 18000,
    },
    {
        temp_uid: "mock-po-item-2",
        product_uid: "tutorial-po-prod-2",
        barcode: "8991234567891",
        nama: "Roti Bakar Coklat Keju Premium",
        kuantitas: 30,
        harga_estimasi: 12000,
    },
];

export const MOCK_PO_NOTES = "Mohon dikirim sebelum hari Jumat via kurir reguler.";

export const MOCK_RECEIVING_ITEMS: PurchaseItemLocal[] = [
    {
        temp_uid: "mock-rec-item-1",
        product_uid: "tutorial-rec-prod-1",
        barcode: "8991234567890",
        nama: "Kopi Susu Gula Aren 250ml",
        kuantitas: 24,
        harga_estimasi: 18000,
    },
    {
        temp_uid: "mock-rec-item-2",
        product_uid: "tutorial-rec-prod-2",
        barcode: "8991234567891",
        nama: "Roti Bakar Coklat Keju Premium",
        kuantitas: 30,
        harga_estimasi: 12000,
    },
];

export const MOCK_PRICE_ALERTS: ComparePricesResult[] = [
    {
        product_uid: "tutorial-rec-prod-1",
        nama: "Kopi Susu Gula Aren 250ml",
        harga_beli_lama: 15000,
        harga_beli_baru: 18000,
        harga_beli_avg: 16500,
        harga_jual_lama: 22000,
        margin_lama: 46.67,
        harga_jual_saran: 26400,
        harga_jual_saran_avg: 24200,
        selisih_harga_beli: 3000,
        perlu_alert: true,
    },
    {
        product_uid: "tutorial-rec-prod-2",
        nama: "Roti Bakar Coklat Keju Premium",
        harga_beli_lama: 10000,
        harga_beli_baru: 12000,
        harga_beli_avg: 11000,
        harga_jual_lama: 15000,
        margin_lama: 50,
        harga_jual_saran: 18000,
        harga_jual_saran_avg: 16500,
        selisih_harga_beli: 2000,
        perlu_alert: true,
    },
];

export function isMockPurchaseItem(item: PurchaseItemLocal): boolean {
    return Boolean(
        item.temp_uid?.startsWith("mock-po-") ||
        item.temp_uid?.startsWith("mock-rec-") ||
        item.temp_uid?.startsWith("mock-ret-") ||
        item.product_uid?.startsWith("tutorial-po-") ||
        item.product_uid?.startsWith("tutorial-rec-") ||
        item.product_uid?.startsWith("tutorial-ret-")
    );
}

export const MOCK_OUTSTANDING_RECEIVING: Receiving = {
    uid: "mock-rec-tut-1",
    nomor_penerimaan: "REC-2024-0091",
    supplier_uid: "mock-supp-1",
    supplier: "PT Sumber Makmur Distributor",
    supplier_relationship: {
        uid: "mock-supp-1",
        nama: "PT Sumber Makmur Distributor",
    } as unknown as Receiving["supplier_relationship"],
    nomor_faktur: "INV/SMD/2024/089",
    nilai_faktur: 5000000,
    status: "completed",
    status_pembayaran: "partial",
    metode_transaksi: "credit",
    cash_account_uid: null,
    nominal_bayar: 1500000,
    total_dibayar: 1500000,
    sisa_hutang: 3500000,
    catatan: "Penerimaan pengadaan rutin barang grosir",
    tanggal_terima: "2024-09-01",
    created_at: "2024-09-01T08:00:00.000Z",
};

export const MOCK_PAYMENT_SUMMARY: PaymentSummary = {
    receiving_uid: "mock-rec-tut-1",
    nomor_penerimaan: "REC-2024-0091",
    total_faktur: 5000000,
    total_dibayar: 1500000,
    sisa_hutang: 3500000,
    status_pembayaran: "partial",
    payments: [
        {
            uid: "mock-pay-hist-1",
            metode: "Cash (DP Uang Muka)",
            tanggal: "2024-09-01T10:00:00.000Z",
            jumlah: 1500000,
        },
    ],
};

export const MOCK_PAYMENT_INPUT = {
    receiving_uid: "mock-rec-tut-1",
    jumlah_bayar: 1500000,
    tanggal_bayar: "2024-09-14",
    cash_account_uid: "mock-cash-acc-1",
    metode_pembayaran: "Transfer",
    nomor_referensi: "TRF-BCA-883921",
    catatan: "Pembayaran termin ke-2 pengadaan barang distributor",
};

export const MOCK_RETURN_ITEMS: PurchaseItemLocal[] = [
    {
        temp_uid: "mock-ret-item-1",
        product_uid: "tutorial-ret-prod-1",
        barcode: "8991234567890",
        nama: "Kopi Susu Gula Aren 250ml",
        kuantitas: 5,
        harga_estimasi: 18000,
        alasan: "damaged",
    },
    {
        temp_uid: "mock-ret-item-2",
        product_uid: "tutorial-ret-prod-2",
        barcode: "8991234567891",
        nama: "Roti Bakar Coklat Keju Premium",
        kuantitas: 10,
        harga_estimasi: 12000,
        alasan: "expired",
    },
];

export const MOCK_RETURN_LIMITS_MAP: Record<string, { sisa: number; nama: string; harga: number }> = {
    "tutorial-ret-prod-1": {
        sisa: 24,
        nama: "Kopi Susu Gula Aren 250ml",
        harga: 18000,
    },
    "tutorial-ret-prod-2": {
        sisa: 30,
        nama: "Roti Bakar Coklat Keju Premium",
        harga: 12000,
    },
};

export const MOCK_RETURN_HEADER_INPUT = {
    receiving_uid: "mock-rec-tut-1",
    supplier_uid: "mock-supp-1",
    tanggal_retur: "2024-09-14",
    catatan: "Klaim retur botol kopi bocor & roti berjamur",
};


