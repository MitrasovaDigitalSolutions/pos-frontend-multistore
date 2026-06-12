/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Database Seed Script for POS-FRONTEND
 * Populates Categories, Brands, Suppliers, and Products.
 * Run this script using: bun run scripts/seed.ts
 */

import { existsSync } from "fs";

// Load environment variables from .env if running directly
// Bun loads .env automatically, but we can verify it
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

console.log("=========================================");
console.log("   POS DATABASE SEEDING UTILITY         ");
console.log("=========================================");
console.log(`Backend API URL: ${API_URL}`);

// Realistic Indonesian Seed Data
const categoriesToSeed = [
    { nama: "Makanan Ringan", deskripsi: "Camilan, biskuit, keripik, dan makanan ringan lainnya" },
    { nama: "Minuman", deskripsi: "Air mineral, soft drink, jus, teh, dan kopi kemasan" },
    { nama: "Sembako", deskripsi: "Bahan makanan pokok seperti beras, minyak goreng, gula, dan telur" },
    { nama: "Perawatan Pribadi", deskripsi: "Sabun, sampo, pasta gigi, sikat gigi, dan kosmetik" },
    { nama: "Kebutuhan Rumah Tangga", deskripsi: "Deterjen, sabun cuci piring, pembasmi serangga, dan tisu" },
    { nama: "Obat & Kesehatan", deskripsi: "Obat bebas, vitamin, plester, dan suplemen" },
    { nama: "Alat Tulis Kantor", deskripsi: "Buku tulis, pulpen, pensil, map, dan peralatan tulis lainnya" }
];

const brandsToSeed = [
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

const suppliersToSeed = [
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

const productsToSeed = [
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

async function main() {
    // 1. Authenticate
    let username = process.env.SEED_USERNAME;
    let password = process.env.SEED_PASSWORD;

    if (!username) {
        username = prompt("Masukkan Username Admin/Kasir:") || "";
    }
    if (!password) {
        password = prompt("Masukkan Password:") || "";
    }

    if (!username || !password) {
        console.error("❌ Username dan Password harus diisi untuk proses seeding.");
        process.exit(1);
    }

    console.log(`\n🔑 Mencoba login sebagai: ${username}...`);
    let token = "";

    try {
        const loginRes = await fetch(`${API_URL}/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const loginData = await loginRes.json() as { access_token?: string; message?: string };

        if (!loginRes.ok || !loginData.access_token) {
            throw new Error(loginData.message || "Gagal mendapatkan token login.");
        }

        token = loginData.access_token;
        console.log("✅ Login berhasil!");
    } catch (err: any) {
        console.error(`❌ Gagal login: ${err.message}`);
        process.exit(1);
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    };

    // Helper functions to manage entities
    const getExisting = async (endpoint: string): Promise<any[]> => {
        try {
            const res = await fetch(`${API_URL}${endpoint}?per_page=1000`, { headers });
            if (!res.ok) return [];
            const data = await res.json() as { data?: any[] | any };
            // Some endpoints might return raw array, others wrapped in { data }
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.data)) return data.data;
            return [];
        } catch {
            return [];
        }
    };

    console.log("\n📦 Mengambil data yang sudah ada di database...");
    const [existingCategories, existingBrands, existingSuppliers, existingProducts] = await Promise.all([
        getExisting("/v1/categories"),
        getExisting("/v1/brands"),
        getExisting("/v1/inventory/suppliers"),
        getExisting("/v1/products"),
    ]);

    console.log(`- Kategori eksis: ${existingCategories.length}`);
    console.log(`- Brand eksis: ${existingBrands.length}`);
    console.log(`- Supplier eksis: ${existingSuppliers.length}`);
    console.log(`- Produk eksis: ${existingProducts.length}`);

    // Map names to existing objects for easy lookup
    const categoryMap = new Map<string, number>();
    existingCategories.forEach((c) => categoryMap.set(c.nama.toLowerCase(), c.id));

    const brandMap = new Map<string, number>();
    existingBrands.forEach((b) => brandMap.set(b.nama.toLowerCase(), b.id));

    const supplierMap = new Map<string, number>();
    existingSuppliers.forEach((s) => supplierMap.set(s.nama.toLowerCase(), s.id));

    const productBarcodeSet = new Set<string>();
    existingProducts.forEach((p) => {
        if (p.barcode) productBarcodeSet.add(p.barcode);
    });
    const productNameSet = new Set<string>();
    existingProducts.forEach((p) => productNameSet.add(p.nama.toLowerCase()));

    // 2. Seeding Categories
    console.log("\n📂 Memproses Kategori...");
    for (const cat of categoriesToSeed) {
        const key = cat.nama.toLowerCase();
        if (categoryMap.has(key)) {
            console.log(`  • Kategori [${cat.nama}] sudah ada.`);
        } else {
            try {
                const res = await fetch(`${API_URL}/v1/categories`, {
                    method: "POST",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify(cat),
                });
                const result = await res.json() as { data: { id: number; nama: string } };
                if (res.ok && result.data?.id) {
                    categoryMap.set(key, result.data.id);
                    console.log(`  ➕ Kategori [${cat.nama}] berhasil dibuat.`);
                } else {
                    console.warn(`  ⚠ Gagal membuat kategori [${cat.nama}]:`, result);
                }
            } catch (err: any) {
                console.error(`  ❌ Error kategori [${cat.nama}]: ${err.message}`);
            }
        }
    }

    // 3. Seeding Brands
    console.log("\n🏷 Memproses Brand...");
    for (const brand of brandsToSeed) {
        const key = brand.nama.toLowerCase();
        if (brandMap.has(key)) {
            console.log(`  • Brand [${brand.nama}] sudah ada.`);
        } else {
            try {
                const res = await fetch(`${API_URL}/v1/brands`, {
                    method: "POST",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify(brand),
                });
                const result = await res.json() as { data: { id: number; nama: string } };
                if (res.ok && result.data?.id) {
                    brandMap.set(key, result.data.id);
                    console.log(`  ➕ Brand [${brand.nama}] berhasil dibuat.`);
                } else {
                    console.warn(`  ⚠ Gagal membuat brand [${brand.nama}]:`, result);
                }
            } catch (err: any) {
                console.error(`  ❌ Error brand [${brand.nama}]: ${err.message}`);
            }
        }
    }

    // 4. Seeding Suppliers
    console.log("\n🚚 Memproses Supplier...");
    for (const sup of suppliersToSeed) {
        const key = sup.nama.toLowerCase();
        if (supplierMap.has(key)) {
            console.log(`  • Supplier [${sup.nama}] sudah ada.`);
        } else {
            try {
                const res = await fetch(`${API_URL}/v1/inventory/suppliers`, {
                    method: "POST",
                    headers: { ...headers, "Content-Type": "application/json" },
                    body: JSON.stringify(sup),
                });
                const result = await res.json() as { data: { id: number; nama: string } };
                if (res.ok && result.data?.id) {
                    supplierMap.set(key, result.data.id);
                    console.log(`  ➕ Supplier [${sup.nama}] berhasil dibuat.`);
                } else {
                    console.warn(`  ⚠ Gagal membuat supplier [${sup.nama}]:`, result);
                }
            } catch (err: any) {
                console.error(`  ❌ Error supplier [${sup.nama}]: ${err.message}`);
            }
        }
    }

    // 5. Seeding Products
    console.log("\n🛍 Memproses Produk...");
    for (const prod of productsToSeed) {
        const keyName = prod.nama.toLowerCase();
        if (prod.barcode && productBarcodeSet.has(prod.barcode)) {
            console.log(`  • Produk dengan barcode [${prod.barcode}] sudah ada (${prod.nama}).`);
            continue;
        }
        if (productNameSet.has(keyName)) {
            console.log(`  • Produk dengan nama [${prod.nama}] sudah ada.`);
            continue;
        }

        const categoryId = categoryMap.get(prod.categoryName.toLowerCase());
        const brandId = brandMap.get(prod.brandName.toLowerCase());

        // Calculate margin
        const marginVal = parseFloat((((prod.harga - prod.harga_beli) / prod.harga_beli) * 100).toFixed(2));

        // Construct FormData for multipart request
        const formData = new FormData();
        formData.append("nama", prod.nama);
        formData.append("merek", prod.brandName); // Frontend sets "merek" to the brand name
        if (prod.barcode) formData.append("barcode", prod.barcode);
        formData.append("harga", String(prod.harga));
        formData.append("stok", String(prod.stok));
        formData.append("harga_beli", String(prod.harga_beli));
        formData.append("margin", String(marginVal));
        if (categoryId) formData.append("category_id", String(categoryId));
        if (brandId) formData.append("brand_id", String(brandId));

        try {
            // Send request to create product
            // Wait, we do NOT set Content-Type header manually for FormData fetch.
            // Fetch will automatically add the correct multipart/form-data with the boundary.
            const res = await fetch(`${API_URL}/v1/products`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: formData,
            });

            const result = await res.json() as { message?: string; errors?: any };
            if (res.ok) {
                console.log(`  ➕ Produk [${prod.nama}] berhasil dibuat.`);
                if (prod.barcode) productBarcodeSet.add(prod.barcode);
                productNameSet.add(keyName);
            } else {
                console.warn(`  ⚠ Gagal membuat produk [${prod.nama}]:`, result.message || result.errors);
            }
        } catch (err: any) {
            console.error(`  ❌ Error produk [${prod.nama}]: ${err.message}`);
        }
    }

    console.log("\n=========================================");
    console.log("🎉 SEED DATA BERHASIL DIPROSES!");
    console.log("=========================================\n");
}

main().catch((err) => {
    console.error("❌ Fatal error in seed script:", err);
});
