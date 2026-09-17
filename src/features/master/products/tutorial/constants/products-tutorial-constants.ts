import type { Product } from "@/features/master/products/types";
import type { ProductsTutorialMeta } from "../types/products-tutorial";

export const PRODUCTS_TUTORIAL_LIST: ProductsTutorialMeta[] = [
    {
        id: "tambah_produk",
        title: "Tambah Produk Baru (Lengkap)",
        description: "Alur lengkap: pencarian katalog pusat, buat baru, barcode otomatis, kategori/unit, margin harga & grosir.",
        category: "Master Produk",
        stepCount: 10,
        badge: "Alur Lengkap",
        isAvailable: true,
    },
    {
        id: "edit_produk",
        title: "Edit & Penyesuaian Harga Produk",
        description: "Perbarui identitas, ubah harga modal/jual, margin keuntungan, dan pengaturan grosir.",
        category: "Master Produk",
        stepCount: 4,
        isAvailable: true,
    },
    {
        id: "hapus_produk",
        title: "Hapus / Arsipkan Produk",
        description: "Pelajari cara menghapus produk dari inventori toko atau menonaktifkan status SKU.",
        category: "Master Produk",
        stepCount: 4,
        isAvailable: true,
    },
    {
        id: "filter_produk",
        title: "Pencarian & Filter Multi-Kriteria",
        description: "Cari cepat via barcode, filter kategori, brand, status aktif/arsip, dan tipe produk.",
        category: "Master Produk",
        stepCount: 4,
        badge: "Pencarian Cepat",
        isAvailable: true,
    },
];

export const MOCK_MASTER_PRODUCTS: Product[] = [
    {
        uid: "tutorial-mock-product-1",
        nama: "Kopi Susu Gula Aren (Demo)",
        merek: "Mitra Rasa",
        barcode: "8991234567890",
        harga: 25000,
        harga_jual: 25000,
        harga_beli: 18000,
        margin: 38.89,
        stok: 50,
        status: "active",
        satuan: "Cangkir",
        is_grosir: false,
    },
    {
        uid: "tutorial-mock-product-2",
        nama: "Benang Jahit Hitam (Demo Diarsipkan)",
        merek: "Astra",
        barcode: "8992345678901",
        harga: 7500,
        harga_jual: 7500,
        harga_beli: 4500,
        margin: 40,
        stok: 0,
        status: "archived",
        satuan: "Pcs",
        is_grosir: false,
    },
];
