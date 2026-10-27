# BLUEPRINT IMPLEMENTASI FRONTEND: MODUL APOTEK & FARMASI (PRESET PHARMACY)
## Sistem Multi-Preset POS, Resep Dokter, & Obat Racikan (Compounded Items) — Single Codebase Next.js 15
> **Target Aplikasi**: `pos-frontend-multistore` (`frontend/`)  
> **Status Backend**: **LIVE & TESTED DI SERVER STAGING VPS (`http://43.173.15.154:8085`)**  
> **Dokumentasi API Swagger**: `http://43.173.15.154:8085/docs` | `http://43.173.15.154:8085/docs/openapi.json`  
> **Standar Arsitektur**: Mengikuti aturan `frontend/AGENTS.md` (Bun, Next.js 15, Anti-God Component, Mobile-First 100dvh, Zero `any`).

---

## 1. Konsep Bisnis Nyata Apotek

Transaksi kasir apotek terbagi menjadi 3 skenario:
1. **Penjualan Obat Jadi (Reguler)**:
   - Pasien membeli obat kemasan pabrik (contoh: *Sanmol Forte Syrup 1 botol* atau *Amoxicillin 1 strip*).
   - Scan barcode / cari produk -> masuk keranjang kasir.
2. **Penjualan Obat Racikan Swamedikasi / OTC (Tanpa Resep Dokter)**:
   - Pasien datang langsung meminta puyer batuk untuk anak tanpa membawa kertas resep dokter.
   - **Header resep dokter bersifat OPSIONAL (bisa kosong / null)**.
   - Kasir meracik langsung di kasir: isi nama racikan (*"Puyer Batuk Anak"*), jumlah (*10 bungkus*), aturan pakai (*3x1 sesudah makan*), biaya tuslah/embalase, dan pilih bahan obat penyusunnya.
3. **Penjualan Obat Racikan / Obat Jadi dengan Resep Dokter**:
   - Membawa resep dokter: kasir mencatat data dokter (Nama, SIP) dan data pasien (Nama, Usia, Alamat).
   - Berisi campuran obat jadi maupun obat racikan.

### Aturan Inventory & Pemotongan Stok:
* Yang berkurang di stok gudang **bukan** nama puyernya, melainkan **masing-masing bahan obat penyusunnya** (Paracetamol, CTM, Ambroxol).
* Pemotongan stok bahan berjalan secara **FEFO (First Expired, First Out)** dari batch yang paling dekat tanggal kadaluarsanya.

---

## 2. API Contract Backend Apotek (Staging Server)

Backend apotek berjalan di VPS staging:
* **Base URL**: `http://43.173.15.154:8085/api/v1`
* **Swagger UI**: `http://43.173.15.154:8085/docs`

### 2.1. Lisensi & Deteksi Preset
```http
GET /api/v1/license/status
```
* **Payload**: `data.business_type: "pharmacy"`.

### 2.2. Manajemen Batch Obat (`product_batches`)
```http
GET    /api/v1/pharmacy/products/{productUid}/batches?status=active
POST   /api/v1/pharmacy/products/{productUid}/batches
PUT    /api/v1/pharmacy/batches/{batchUid}
```

### 2.3. Multi-Satuan / Konversi Unit (`product_unit_conversions`)
```http
GET    /api/v1/pharmacy/products/{productUid}/units
POST   /api/v1/pharmacy/products/{productUid}/units
DELETE /api/v1/pharmacy/units/{conversionUid}
```

### 2.4. Template Racikan Master (`prescriptions`)
```http
GET    /api/v1/pharmacy/prescriptions?search=&per_page=15
POST   /api/v1/pharmacy/prescriptions
GET    /api/v1/pharmacy/prescriptions/{uid}
DELETE /api/v1/pharmacy/prescriptions/{uid}
```
* Menyimpan formula master racikan apotek beserta komposisi bahan (`ingredients: [{ product_uid, nama_produk, kuantitas, dosis }]`).

### 2.5. Riwayat Racikan Terjual (`prescriptions/history`)
```http
GET /api/v1/pharmacy/prescriptions/history?search=&per_page=15
```
* Menampilkan daftar riwayat racikan yang telah terjual pada transaksi kasir checkout beserta relasi `ingredients.product` dan `sale`.

### 2.6. Checkout Kasir Apotek (Core-Extension Payload)
```http
POST /api/v1/transactions
```
* Payload checkout mendukung obat reguler dan obat racikan on-the-fly (`compounded_items`).
* **Catatan**: Header resep dokter (`prescription`) telah dihapus secara resmi.
```json
{
  "store_uid": "...",
  "items": [
    {
      "product_uid": "...",
      "kuantitas": 1,
      "harga_satuan": 25000,
      "subtotal": 25000
    }
  ],
  "compounded_items": [
    {
      "nama_racikan": "Puyer Batuk Anak",
      "jenis_racikan": "puyer",
      "jumlah_kemasan": 10,
      "aturan_pakai": "3x1 bungkus sesudah makan",
      "tuslah_fee": 5000,
      "embalase_fee": 2000,
      "total_harga": 19000,
      "ingredients": [
        {
          "product_uid": "uid-paracetamol",
          "nama_produk": "Paracetamol 500mg",
          "kuantitas": 2.5,
          "dosis_per_kemasan": "0.25 tab/bungkus",
          "harga_satuan": 1500,
          "subtotal": 3750
        },
        {
          "product_uid": "uid-ctm",
          "nama_produk": "CTM 4mg",
          "kuantitas": 5,
          "dosis_per_kemasan": "0.5 tab/bungkus",
          "harga_satuan": 1000,
          "subtotal": 5000
        },
        {
          "product_uid": "uid-ambroxol",
          "nama_produk": "Ambroxol 30mg",
          "kuantitas": 5,
          "dosis_per_kemasan": "0.5 tab/bungkus",
          "harga_satuan": 650,
          "subtotal": 3250
        }
      ]
    }
  ]
}
```

---

## 3. Struktur Folder Feature Apotek (`src/features/pharmacy`)

Sesuai aturan arsitektur feature-based:
```
frontend/src/features/pharmacy/
├── api/
│   └── pharmacy-api.ts                  # React Query queries & mutations (batches, units, prescriptions, compounds)
├── constants/
│   └── pharmacy-constants.ts            # Status batch, jenis sediaan racikan, threshold hari expired
├── types/
│   └── index.ts                         # Type definitions (ProductBatch, UnitConversion, Prescription, CompoundedItem)
├── schemas/
│   ├── batch-schema.ts                  # Zod schema form input batch baru
│   ├── unit-schema.ts                   # Zod schema form konversi satuan
│   ├── prescription-schema.ts           # Zod schema form header resep (semua field opsional)
│   └── compounded-item-schema.ts        # Zod schema form peracikan obat on-the-fly di kasir
├── hooks/
│   ├── use-product-batches.ts           # Hook get batches & FEFO indicators
│   ├── use-product-units.ts             # Hook get & convert multi-satuan
│   ├── use-compounded-cart.ts           # Hook state perakitan racikan di kasir (tambah bahan, hitung tuslah/embalase)
│   └── use-prescription-form.ts         # Hook state form header resep
└── components/
    ├── batch/
    │   ├── batch-badge.tsx              # Badge penanda expired (Merah < 30 hr, Kuning < 90 hr, Hijau Aman)
    │   ├── batch-list-dialog.tsx        # Dialog daftar batch per produk
    │   └── batch-form-dialog.tsx        # Modal input batch baru
    ├── units/
    │   ├── unit-conversion-dialog.tsx   # Modal pengaturan multi-satuan
    │   └── unit-selector.tsx            # Selector satuan di kasir/cart
    ├── compounding/
    │   ├── compounding-modal.tsx        # Modal peracikan obat di kasir (Anti-God: < 150 baris, pecah ke subkomponen)
    │   ├── compounding-header-form.tsx  # Input nama racikan, bentuk sediaan, jumlah bungkus, aturan pakai
    │   ├── compounding-ingredient-picker.tsx # Pencarian & pemilihan bahan obat dari master
    │   ├── compounding-ingredient-table.tsx  # Tabel bahan terpilih, kuantitas, dosis, subtotal
    │   ├── compounding-fees-panel.tsx   # Input tuslah fee & embalase fee + kalkulasi total harga racikan
    │   └── compounding-cart-card.tsx    # Card representasi racikan di keranjang kasir (bisa di-edit / hapus)
    ├── prescription/
    │   ├── prescription-header-dialog.tsx # Modal input dokter & pasien (opsional, bisa dilewati)
    │   └── prescription-detail-view.tsx   # Tampilan detail resep di riwayat
    └── label/
        └── medicine-label-dialog.tsx    # Dialog cetak etiket obat (stiker klip plastik aturan pakai)
```

---

## 4. Rincian Fase Implementasi

### FASE 1: Store Lisensi Preset Apotek (`license-store.ts`)
* **Tujuan**: Mengaktifkan preset `pharmacy` secara otomatis ketika lisensi divalidasi.
* **Aksi**:
  1. Update `frontend/src/features/license/types/index.ts` dengan `business_type: "retail" | "confectionery" | "pharmacy"`.
  2. Tambahkan selector `isPharmacy(): boolean` di `license-store.ts`.
  3. Modifikasi sidebar navigasi: tampilkan menu "Resep & Racikan" (`/pharmacy/prescriptions` dan `/pharmacy/compounded`) jika preset apotek aktif.

### FASE 2: Master Katalog Apotek (Batch & Multi-Satuan)
* **Tujuan**: Apoteker dapat mengatur No Batch, Expired Date, dan Satuan Bertingkat (Box -> Strip -> Tablet).
* **Komponen**:
  1. Tombol aksi di `catalog/components/product-row-actions.tsx`:
     - "Kelola Batch": memanggil `BatchListDialog`.
     - "Multi-Satuan": memanggil `UnitConversionDialog`.
  2. `BatchBadge`: Memberi visual warna pada expired date obat di katalog dan stok opname.

### FASE 3: Modul Kasir Apotek & Racikan On-The-Fly (`src/features/checkout`)
* **Tujuan**: Kasir apotek memiliki UX peracikan obat yang cepat dan nyaman di kasir.
* **Integrasi Kasir**:
  1. **Tombol "+ Tambah Racikan"**:
     - Terletak di header kasir (`checkout-top-bar.tsx`).
     - Membuka `CompoundingModal`.
  2. **Form Racikan Cerdas (`CompoundingModal`)**:
     - Pilih bentuk sediaan: `Puyer`, `Kapsul`, `Salep`, `Sirup`.
     - Masukkan jumlah kemasan (misal 10 bungkus) dan aturan pakai (*"3x1 bungkus sesudah makan"*).
     - Pilih bahan-bahan obat: ketik nama obat, sistem menampilkan stok tersedia & harga. Masukkan jumlah tablet yang digerus.
     - Tuslah & Embalase terisi otomatis (default dari settings atau bisa diedit kasir).
     - Klik **"Masukkan ke Keranjang"**.
  3. **Tampilan di Keranjang (`CompoundingCartCard`)**:
     - Tampil sebagai 1 kesatuan item:  
       `[RACIKAN] Puyer Batuk Anak (10 bungkus)`  
       `Signa: 3x1 sesudah makan | Bahan: Paracetamol, CTM, Ambroxol`  
       `Harga: Rp 19.000`
  4. **Tombol "Resep Dokter (Opsional)"**:
     - Jika pasien membawa resep dokter, kasir klik tombol resep untuk melengkapi Nama Dokter, No SIP, dan Nama Pasien.
     - Jika pasien swamedikasi/OTC, kasir **tidak perlu** membuka modal ini.
  5. **Payload Checkout**:
     - Disematkan ke `checkout-api.ts` -> backend memotong stok bahan racikan secara FEFO.

### FASE 4: Cetak Struk Kasir & Etiket Obat
* **Tujuan**: Menghasilkan struk resmi apotek dan stiker etiket obat untuk pasien.
* **Fitur**:
  1. **Struk Kasir (Thermal 58mm / 80mm)**:
     - Mencetak nama dokter & pasien jika ada resep.
     - Mencetak baris racikan dan aturan pakai.
     - Rincian jasa tuslah & embalase tercantum transparan.
  2. **Cetak Etiket Obat (Thermal Label)**:
     - Cetak stiker label ukuran etiket (misal 50x30mm atau 70x40mm):
       - Nama Apotek
       - Tanggal & No Transaksi
       - Nama Pasien (jika diisi)
       - Nama Racikan / Obat
       - **Aturan Pakai Huruf Tebal** (contoh: **SEHARI 3 x 1 BUNGKUS SESUDAH MAKAN**)
       - Keterangan: Sebelum/Sesudah Makan, Pagi/Siang/Malam.

### FASE 5: Riwayat Resep & Racikan (`/pharmacy/prescriptions` & `/pharmacy/compounded`)
* **Tujuan**: Buku register apotek untuk pencatatan resep dokter dan riwayat racikan.
* **Fitur**:
  - Halaman daftar register resep dokter (filter tanggal, dokter, pasien).
  - Halaman riwayat racikan obat (melihat komposisi bahan obat yang pernah diracik).

---

## 5. Rencana Verifikasi & Standar Kualitas

1. **Type Checking & Linting**:
   ```bash
   bun x tsc --noEmit
   bun run lint
   ```
   Wajib 0 error TypeScript (zero `any`) dan 0 warning unused variables.
2. **Mobile Responsiveness**:
   - `CompoundingModal` responsif di layar mobile (<640px) dengan scroll internal dan tab bahan yang nyaman disentuh (`100dvh`).
   - Tombol touch-friendly min 40px tinggi.
3. **End-to-End Staging Test**:
   - Test checkout racikan OTC (tanpa resep dokter) ke `http://43.173.15.154:8085`.
   - Test checkout racikan dengan resep dokter lengkap.
   - Verifikasi pemotongan stok bahan dan batch di database PostgreSQL VPS.
