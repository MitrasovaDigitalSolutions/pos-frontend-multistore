# Panduan Integrasi Frontend: Master BOM, Satuan, Tipe Komponen & Produksi Harian

Dokumen ini berisi spesifikasi teknis dan panduan implementasi untuk developer frontend (Next.js App Router + TypeScript + Tailwind CSS + React Hook Form + React Query).

---

## 1. Daftar Endpoint Backend (OpenAPI Sesuai Branch `dev`)

Semua endpoint berikut sudah aktif dan teruji di backend commit `2aee1df`:

### A. Master Satuan (`/api/v1/units`)
* `GET /api/v1/units?all=true` $\rightarrow$ Mengambil semua satuan (`Pcs`, `Kg`, `Meter`, `Yard`, `Cone`, `Set`, `Lusin`, dll).
* `POST /api/v1/units` $\rightarrow$ `{ "nama": "Kilogram", "simbol": "Kg", "tipe": "berat", "deskripsi": "..." }`.
* `PUT /api/v1/units/{unit_uid}` & `DELETE /api/v1/units/{unit_uid}`.

### B. Master Tipe Komponen BOM (`/api/v1/bom-component-types`)
* `GET /api/v1/bom-component-types?all=true` $\rightarrow$ Mengambil tipe komponen (`kain_utama`, `rib`, `aksesoris_flat`, `hardware`, `bahan_dasar_fnb`, dll).
* `POST /api/v1/bom-component-types` $\rightarrow$ `{ "kode": "kain_utama", "nama": "Bahan Baku Utama", "is_main_driver": true }`.
* `PUT /api/v1/bom-component-types/{uid}` & `DELETE /api/v1/bom-component-types/{uid}`.

### C. Master BOM Produk (`/api/v1/products/{product_uid}/boms`)
* `GET /api/v1/products/{product_uid}/boms` $\rightarrow$ Mengambil daftar resep BOM produk.
* `POST /api/v1/products/{product_uid}/boms` $\rightarrow$ Simpan/Replace BOM:
  ```json
  {
    "boms": [
      {
        "material_product_uid": "uuid-kain-dongker",
        "component_type_uid": "uuid-tipe-kain-utama",
        "kuantitas_standar": 0.22,
        "tipe_komponen": "kain_utama",
        "toleransi_waste_pct": 3.0,
        "catatan": "Pola badan"
      }
    ]
  }
  ```
* `POST /api/v1/products/{product_uid}/boms/copy` $\rightarrow$ `{ "source_product_uid": "uuid-kaos-m", "ratio": 1.1 }`.
* `DELETE /api/v1/products/{product_uid}/boms/{bom_uid}`.

### D. Transaksi Produksi Harian (`/api/v1/productions`)
* `POST /api/v1/productions/calculate-bom` $\rightarrow$ Rekomendasi kebutuhan bahan dari target barang jadi:
  * **Request**: `{ "outputs": [{ "product_uid": "uuid-kaos-s", "kuantitas": 10 }, { "product_uid": "uuid-kaos-xl", "kuantitas": 10 }] }`
  * **Response**: `{ "data": { "materials": [{ "material_product_uid", "nama", "satuan", "total_kebutuhan", "stok_tersedia", "stok_cukup" }] } }`
* `POST /api/v1/productions/calculate-preview` $\rightarrow$ Live preview alokasi HPP.
* `POST /api/v1/productions` $\rightarrow$ Simpan produksi:
  ```json
  {
    "tanggal_mulai": "2026-09-09",
    "status": "completed",
    "catatan": "Batch 100 Kaos Dongker",
    "materials": [
      { "product_uid": "uuid-kain-dongker", "kuantitas": 20.0 },
      { "product_uid": "uuid-benang", "kuantitas": 1.0 }
    ],
    "additional_costs": [
      { "nama_biaya": "Ongkos Jahit Makloon", "nominal": 1000000 },
      { "nama_biaya": "Sablon Logo", "nominal": 200000 }
    ],
    "outputs": [
      { "product_uid": "uuid-kaos-s", "kuantitas": 50 },
      { "product_uid": "uuid-kaos-xl", "kuantitas": 50 }
    ]
  }
  ```

---

## 2. Rincian TypeScript Interface & Zod Schema

### A. Tipe Data (`features/production/types/index.ts`)
```typescript
export interface ProductionMaterial {
    uid: string;
    product_uid: string;
    kuantitas: number;
    harga_satuan: number;
    subtotal: number;
    product?: Product;
}

export interface ProductionAdditionalCost {
    uid?: string;
    nama_biaya: string;
    nominal: number;
}

export interface ProductionOutput {
    uid: string;
    product_uid: string;
    kuantitas: number;
    hpp_satuan: number;
    subtotal_hpp: number;
    update_harga_jual?: boolean;
    harga_jual_baru?: number | null;
    margin_baru?: number | null;
    product?: Product;
}
```

### B. Zod Schema Form Produksi (`features/production/schemas/production-schema.ts`)
```typescript
import { z } from "zod";

export const productionMaterialSchema = z.object({
    product_uid: z.string().min(1, "Bahan baku wajib dipilih"),
    kuantitas: z.coerce.number().positive("Kuantitas harus lebih dari 0"),
    harga_satuan: z.coerce.number().min(0).optional().nullable(),
});

export const productionAdditionalCostSchema = z.object({
    nama_biaya: z.string().min(1, "Nama biaya wajib diisi"),
    nominal: z.coerce.number().min(0, "Nominal tidak boleh negatif"),
});

export const productionOutputSchema = z.object({
    product_uid: z.string().min(1, "Barang jadi wajib dipilih"),
    kuantitas: z.coerce.number().positive("Kuantitas harus lebih dari 0"),
    hpp_satuan: z.coerce.number().min(0).optional().nullable(),
    update_harga_jual: z.boolean().optional().default(false),
    harga_jual_baru: z.coerce.number().min(0).optional().nullable(),
    margin_baru: z.coerce.number().min(0).optional().nullable(),
});

export const productionCreateSchema = z.object({
    tanggal_mulai: z.string().min(1, "Tanggal produksi wajib diisi"),
    tanggal_selesai: z.string().optional().nullable(),
    status: z.enum(["draft", "completed"]).default("draft"),
    catatan: z.string().optional().nullable(),
    materials: z.array(productionMaterialSchema).min(1, "Minimal 1 bahan baku harus dimasukkan"),
    additional_costs: z.array(productionAdditionalCostSchema).optional().default([]),
    outputs: z.array(productionOutputSchema).min(1, "Minimal 1 hasil barang jadi harus dimasukkan"),
});
```

---

## 3. Desain Komponen UI Frontend

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FORM PENCATATAN PRODUKSI (2-COLUMN SIDE-BY-SIDE)                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [KOLOM KIRI: BAHAN & BIAYA]                   [KOLOM KANAN: BARANG JADI]              │
│  ┌──────────────────────────────────────┐      ┌────────────────────────────────────┐  │
│  │ 1. Bahan Baku Terpakai               │      │ 1. Hasil Barang Jadi               │  │
│  │    [ Tombol: Auto-Hitung dari BOM ]  │      │    [Scan Barcode / Cari Produk]    │  │
│  │    • Kain 24s Dongker : [ 20.0 ] Kg  │      │    • Kaos Size S  : [ 50 ] Pcs     │  │
│  │    • Benang Jahit     : [ 1.0  ] Cone│      │    • Kaos Size XL : [ 50 ] Pcs     │  │
│  │                                      │      │                                    │  │
│  │ 2. Biaya Tambahan Langsung           │      │ (HPP otomatis terhitung adil)      │  │
│  │    [+ Tambah Biaya]                  │      │                                    │  │
│  │    • [ Ongkos Jahit Makloon ] : 1.0M │      │                                    │  │
│  │    • [ Sablon Logo Dada     ] : 200k │      │                                    │  │
│  └──────────────────────────────────────┘      └────────────────────────────────────┘  │
│                                                                                        │
│  ────────────────────────────────────────────────────────────────────────────────────  │
│  [STICKY BOTTOM SUMMARY BAR]                                                           │
│  • Total Biaya Bahan: Rp 2.020.000 │ Biaya Tambahan: Rp 1.200.000                      │
│  • Total Bersih: Rp 3.220.000 (100 Pcs) │ Status: [● Seimbang 100% (Selisih Rp 0)]     │
│  [ Tombol: Simpan Draft ]               │ [ Tombol: Selesaikan Produksi ]              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
