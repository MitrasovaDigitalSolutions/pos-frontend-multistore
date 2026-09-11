import type { PurchaseItemLocal } from "@/features/purchase/types";
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
        title: "Pelunasan Hutang Pembelian",
        description: "Pencatatan kas keluar untuk pembayaran faktur hutang pembelian ke supplier secara bertahap atau lunas.",
        category: "Pembayaran",
        stepCount: 5,
        badge: "Segera Hadir",
        isAvailable: false,
    },
    {
        id: "return_create",
        submenu: "return",
        title: "Retur Pembelian Barang Rusak",
        description: "Proses pengembalian barang rusak atau cacat ke distributor serta pemotongan saldo hutang.",
        category: "Retur",
        stepCount: 5,
        badge: "Segera Hadir",
        isAvailable: false,
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
        item.product_uid?.startsWith("tutorial-po-") ||
        item.product_uid?.startsWith("tutorial-rec-")
    );
}
