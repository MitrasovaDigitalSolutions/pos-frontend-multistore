# Rencana Implementasi Frontend: Kebijakan Cabang (Branch Store Policies)

Dokumen ini adalah panduan teknis lengkap bagi tim frontend untuk mengimplementasikan dan menegakkan konfigurasi **10 Kebijakan Toko Cabang (Branch Store Policies)** pada aplikasi POS Multistore.

---

## 1. Ringkasan & Latar Belakang Backend

Backend telah selesai mengimplementasikan dan memverifikasi (100% test passed) 10 kebijakan kontrol cabang melalui tabel `app_settings` (setting global `store_uid = null`). Semua endpoint backend menerapkan pengamanan ketat: jika toko yang aktif adalah toko cabang (`!store.is_central`), backend akan memeriksa apakah aksi tersebut diizinkan. Jika melanggar, backend merespons dengan **HTTP 403 Forbidden** atau **HTTP 422 Unprocessable Content**.

### Daftar 10 Kebijakan Cabang:
| No | Key Setting | Tipe | Default | Deskripsi Ringkas |
|---|---|---|---|---|
| 1 | `branch_can_create_product` | boolean | `false` | Izinkan cabang membuat master produk baru |
| 2 | `branch_can_edit_product_price` | boolean | `false` | Izinkan cabang mengubah harga jual/beli produk |
| 3 | `branch_can_edit_master_data` | boolean | `true` | Izinkan cabang mengubah nama, barcode, satuan produk |
| 4 | `branch_can_manual_stock_adjustment` | boolean | `false` | Izinkan cabang melakukan penyesuaian stok manual bebas |
| 5 | `branch_can_stock_opname` | boolean | `true` | Izinkan cabang membuka sesi stok opname mandiri |
| 6 | `branch_opname_requires_approval` | boolean | `true` | Hasil selisih opname cabang wajib disetujui pusat sebelum stok ter-adjust |
| 7 | `branch_can_direct_purchase` | boolean | `false` | Izinkan cabang membuat PO / penerimaan langsung ke supplier luar |
| 8 | `branch_can_transfer_to_other_branch` | boolean | `true` | Izinkan transfer stok langsung antar-cabang tanpa via pusat |
| 9 | `branch_can_apply_manual_discount` | boolean | `false` | Izinkan kasir cabang memberi diskon manual saat checkout |
| 10 | `branch_can_edit_price_at_checkout` | boolean | `false` | Izinkan kasir cabang mengubah harga satuan barang saat checkout |

---

## 2. Struktur Modul & Standar Kode Frontend

Sesuai dengan `frontend/AGENTS.md`:
- Package manager & runner: **`bun`** (`bun dev`, `bun run build`, `bun x tsc --noEmit`).
- Arsitektur berbasis fitur (Feature-Driven).
- Anti-God Component: Pisahkan UI besar menjadi sub-komponen terisolasi & hook logika.
- Mobile-First & Responsif: Pastikan `h-[100dvh]`, tombol minimal 36-44px, scroll clearance `pb-28 sm:pb-8`.
- Strict TypeScript: Dilarang menggunakan `any`.

---

## 3. Tahapan Eksekusi Frontend

```
┌────────────────────────────────────────────────────────┐
│ TAHAP 1: Pengaturan Global & UI Tab Kebijakan Cabang   │
│ - Update Zod schema settings                           │
│ - Buat tab-branch-policy.tsx                           │
│ - Daftarkan tab di store-profile.tsx                   │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ TAHAP 2: Shared Hook / Helper Kebijakan                │
│ - useBranchPolicy(key) & useBranchPolicies()           │
│ - Fallback otomatis jika toko aktif adalah Pusat (HQ)  │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ TAHAP 3: Proteksi & UX Guard di Seluruh Modul Cabang   │
│ - Modul Master Produk (Create, Price, Master data)     │
│ - Modul Inventori (Penyesuaian Manual, Stok Opname)   │
│ - Modul Pembelian (PO & Penerimaan Barang)             │
│ - Modul Transfer Stok Antar-Cabang                     │
│ - Modul Kasir / Checkout (Diskon & Override Harga)     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ TAHAP 4: Verifikasi & Build Testing                    │
│ - Type-check: bun x tsc --noEmit                       │
│ - Linting & visual check responsive                    │
└────────────────────────────────────────────────────────┘
```

---

## 4. Rincian Teknis Implementasi

### 4.1. Tahap 1: Schema & Tab Pengaturan ("Kebijakan Cabang")

#### A. Update Schema: `frontend/src/features/settings/schemas/settings-schema.ts`
Tambahkan 10 key kebijakan ke dalam `storeSettingsSchema`:
```typescript
// Tambahkan 10 kebijakan cabang:
branch_can_create_product: z.string().optional().default("false"),
branch_can_edit_product_price: z.string().optional().default("false"),
branch_can_edit_master_data: z.string().optional().default("true"),
branch_can_manual_stock_adjustment: z.string().optional().default("false"),
branch_can_stock_opname: z.string().optional().default("true"),
branch_opname_requires_approval: z.string().optional().default("true"),
branch_can_direct_purchase: z.string().optional().default("false"),
branch_can_transfer_to_other_branch: z.string().optional().default("true"),
branch_can_apply_manual_discount: z.string().optional().default("false"),
branch_can_edit_price_at_checkout: z.string().optional().default("false"),
```

#### B. Buat Komponen Baru: `frontend/src/features/settings/components/tab-branch-policy.tsx`
Kelompokkan toggle switch dengan kartu yang bersih, rapi, dan memiliki deskripsi penjelasan:
1. **Kelompok 1: Katalog & Master Data**
   - Pembuatan Master Produk Baru (`branch_can_create_product`)
   - Ubah Harga Jual / Beli di Cabang (`branch_can_edit_product_price`)
   - Ubah Data Master (Nama, Barcode, Satuan) (`branch_can_edit_master_data`)
2. **Kelompok 2: Stok & Inventori**
   - Penyesuaian Stok Manual Bebas (`branch_can_manual_stock_adjustment`)
   - Pelaksanaan Stok Opname Mandiri (`branch_can_stock_opname`)
   - Wajib Persetujuan Pusat untuk Finalisasi Opname (`branch_opname_requires_approval`)
3. **Kelompok 3: Pengadaan & Transfer**
   - Pembelian Langsung ke Supplier Luar (`branch_can_direct_purchase`)
   - Transfer Stok Langsung Antar-Cabang (`branch_can_transfer_to_other_branch`)
4. **Kelompok 4: Kasir & Checkout**
   - Diskon Manual Kasir saat Transaksi (`branch_can_apply_manual_discount`)
   - Ubah Harga Satuan saat Checkout (`branch_can_edit_price_at_checkout`)

*Catatan UX*: Karena setting ini hanya berlaku untuk mengatur cabang, tab ini hanya boleh diakses oleh pengguna dengan role **Admin** dan saat berada dalam konteks **Toko Pusat (HQ)**.

#### C. Integrasikan ke `store-profile.tsx`:
- Tambahkan tab `branch_policy` ke dalam daftar `allTabs`:
  ```typescript
  {
      id: "branch_policy",
      label: "Kebijakan Cabang",
      description: "Aturan wewenang operasional toko cabang",
      icon: ShieldCheck, // atau Building2
      fields: [
          "branch_can_create_product",
          "branch_can_edit_product_price",
          "branch_can_edit_master_data",
          "branch_can_manual_stock_adjustment",
          "branch_can_stock_opname",
          "branch_opname_requires_approval",
          "branch_can_direct_purchase",
          "branch_can_transfer_to_other_branch",
          "branch_can_apply_manual_discount",
          "branch_can_edit_price_at_checkout",
      ] as const,
      adminOnly: true,
  }
  ```
- Render `<TabBranchPolicy isSaving={isSaving} />` pada area konten tab.
- Pastikan inisialisasi default terisi pada `methods.reset({...})`.

---

### 4.2. Tahap 2: Reusable Hook `useBranchPolicy`

Buat hook di `frontend/src/hooks/use-branch-policy.ts`:
```typescript
"use client";

import { useActiveStore } from "@/hooks/use-active-store";
import { useSettingsStore } from "@/stores/settings-store";

export type BranchPolicyKey =
    | "branch_can_create_product"
    | "branch_can_edit_product_price"
    | "branch_can_edit_master_data"
    | "branch_can_manual_stock_adjustment"
    | "branch_can_stock_opname"
    | "branch_opname_requires_approval"
    | "branch_can_direct_purchase"
    | "branch_can_transfer_to_other_branch"
    | "branch_can_apply_manual_discount"
    | "branch_can_edit_price_at_checkout";

export function useBranchPolicy(key: BranchPolicyKey, defaultValue = false): boolean {
    const { isCentralStore } = useActiveStore();
    const settings = useSettingsStore((s) => s.settings);

    // Toko Pusat SELALU diizinkan melakukan semua aksi
    if (isCentralStore) {
        return true;
    }

    const val = settings[key];
    if (val === undefined || val === null) {
        return defaultValue;
    }

    return val === "true" || val === true;
}
```

---

### 4.3. Tahap 3: Penegakan di Halaman & Komponen (Defense-in-Depth UI)

#### 1. Katalog & Master Produk (`src/features/master/products` / `src/features/catalog`)
- **`branch_can_create_product`**:
  - Pada halaman tabel produk (`product-table.tsx` / header toolbar), sembunyikan atau disabled tombol **"Tambah Produk"** dan tombol **"Import Produk"** jika `!canCreateProduct`.
  - Berikan Tooltip: *"Pembuatan produk baru di toko cabang dinonaktifkan oleh Pusat."*
- **`branch_can_edit_product_price`**:
  - Pada modal/halaman edit produk (`product-form-dialog.tsx` / store price tab):
  - Jika `!canEditPrice`, kunci (`disabled={true}`) input: Harga Beli, Harga Jual, Harga Grosir, Min Qty Grosir, Margin.
  - Tampilkan icon gembok (`Lock` icon) dan pesan pembatas di atas form harga.
- **`branch_can_edit_master_data`**:
  - Jika `!canEditMasterData`, kunci input data identitas: Nama Produk, Barcode, Satuan/Unit, Kategori, Brand, Image.

#### 2. Penyesuaian Stok Manual (`src/features/inventory/adjustment`)
- **`branch_can_manual_stock_adjustment`**:
  - Pada dialog / form penyesuaian stok manual:
  - Jika `!canManualAdjustment`, sembunyikan tombol "Buat Penyesuaian" atau disabled tombol submit dengan alert banner:
    *"Penyesuaian stok manual di toko cabang tidak diizinkan. Silakan ajukan melalui Stok Opname atau Mutasi Stok Pusat."*

#### 3. Stok Opname (`src/features/inventory/opname` atau `src/features/stock-opname`)
- **`branch_can_stock_opname`**:
  - Sembunyikan atau disabled tombol **"Mulai Opname Baru"** jika `!canStockOpname`.
- **`branch_opname_requires_approval`**:
  - Pada halaman detail hasil opname cabang:
  - Jika `requiresApproval === true`:
    - Tombol **"Finalisasi Opname"** diubah teksnya menjadi **"Ajukan Persetujuan Pusat"** atau disabled untuk staf cabang dengan badge informasi: *"Menunggu Approval Gudang Pusat"*.
    - Tombol finalisasi sebenarnya hanya muncul jika diakses oleh akun Pusat / Supervisor Pusat.

#### 4. Pengadaan PO & Penerimaan Barang (`src/features/purchase`)
- **`branch_can_direct_purchase`**:
  - Pada menu Pemesanan Barang (PO): sembunyikan / disabled tombol **"Buat Pesanan Baru"** jika `!canDirectPurchase`.
  - Pada Penerimaan Barang: kunci pembuatan penerimaan barang langsung tanpa PO pusat jika kebijakan ini false.

#### 5. Mutasi / Transfer Stok (`src/features/stock-transfer`)
- **`branch_can_transfer_to_other_branch`**:
  - Pada form pembuatan transfer stok (`transfer-create-page.tsx`):
  - Pada pilihan dropdown **"Toko Tujuan"**:
    - Jika `!canTransferToOtherBranch`: filter daftar pilihan toko agar **hanya menampilkan Gudang Pusat (`is_central === true`)**.
    - Opsi toko cabang lainnya dihilangkan atau diberi status `disabled` dengan keterangan: *"Transfer langsung antar-cabang dikunci oleh kebijakan pusat."*

#### 6. Kasir & Checkout (`src/features/checkout` / POS Cashier)
- **`branch_can_apply_manual_discount`**:
  - Pada panel pembayaran kasir (cart summary / discount modal):
  - Jika `!canApplyDiscount`: sembunyikan atau disabled input diskon transaksi (Rp / %).
  - Jika kasir menekan tombol diskon, tampilkan tooltip/toast: *"Pemberian diskon manual di kasir cabang dinonaktifkan."*
- **`branch_can_edit_price_at_checkout`**:
  - Pada baris item keranjang belanja kasir:
  - Harga item hanya boleh diklik/diedit jika produk adalah `is_jasa` **ATAU** `canEditPriceAtCheckout === true`.
  - Jika `!canEditPriceAtCheckout`, kursor tetap biasa (bukan pointer edit) dan input harga satuan terkunci.

---

### 4.4. Tahap 4: Handling Error Global (Toast Notifikasi)

Ketika pengguna cabang mencoba melakukan aksi terlarang melalui manipulasi inspect element / API call langsung:
- Backend akan mengembalikan response `403 Forbidden` dengan pesan Indonesia yang spesifik (misal: `"Perubahan harga produk di toko cabang tidak diizinkan."`).
- Pastikan Axios / Fetch interceptor di `src/shared/api/api-client.ts` menangkap pesan `error.response?.data?.message` dan menampilkannya melalui Toast merah (`toast.error(message)`).

---

## 5. Checklist Verifikasi Tim Frontend

- [ ] `settings-schema.ts` telah memuat 10 field kebijakan baru.
- [ ] Tab **Kebijakan Cabang** tampil di `/settings` (hanya untuk Admin di Toko Pusat).
- [ ] Toggle switch pada tab Kebijakan Cabang tersimpan dengan benar ke database saat tombol Simpan ditekan (`floating-save-bar.tsx`).
- [ ] Hook `useBranchPolicy(key)` bekerja reaktif dan selalu bernilai `true` saat aktif di Toko Pusat.
- [ ] UI Form Produk di cabang terkunci sesuai toggle `can_edit_product_price` dan `can_edit_master_data`.
- [ ] Dropdown tujuan transfer stok di cabang hanya menampilkan Pusat jika `branch_can_transfer_to_other_branch = false`.
- [ ] Input diskon manual di kasir terkunci saat `branch_can_apply_manual_discount = false`.
- [ ] Input harga di kasir terkunci saat `branch_can_edit_price_at_checkout = false`.
- [ ] Menjalankan pemeriksaan TypeScript: `bun x tsc --noEmit` (harus 0 errors).
- [ ] Menjalankan linter: `bun run lint` (harus 0 warnings/errors).
- [ ] Tampilan responsif pada ukuran Mobile (<640px) dan Tablet (iPad).
