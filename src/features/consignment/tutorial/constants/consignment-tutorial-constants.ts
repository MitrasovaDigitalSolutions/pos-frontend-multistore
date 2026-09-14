import type { Product } from "@/features/master/products/types";
import type { ConsignmentReceivingFormValues } from "../../schemas/consignment-schema";
import type { ConsignmentTutorialMeta } from "../types/consignment-tutorial";
import type { ConsignmentReceiving, ReturnableItem } from "../../types";

export const MOCK_CONSIGNMENT_SUPPLIER = {
    uid: "mock-cons-sup-1",
    nama: "PT Mitra Boga Mandiri (Pemasok Titipan)",
    telepon: "0812-3456-7890",
    alamat: "Kawasan Industri Pangan No. 12, Surabaya",
};

export const MOCK_CONSIGNMENT_PRODUCTS: Product[] = [
    {
        uid: "mock-cons-prod-1",
        barcode: "8991234567890",
        nama: "Keripik Singkong Balado 250g (Konsinyasi)",
        harga_beli: 12000,
        harga_jual: 16000,
        stok: 0,
        satuan: "Bks",
        kategori: "Snack & Makanan Ringan",
    } as unknown as Product,
    {
        uid: "mock-cons-prod-2",
        barcode: "8992345678901",
        nama: "Kopi Susu Gula Aren 250ml (Konsinyasi)",
        harga_beli: 14000,
        harga_jual: 18500,
        stok: 0,
        satuan: "Btl",
        kategori: "Minuman Dingin",
    } as unknown as Product,
];

export const MOCK_CONSIGNMENT_ITEMS: ConsignmentReceivingFormValues["items"] = [
    {
        product_uid: "mock-cons-prod-1",
        kuantitas: 30,
        harga_beli: 12000,
        update_harga_jual: false,
        harga_jual_baru: null,
        margin_baru: null,
    },
    {
        product_uid: "mock-cons-prod-2",
        kuantitas: 24,
        harga_beli: 14000,
        update_harga_jual: false,
        harga_jual_baru: null,
        margin_baru: null,
    },
];

export const MOCK_CONSIGNMENT_NOTES = "Titipan produk snack & minuman edisi promo awal bulan. Bagi hasil 25%.";

export const MOCK_PAYMENT_CONSIGNMENT_ROW: ConsignmentReceiving = {
    uid: "mock-cons-pay-01",
    store_uid: "mock-store-1",
    user_uid: "mock-user-1",
    nomor_konsinyasi: "CS-202609-0088",
    supplier_uid: "mock-cons-sup-1",
    supplier: "PT Mitra Boga Mandiri (Pemasok Titipan)",
    tanggal_terima: "2026-09-01",
    tanggal_jatuh_tempo: "2026-09-30",
    catatan: "Sesi konsinyasi reguler awal bulan.",
    status: "completed",
    sisa_hutang: 450000,
    sisa_titipan: 18,
    created_at: "2026-09-01T08:00:00.000Z",
    updated_at: "2026-09-14T08:00:00.000Z",
};

export const MOCK_PAYMENT_RETURNABLE_ITEMS: ReturnableItem[] = [
    {
        uid: "mock-ret-item-1",
        product_uid: "mock-cons-prod-1",
        nama: "Keripik Singkong Balado 250g",
        kuantitas: 30,
        qty_terjual: 20,
        qty_diretur: 0,
        sisa: 10,
        harga_beli: 12000,
    },
    {
        uid: "mock-ret-item-2",
        product_uid: "mock-cons-prod-2",
        nama: "Kopi Susu Gula Aren 250ml",
        kuantitas: 24,
        qty_terjual: 16,
        qty_diretur: 0,
        sisa: 8,
        harga_beli: 14000,
    },
];

export const MOCK_PAYMENT_NOTE = "Pelunasan penjualan minggu ke-1 & retur sisa 18 pcs barang.";

export const CONSIGNMENT_TUTORIAL_METAS: ConsignmentTutorialMeta[] = [
    {
        id: "consignment_create",
        title: "Alur Penerimaan Konsinyasi (Titip Jual)",
        description:
            "Pelajari alur lengkap pencatatan barang titipan supplier, penentuan tanggal jatuh tempo, kuantitas fisik, dan konsep akuntansi stok off-book.",
        category: "Penerimaan Konsinyasi",
        stepCount: 9,
        badge: "Fitur Inti",
        isAvailable: true,
    },
    {
        id: "consignment_payment",
        title: "Pelunasan & Penutupan Sesi",
        description:
            "Panduan pembayaran hasil penjualan barang konsinyasi yang laku di kasir, verifikasi hutang dagang, dan auto-retur sisa barang titipan.",
        category: "Pelunasan Konsinyasi",
        stepCount: 8,
        badge: "Keuangan",
        isAvailable: true,
    },
];
