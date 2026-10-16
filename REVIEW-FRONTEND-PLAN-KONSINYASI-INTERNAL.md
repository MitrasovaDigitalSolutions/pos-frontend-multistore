# Review `frontend-plan.md`: Konsinyasi Internal & Setoran Cabang ke Pusat

Dokumen ini membandingkan [frontend-plan.md](./frontend-plan.md) dengan kode frontend saat ini.
Isinya: apa yang bentrok, apa yang kurang, solusinya, dan apa yang layak diterapkan.

> Status: hasil analisis saja. Belum ada kode yang diubah.

---

## 1. Kesimpulan Singkat

| Aspek | Penilaian |
| :--- | :--- |
| Konsep bisnis (titipan pusat, harga dikontrol pusat, komisi netto, setoran + verifikasi) | **Layak diterapkan** |
| Detail teknis (rute, sidebar, permission, kunci harga, akun bank pusat) | **Perlu diperbaiki**, ada yang bentrok dengan kode sekarang |
| Kelengkapan alur (void/refund, retur, selisih stok, batal/ajukan ulang, posisi titipan) | **Banyak yang belum tercakup** |
| Kepatuhan `AGENTS.md` (hooks, schemas, constants, mobile, anti god component) | **Belum dipenuhi di plan** |

---

## 2. Bagian A: Bentrok dengan Kode Saat Ini

Ini harus diselesaikan **sebelum** mulai coding.

### A1. Rute `/admin/sales/remittance` bentrok dengan modul Sales Supplier

**Masalah**
- Di [routes.ts](./src/constants/routes.ts), `ADMIN_SUPPLIER_SALES = "/admin/sales"`.
- Di [license-admin-guard.tsx](./src/features/license/components/license-admin-guard.tsx), prefix `/admin/sales` dipetakan ke add-on **`purchasing`**, bukan `multi_store`.
- Akibatnya halaman setoran akan terkunci oleh add-on yang salah.
- Menu "Sales" supplier juga ikut menyala (aktif), karena `isNavItemActive` memakai pencocokan prefix.

**Solusi**
- Pakai rute baru yang tidak berprefix `/admin/sales`:
  - `ADMIN_REMITTANCE: "/admin/remittance"`
  - `ADMIN_REMITTANCE_VERIFY: "/admin/remittance/verify"`
- Daftarkan keduanya di `ROUTE_ADDON_MAP` dengan add-on `multi_store`.

### A2. Struktur sidebar di plan tidak sesuai `NavItem`

**Masalah**
- Plan memakai `title`, `Path`, dan `is_central`.
- Di [sidebar-config.ts](./src/components/layout/sidebar-config.ts), `NavItem` memakai `label`, `path`, `permission` (fungsi), dan `addon`.
- `filterNavItems` hanya menyaring role, permission, dan add-on. **Tidak ada filter pusat/cabang.**

**Solusi**
- Tambah field baru di `NavItem`: `storeScope?: "central" | "branch"`.
- Tambah parameter `isCentral` pada `filterNavItems`.
- Menu "Setoran ke Pusat" → `storeScope: "branch"`. Menu "Verifikasi Setoran" → `storeScope: "central"`.

### A3. Akun bank pusat tidak bisa diambil lewat `GET /cash-accounts?store_uid=...`

**Masalah**
- [axios.ts](./src/shared/api/axios.ts) otomatis memasang header `X-Store-UID` = toko aktif.
- `useCashAccounts()` di [cash-api.ts](./src/features/cash/api/cash-api.ts) tidak menerima parameter.
- Hasilnya tetap akun kas **cabang**, bukan pusat.
- Kalau backend dibuat longgar agar bisa, cabang bisa membaca **semua** akun kas pusat (risiko keamanan).

**Solusi**
- Minta endpoint khusus, contoh: `GET /api/v1/store-remittances/destination-accounts`.
- Isinya hanya rekening bank pusat yang ditandai "boleh menerima setoran" (nama bank, nomor rekening, atas nama).

### A4. Permission tidak tepat

**Masalah**
- Plan memakai `manage_sales/view_sales` dan `manage_stores`.
- `manage_stores` berarti mengelola toko, bukan memverifikasi uang. Role yang punya izin itu bisa ikut menyetujui setoran.

**Solusi**
- Tambah permission baru di [roles.ts](./src/constants/roles.ts):
  - `view_remittances`
  - `create_remittances`
  - `verify_remittances`
- Backend wajib melarang **pengaju = pemverifikasi** (pemisahan tugas).

### A5. Kunci harga hanya di satu dialog dan hanya berdasar `!is_central`

**Masalah**
- Plan hanya menyebut "Dialog Edit Produk" dan kondisi `!currentStore.is_central`.
- Padahal harga bisa diubah di banyak tempat:

| Lokasi | Field yang bisa berubah |
| :--- | :--- |
| `product-form-dialog` + `use-product-form-dialog` | harga, harga beli, margin, harga grosir |
| `store-product-edit-dialog` | harga jual, harga beli, margin |
| `product-store-dialog` | harga jual per toko |
| `catalog-match-dialog` | harga jual saat cocokkan katalog |
| `product-import-export` | impor massal |
| Konsinyasi / Produksi / Penerimaan pembelian | `update_harga_jual` |

- Cabang juga boleh membuat produk sendiri (setting `branch_can_create_product`). Produk milik cabang tidak boleh ikut terkunci.

**Solusi**
- Kunci **per produk**, bukan per toko.
- Backend mengirim flag `is_price_locked` (atau `is_insourced`) pada `product_stores`.
- Yang dikunci: `harga_jual`, `harga_beli`, `margin`, harga grosir. Tampilkan badge "Harga dikontrol oleh Gudang Pusat".
- Pasang kunci di semua lokasi pada tabel di atas, bukan hanya satu dialog.

### A6. Perubahan form transfer terlalu ringan di plan

**Masalah**
- Plan hanya menulis "tambah dropdown tipe transfer + kolom harga".
- Padahal belum ada `tipe_transfer`, `harga_pasok`, atau `harga_jual` di tipe, schema, maupun form transfer.

**Dampak yang harus ikut diubah** (modul [stock-transfer](./src/features/stock-transfer)):
- `transfer-schema.ts` dan `types/index.ts`.
- `TransferItem` dan `handleSubmit` di `transfer-create-page.tsx`.
- Tabel desktop **dan** kartu mobile di `transfer-items-section.tsx`.
- Ringkasan nilai titipan di `transfer-summary-card.tsx`.
- Badge tipe di daftar transfer, detail transfer, dan surat jalan cetak.
- Mock tutorial transfer (`transfer-tutorial-constants.ts`), karena halaman create memuat logika mode panduan.

---

## 3. Bagian B: Kekurangan Alur Bisnis di Plan

| # | Kekurangan | Risiko jika dibiarkan | Solusi yang disarankan |
| :--- | :--- | :--- | :--- |
| B1 | Sumber `harga_pasok` tidak dijelaskan | Angka setoran tidak konsisten | Default dari master (mis. `harga_beli_avg` pusat), bisa diedit pusat saat buat transfer, wajib `harga_pasok ≤ harga_jual`, tampilkan preview komisi per item |
| B2 | Void / refund setelah masuk setoran | Total setoran salah | Item di setoran `pending` dikunci dari void; refund setelah terverifikasi menjadi koreksi (kredit) di setoran berikutnya. Cek di `void-transaction-dialog.tsx` |
| B3 | Setoran parsial / angka basi | Nominal tidak cocok dengan transaksi | Kirim `cutoff_at` + `expected_net_payable`; backend balas 409 jika berubah. Alternatif: pilih transaksi via checkbox |
| B4 | Tidak ada batal pengajuan / ajukan ulang | Item nyangkut setelah ditolak | Tambah aksi "Batalkan" dan "Ajukan Ulang"; item kembali ke "belum disetor" saat ditolak |
| B5 | Stat "Wajib Setor" tidak memperhitungkan setoran pending | Dobel hitung | Tambah kartu ke-4: **Menunggu Verifikasi**; "Wajib Setor" = belum diajukan |
| B6 | Tidak ada posisi titipan per produk | Pusat tidak tahu eksposur titipan | Tab **Posisi Titipan**: dikirim, terjual, diretur, sisa, nilai sisa (sisa × harga pasok). Konsinyasi eksternal sudah punya `qty_terjual/qty_diretur/sisa_titipan` di [consignment/types](./src/features/consignment/types/index.ts) |
| B7 | Retur barang titipan & selisih stok (rusak/hilang) | Tidak jelas siapa yang menanggung | Aturan: rusak/hilang wajib dilunasi di harga pasok, atau butuh persetujuan write-off pusat. Terkait juga fitur Adjustment Qty di `PLAN-LICENSE-ADDONS-GATING.md` |
| B8 | Toko HQ bisa berpindah | Setoran jalan salah alamat | Toggle `is_central` di [store-form-dialog.tsx](./src/features/stores/components/store-form-dialog.tsx) memindahkan HQ. Simpan snapshot `store_uid_destination` di setoran; blokir pemindahan HQ selama ada titipan/setoran pending |
| B9 | Aturan "Latest Price" tanpa UI pemberitahuan | Cabang tidak sadar harga berubah | Di dialog terima transfer, tampilkan tabel harga lama → baru (pola [consignment-price-alert-dialog](./src/features/consignment/components/create/consignment-price-alert-dialog.tsx)); tawarkan cetak ulang label. Backend simpan snapshot `harga_pasok` per item penjualan agar transaksi lama tidak berubah |
| B10 | Diskon member | Komisi bisa negatif | Tetapkan aturan: diskon ditanggung cabang, setoran tetap di harga pasok |
| B11 | Notifikasi & integrasi | Setoran pending tidak terpantau | Pakai `badge`/`badgeVariant` yang sudah ada di `NavItem` untuk jumlah pending (dengan `refetchInterval`); tambah relasi `store_remittance_uid` di `CashLedger` dan jurnal akuntansi; filter cabang di tabel verifikasi pusat |
| B12 | Verifikasi dengan nominal berbeda | Selisih tidak tercatat | Dialog verifikasi menampilkan selisih + catatan, bukan hanya Terima/Tolak |

---

## 4. Bagian C: Kepatuhan `AGENTS.md`

- **Anti god component.** `remittance-dashboard.tsx` terlalu besar. Pecah menjadi:
  - `remittance-stat-cards`
  - `unsettled-transactions-table`
  - `remittance-history-table`
  - `create-remittance-dialog`
  - hook `use-create-remittance`
- **Struktur folder lengkap** di `src/features/remittance/`: `api/`, `components/`, `hooks/`, `schemas/`, `types/`, `constants/`.
- **Schema Zod** untuk upload: ukuran ≤ 2MB, tipe PNG/JPG/PDF.
- **Constants**: status (`pending/verified/rejected`), label, dan warna badge (kuning/hijau/merah).
- **Types** perlu dilengkapi: item setoran, `verified_at`, `verified_by`, objek toko asal.
- **API**: pisahkan endpoint `unsettled/summary` dari `unsettled/items` (berpaginasi).
- **Mobile-first**: tabel butuh tampilan kartu di mobile, `overflow-x-auto`, tombol minimal 36–44px, `pb-28 sm:pb-8`.
- **DRY**: logika `is_central` sudah terduplikasi di `product-table`, `transfer-create-page`, `catalog-match-dialog`. Buat satu hook `useActiveStore()` / `useIsCentralStore()`.

---

## 5. Bagian D: Rekomendasi Final

### Yang dipakai apa adanya
- Konsep bisnis dan alur bisnis utamanya.
- Dua halaman: sisi cabang (setor) dan sisi pusat (verifikasi).
- Upload bukti transfer, verifikasi, tolak dengan alasan, kartu statistik.

### Yang diubah
| Item | Plan awal | Usulan |
| :--- | :--- | :--- |
| Rute | `/admin/sales/remittance*` | `/admin/remittance*` |
| Letak menu | Transaksi → Penjualan | Grup **Keuangan** (menyangkut uang; rute tidak bentrok) |
| Kunci harga | `!is_central` | Flag per produk `is_price_locked` |
| Akun bank tujuan | `GET /cash-accounts?store_uid=` | Endpoint khusus `destination-accounts` |
| Permission | `manage_sales`, `manage_stores` | `view/create/verify_remittances` |

### Yang ditambahkan
B1–B12 di atas, terutama: posisi titipan, batal/ajukan ulang, penanganan void/refund, dan notifikasi badge.

### Urutan pengerjaan yang aman
1. **Fondasi**: routes, `ROUTE_ADDON_MAP`, permission, `storeScope` sidebar, hook konteks toko.
2. **Transfer konsinyasi internal**: tipe transfer, kolom harga, badge, surat jalan, tutorial mock.
3. **Kunci harga per produk** di semua dialog.
4. **Setoran sisi cabang**: dashboard, unsettled, riwayat, dialog setor.
5. **Verifikasi sisi pusat**: tabel, preview bukti, terima/tolak.
6. **Posisi titipan, retur, dan laporan.**

---

## 6. Pertanyaan yang Perlu Diputuskan

1. Apakah **retur barang titipan** dan **selisih stok** masuk versi pertama, atau ditunda?
2. **Setoran parsial** diizinkan, atau semua transaksi sampai waktu tertentu disetor sekaligus?
3. Apakah backend sudah (atau akan) menyediakan:
   - flag `is_price_locked` pada produk,
   - endpoint rekening tujuan setoran,
   - permission baru `view/create/verify_remittances`?
4. Siapa yang menanggung **diskon member** dan **barang rusak/hilang** pada barang titipan?
5. Apakah menu setoran sebaiknya di grup **Keuangan** (usulan) atau tetap di **Penjualan**?

---

## 7. Langkah Berikutnya

Setelah poin di bagian 6 diputuskan, ada dua pilihan:
- Merevisi `frontend-plan.md` agar memuat semua perbaikan di atas, atau
- Langsung mulai implementasi dari langkah 1 (fondasi).
