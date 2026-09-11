import type { PurchaseItemLocal } from "@/features/purchase/types";
import type { PurchaseTutorialMeta } from "../types/purchase-tutorial";

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
        title: "Penerimaan Barang Pesanan",
        description: "Alur verifikasi dan pengecekan fisik barang yang tiba dari distributor berdasarkan nomor dokumen PO.",
        category: "Penerimaan",
        stepCount: 6,
        badge: "Segera Hadir",
        isAvailable: false,
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

export function isMockPurchaseItem(item: PurchaseItemLocal): boolean {
    return Boolean(
        item.temp_uid?.startsWith("mock-po-") ||
        item.product_uid?.startsWith("tutorial-po-")
    );
}
