import type { Opname, OpnameItem } from "../../types";
import type { StockTutorialMeta } from "../types/stock-tutorial";

export const MOCK_OPNAME_UID = "mock-opname-tut-1";

export const MOCK_OPNAME: Opname = {
    uid: MOCK_OPNAME_UID,
    nomor_opname: "SO-2024-DEMO",
    status: "draft",
    created_at: new Date().toISOString(),
    catatan: "Audit Rutin Bulanan - Toko Pusat",
    items_count: 3,
    user: {
        uid: "user-1",
        name: "Demo Supervisor",
        username: "supervisor",
    },
};

export const MOCK_OPNAME_ITEMS: OpnameItem[] = [
    {
        uid: "mock-op-item-1",
        opname_uid: MOCK_OPNAME_UID,
        product_uid: "mock-prod-1",
        nama: "Kopi Arabika Premium 250g",
        barcode: "8991234567011",
        category_uid: "cat-1",
        brand_uid: "brand-1",
        stok_sistem: 15,
        stok_fisik: 15,
        selisih: 0,
        alasan: null,
        product: {
            uid: "mock-prod-1",
            nama: "Kopi Arabika Premium 250g",
            barcode: "8991234567011",
            harga: 45000,
            stok: 15,
            merek: null,
            status: "active",
        },
    },
    {
        uid: "mock-op-item-2",
        opname_uid: MOCK_OPNAME_UID,
        product_uid: "mock-prod-2",
        nama: "Minyak Goreng Sawit 2L",
        barcode: "8991234567022",
        category_uid: "cat-2",
        brand_uid: "brand-2",
        stok_sistem: 20,
        stok_fisik: 18,
        selisih: -2,
        alasan: "2 botol bocor/pecah di rak belakang",
        product: {
            uid: "mock-prod-2",
            nama: "Minyak Goreng Sawit 2L",
            barcode: "8991234567022",
            harga: 34000,
            stok: 20,
            merek: null,
            status: "active",
        },
    },
    {
        uid: "mock-op-item-3",
        opname_uid: MOCK_OPNAME_UID,
        product_uid: "mock-prod-3",
        nama: "Beras Premium Pandan Wangi 5kg",
        barcode: "8991234567033",
        category_uid: "cat-1",
        brand_uid: "brand-3",
        stok_sistem: 10,
        stok_fisik: 12,
        selisih: 2,
        alasan: "Koreksi retur grosir belum tercatat",
        product: {
            uid: "mock-prod-3",
            nama: "Beras Premium Pandan Wangi 5kg",
            barcode: "8991234567033",
            harga: 78000,
            stok: 10,
            merek: null,
            status: "active",
        },
    },
];

export const MOCK_SCANNED_OPNAME_ITEM: OpnameItem = {
    uid: "mock-op-item-4",
    opname_uid: MOCK_OPNAME_UID,
    product_uid: "mock-prod-4",
    nama: "Susu UHT Full Cream 1L",
    barcode: "8991234567890",
    category_uid: "cat-2",
    brand_uid: "brand-1",
    stok_sistem: 24,
    stok_fisik: 25,
    selisih: 1,
    alasan: null,
    product: {
        uid: "mock-prod-4",
        nama: "Susu UHT Full Cream 1L",
        barcode: "8991234567890",
        harga: 19500,
        stok: 24,
        merek: null,
        status: "active",
    },
};

export const STOCK_TUTORIAL_METAS: StockTutorialMeta[] = [
    {
        id: "stock_opname",
        title: "Panduan Lengkap Stock Opname",
        description:
            "Pelajari alur audit fisik barang toko: unduh template/dokumen, pilih metode upload Excel atau scan barcode manual, verifikasi selisih, hingga finalisasi otomatis.",
        badge: "Fitur Opname",
        duration: "3-4 Menit",
        stepCount: 14,
        isAvailable: true,
    },
];
