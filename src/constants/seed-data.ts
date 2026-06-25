import type { Category } from "@/features/categories/types";
import type { Brand } from "@/features/brands/types";
import type { Supplier } from "@/features/suppliers/types";

export const SEED_CATEGORIES: Omit<Category, "uid">[] = [
    { nama: "Makanan Ringan", deskripsi: "Camilan, biskuit, keripik, dan makanan ringan lainnya" },
    { nama: "Minuman", deskripsi: "Air mineral, soft drink, jus, teh, dan kopi kemasan" },
    { nama: "Sembako", deskripsi: "Bahan makanan pokok seperti beras, minyak goreng, gula, dan telur" },
    { nama: "Perawatan Pribadi", deskripsi: "Sabun, sampo, pasta gigi, sikat gigi, dan kosmetik" },
    { nama: "Kebutuhan Rumah Tangga", deskripsi: "Deterjen, sabun cuci piring, pembasmi serangga, dan tisu" },
    { nama: "Obat & Kesehatan", deskripsi: "Obat bebas, vitamin, plester, dan suplemen" },
    { nama: "Alat Tulis Kantor", deskripsi: "Buku tulis, pulpen, pensil, map, dan peralatan tulis lainnya" }
];

export const SEED_BRANDS: Omit<Brand, "uid">[] = [
    { nama: "Indofood", deskripsi: "Produk makanan dari Indofood Group" },
    { nama: "Unilever", deskripsi: "Produk perawatan tubuh dan rumah tangga Unilever" },
    { nama: "Aqua", deskripsi: "Air minum dalam kemasan Aqua" },
    { nama: "Wings", deskripsi: "Produk kebutuhan rumah tangga Wings Group" },
    { nama: "Coca-Cola", deskripsi: "Minuman bersoda Coca-Cola Company" },
    { nama: "Nestle", deskripsi: "Produk makanan dan minuman Nestle" },
    { nama: "Mayora", deskripsi: "Biskuit, permen, dan kopi dari Mayora" },
    { nama: "Bimoli", deskripsi: "Minyak goreng Bimoli" },
    { nama: "ABC", deskripsi: "Kecap, saus, dan sirup ABC" },
    { nama: "Kapal Api", deskripsi: "Kopi Kapal Api dan variannya" }
];

export const SEED_SUPPLIERS: Omit<Supplier, "uid" | "created_at">[] = [
    {
        nama: "PT. Sumber Alfaria Trijaya",
        email: "info@alfamart.co.id",
        nomor_telepon: "02155755999",
        alamat: "Jl. Jalur Sutera Barat No. 9, Alam Sutera, Tangerang"
    },
    {
        nama: "CV. Makmur Sentosa",
        email: "makmur.sentosa@gmail.com",
        nomor_telepon: "081234567890",
        alamat: "Jl. Raya Kebayoran Lama No. 12, Jakarta Selatan"
    },
    {
        nama: "PT. Wira Logistik Utama",
        email: "contact@wiralogistik.co.id",
        nomor_telepon: "02188997766",
        alamat: "Kawasan Industri MM2100 Blok C-3, Cibitung, Bekasi"
    },
    {
        nama: "Distributor Sembako Jaya",
        email: "sembakojaya.dist@outlook.com",
        nomor_telepon: "085678901234",
        alamat: "Jl. Pasar Pagi No. 45, Roa Malaka, Jakarta Barat"
    },
    {
        nama: "PT. Unilever Indonesia Distribusi",
        email: "cs@unilever.co.id",
        nomor_telepon: "08001558000",
        alamat: "BSD Green Office Park Kav 3, Jl. BSD Boulevard Barat, Tangerang"
    }
];

export interface SeedProductInput {
    nama: string;
    categoryName: string;
    brandName: string;
    barcode: string;
    harga_beli: number;
    harga: number;
    stok: number;
}

export const SEED_PRODUCTS: SeedProductInput[] = [
    {
        nama: "Indomie Goreng Spesial 85g",
        categoryName: "Sembako",
        brandName: "Indofood",
        barcode: "071184411032",
        harga_beli: 2700,
        harga: 3500,
        stok: 120
    },
    {
        nama: "Indomie Rasa Ayam Bawang 75g",
        categoryName: "Sembako",
        brandName: "Indofood",
        barcode: "071184411148",
        harga_beli: 2600,
        harga: 3300,
        stok: 100
    },
    {
        nama: "Coca-Cola Pet 390ml",
        categoryName: "Minuman",
        brandName: "Coca-Cola",
        barcode: "899000110134",
        harga_beli: 4500,
        harga: 6000,
        stok: 50
    },
    {
        nama: "Aqua Air Mineral 600ml",
        categoryName: "Minuman",
        brandName: "Aqua",
        barcode: "899269640441",
        harga_beli: 2200,
        harga: 3500,
        stok: 200
    },
    {
        nama: "Aqua Air Mineral 1500ml",
        categoryName: "Minuman",
        brandName: "Aqua",
        barcode: "899269640442",
        harga_beli: 4500,
        harga: 6500,
        stok: 150
    },
    {
        nama: "Pepsodent Action 123 190g",
        categoryName: "Perawatan Pribadi",
        brandName: "Unilever",
        barcode: "899999905477",
        harga_beli: 14500,
        harga: 18500,
        stok: 40
    },
    {
        nama: "Sabun Mandi Lifebuoy Red 110g",
        categoryName: "Perawatan Pribadi",
        brandName: "Unilever",
        barcode: "899999900224",
        harga_beli: 3800,
        harga: 5000,
        stok: 80
    },
    {
        nama: "Rinso Liquid Deterjen 750ml",
        categoryName: "Kebutuhan Rumah Tangga",
        brandName: "Unilever",
        barcode: "899999905631",
        harga_beli: 22000,
        harga: 28000,
        stok: 30
    },
    {
        nama: "Minyak Goreng Bimoli Spesial 2L",
        categoryName: "Sembako",
        brandName: "Bimoli",
        barcode: "899269642002",
        harga_beli: 32000,
        harga: 38500,
        stok: 60
    },
    {
        nama: "Teh Celup SariWangi isi 25",
        categoryName: "Minuman",
        brandName: "Unilever",
        barcode: "899999900898",
        harga_beli: 5500,
        harga: 7500,
        stok: 100
    },
    {
        nama: "Kecap Manis ABC Refill 520ml",
        categoryName: "Sembako",
        brandName: "ABC",
        barcode: "899274190102",
        harga_beli: 18000,
        harga: 22000,
        stok: 45
    },
    {
        nama: "Saus Sambal ABC Asli 335ml",
        categoryName: "Sembako",
        brandName: "ABC",
        barcode: "899274190203",
        harga_beli: 13500,
        harga: 16500,
        stok: 40
    },
    {
        nama: "Kopi Kapal Api Special Mix 10 x 24g",
        categoryName: "Minuman",
        brandName: "Kapal Api",
        barcode: "899274112224",
        harga_beli: 11000,
        harga: 14000,
        stok: 90
    },
    {
        nama: "Roma Kelapa Biskuit 300g",
        categoryName: "Makanan Ringan",
        brandName: "Mayora",
        barcode: "899600130104",
        harga_beli: 8500,
        harga: 11000,
        stok: 75
    },
    {
        nama: "Kopiko Permen Kantong 150g",
        categoryName: "Makanan Ringan",
        brandName: "Mayora",
        barcode: "899600130205",
        harga_beli: 6000,
        harga: 8000,
        stok: 100
    },
    {
        nama: "Milo Cokelat Bubuk 400g",
        categoryName: "Minuman",
        brandName: "Nestle",
        barcode: "899269640702",
        harga_beli: 38000,
        harga: 46000,
        stok: 35
    }
];
