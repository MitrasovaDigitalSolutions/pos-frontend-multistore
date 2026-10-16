# PANDUAN IMPLEMENTASI FRONTEND: KONSINYASI INTERNAL & SETORAN CABANG KE PUSAT

Dokumen ini adalah spesifikasi teknis untuk implementasi frontend modul **Konsinyasi Internal (Insource)** dan **Setoran Cabang ke Pusat (Store Remittance)**.

---

## 1. Ringkasan Bisnis & Standar Penamaan Harga (Pusat vs Cabang)

Agar tidak membingungkan kasir, admin, dan developer, sistem menggunakan 4 tingkatan harga standar:

1. **Harga Beli Pusat**: Modal kulakan / HPP pusat saat membeli dari pabrik/vendor/konveksi.
2. **Harga Jual Pusat**: Harga patokan saat pusat mendistribusikan/menjual barang ke toko cabang.
3. **Harga Beli Cabang**: Nilai beli bagi cabang (**Harga Beli Cabang = Harga Jual Pusat**). Ini adalah nilai pokok konsinyasi yang wajib disetor cabang ke pusat saat barang laku.
4. **Harga Jual Cabang**: Harga banderol / stiker yang dibayar oleh konsumen di kasir toko cabang.

### Rumus & Hubungan Harga:
$$\text{Harga Beli Pusat} \le \mathbf{Harga\ Jual\ Pusat\ (=\ Harga\ Beli\ Cabang)} \le \mathbf{Harga\ Jual\ Cabang}$$

- **Keuntungan / Margin Pusat**: $\text{Harga Jual Pusat} - \text{Harga Beli Pusat}$
- **Keuntungan / Margin Cabang**: $\text{Harga Jual Cabang} - \text{Harga Beli Cabang}$

### Perilaku Sistem:
1. **Model Bisnis**: Toko Cabang disuplai barang jadi dari Gudang Pusat dengan status titipan (*off-book*).
2. **Kontrol Harga**: Harga Jual Cabang dan Harga Beli Cabang ditentukan 100% oleh Pusat saat transfer stok. Cabang dilarang mengedit harga.
3. **Latest Price**: Setiap kali ada penerimaan transfer baru di cabang, Harga Beli Cabang dan Harga Jual Cabang otomatis diperbarui mengikuti data transfer terbaru.
4. **Hak Toko (Laba Cabang)**: Toko berhak atas margin (`Harga Jual Cabang - Harga Beli Cabang`). Saat setor ke pusat, laba cabang langsung ditahan di toko (*skema netto*).
5. **Setoran**: Cabang mentransfer nilai total **Harga Beli Cabang** (nilai wajib setor) ke bank pusat, lalu mengunggah bukti transfer via menu **Setoran ke Pusat**. Admin pusat melakukan verifikasi.

---

## 2. Navigasi & Routing

### A. Rute Baru yang Dibuat
Tambahkan konstanta rute di `src/constants/routes.ts`:
```typescript
export const ROUTES = {
  // ...
  ADMIN_REMITTANCE: '/admin/sales/remittance',
  ADMIN_REMITTANCE_VERIFY: '/admin/sales/remittance/verify',
};
```

### B. Konfigurasi Sidebar (`src/components/layout/sidebar-config.ts`)
Di bawah grup **Transaksi -> Penjualan**:
- **Menu untuk Toko Cabang (`is_central = false`)**:
  - Title: `Setoran ke Pusat`
  - Path: `/admin/sales/remittance`
  - Icon: `Banknote` atau `ArrowUpRight`
  - Permission: `view_remittances` / `create_remittances`
- **Menu untuk Gudang Pusat (`is_central = true`)**:
  - Title: `Verifikasi Setoran Cabang`
  - Path: `/admin/sales/remittance/verify`
  - Icon: `CheckCircle2` atau `ShieldCheck`
  - Permission: `verify_remittances`

---

## 3. Modifikasi Fitur Eksisting

### A. Form Transfer Stok Keluar (`/admin/inventory/stock-transfer/create`)
- Tambahkan dropdown pilihan **Tipe Transfer**:
  - Pilihan: `Regular` (default) | `Konsinyasi Internal` (Titipan Pusat).
- Jika toko pengirim adalah Pusat (`is_central = true`) dan tujuan adalah Cabang, default ke `Konsinyasi Internal`.
- **Input & Perhitungan Otomatis Komisi Cabang**:
  - Di setiap baris item transfer konsinyasi internal, admin **TIDAK PERLU** menghitung 2 harga secara manual.
  - Cukup sediakan:
    - **Tipe Komisi**: Pilihan `%` (persentase) atau `Rp` (nominal flat), default `%`.
    - **Nilai Komisi**: Input angka, **default `0`**.
  - Kolom tabel menampilkan preview otomatis (real-time kalkulasi):
    - **Harga Dasar Pusat**: Harga jual master produk dari pusat (misal: Rp 100.000).
    - **Komisi Cabang**: Input tipe (`%`/`Rp`) & nilai (default 0).
    - **Harga Jual Cabang (Banderol Konsumen)**: Otomatis dihitung.
    - **Harga Beli Cabang (Wajib Setor ke Pusat)**: Otomatis dihitung.
  - **Formula Kalkulasi Otomatis (Mengikuti Pengaturan Global `consignment_commission_mode`)**:
    - **Mode `cut_revenue` (Potong Pendapatan / Banderol Sama)**:
      - `Harga Jual Cabang` = `Harga Dasar Pusat` (misal Rp 100.000).
      - `Harga Beli Cabang` = `Harga Dasar Pusat - Komisi` (misal Rp 90.000 jika komisi 10%).
    - **Mode `markup_price` (Naikkan Harga Banderol)**:
      - `Harga Jual Cabang` = `Harga Dasar Pusat + Komisi` (misal Rp 110.000 jika komisi 10%).
      - `Harga Beli Cabang` = `Harga Dasar Pusat` (misal Rp 100.000).
    - Jika komisi = `0`: maka `Harga Jual Cabang = Harga Beli Cabang = Harga Dasar Pusat`.
  - **Payload yang dikirim ke API**:
    - `tipe_komisi`: `'percentage'` atau `'fixed'`
    - `nilai_komisi`: number (default 0)
    - *(Opsional jika ada override manual: `harga_beli_cabang`, `harga_jual_cabang`)*.

### B. Proteksi Edit Harga di Toko Cabang (`/admin/products` & Dialog Edit Produk)
- Cek store context saat ini: jika `!currentStore.is_central`:
  - Input field `harga_jual` di-disable (read-only).
  - Tampilkan badge informasi: `"Harga dikontrol oleh Gudang Pusat"`.

---

## 4. Halaman Baru: Cabang - Setoran ke Pusat (`/admin/sales/remittance`)

### Komponen Halaman: `src/features/remittance/components/remittance-dashboard.tsx`

#### 1. Header Ringkasan Statistik (3 Stat Cards):
- **Omzet Belum Disetor**: Total harga jual konsumen dari transaksi laku yang belum disetor (`unsettled_gross_sales`).
- **Laba / Komisi Cabang**: Total hak keuntungan cabang yang langsung ditahan di toko (`unsettled_commission`).
- **Wajib Setor ke Pusat (Harga Beli Cabang)**: Nilai total yang harus ditransfer ke rekening pusat (`unsettled_net_payable`).
- **Tombol Utama**: `[ + Buat Setoran ke Pusat ]` (Hanya aktif jika `unsettled_net_payable > 0`).

#### 2. Tab 1: Transaksi Belum Disetor (`Unsettled Transactions`)
- Tabel daftar penjualan barang titipan yang belum disetor:
  - Kolom: No. Struk, Tanggal/Jam, Kasir, Barcode & Nama Produk, Qty, Harga Jual Cabang, Harga Beli Cabang, Laba Cabang, Wajib Setor.
  - Filter: Rentang Tanggal / Shift Kasir.

#### 3. Tab 2: Riwayat Setoran (`Remittance History`)
- Tabel riwayat setoran yang pernah diajukan:
  - Kolom: No. Setoran (`STR-YYYYMMDD-XXXX`), Tanggal Pengajuan, Akun Kas Asal, Rekening Bank Tujuan, Nominal Setor, Status Badge (`Menunggu Verifikasi`, `Diverifikasi`, `Ditolak`), Aksi (Detail / Bukti).

#### 4. Dialog Form: `CreateRemittanceDialog`
- **Input Field**:
  - **Nominal Setor**: Auto-fill nilai `unsettled_net_payable` (read-only atau editable jika diizinkan partial).
  - **Dari Akun Kas Cabang**: Dropdown akun kas toko (`cash_accounts` cabang, opsional - default otomatis ke **Kas Utama** cabang).
  - **Ke Rekening Bank/Kas Pusat**: Dropdown akun bank/kas milik Pusat (opsional - default otomatis ke **Kas Utama** pusat).
  - **Upload Bukti Transfer**: File input opsional (PNG/JPG/PDF, max 5MB).
  - **Catatan / No. Referensi Transfer**: Text input opsional.
- Tombol: `Kirim Setoran`.

---

## 5. Halaman Baru: Pusat - Verifikasi Setoran (`/admin/sales/remittance/verify`)

### Komponen Halaman: `src/features/remittance/components/remittance-verify-dashboard.tsx`
- **Tabel Daftar Setoran Masuk dari Cabang**:
  - Kolom: No. Setoran, Cabang Asal, Tanggal Kirim, Nominal Setor, Bank Tujuan, Bukti Transfer (Thumbnail preview modal), Status.
  - Tombol Aksi per Baris:
    - `[ Verifikasi / Terima ]`: Membuka konfirmasi verifikasi. Saat approve, dana resmi masuk ke kas bank pusat.
    - `[ Tolak ]`: Membuka modal input alasan penolakan (misal: "Dana belum masuk mutasi bank").

---

## 6. TypeScript Types & API Endpoints

### Types (`src/features/remittance/types/index.ts`)
```typescript
export interface UnsettledSummary {
  unsettled_gross_sales: number;
  unsettled_commission: number;
  unsettled_net_payable: number;
  total_items_count: number;
}

export interface StoreRemittance {
  uid: string;
  nomor_setoran: string;
  store_uid_source: string;
  store_source_nama?: string;
  store_uid_destination: string;
  total_omzet_kotor: number;
  total_fee_cabang: number;
  nominal_disetor: number;
  cash_account_source_uid: string;
  cash_account_dest_uid: string;
  cash_account_dest_nama?: string;
  bukti_transfer_url?: string;
  status: 'pending' | 'verified' | 'rejected';
  catatan?: string;
  alasan_penolakan?: string;
  user_submit_nama?: string;
  created_at: string;
}

export interface CreateRemittancePayload {
  cash_account_source_uid?: string;
  cash_account_dest_uid?: string;
  nominal_disetor?: number;
  bukti_transfer?: File;
  catatan?: string;
}
```

### Endpoints API yang Dikonsumsi
1. `GET /api/v1/store-remittances/unsettled`: Ringkasan statistik & daftar item belum disetor.
2. `GET /api/v1/store-remittances`: List riwayat setoran (filter: `status`, `store_uid`, `start_date`, `end_date`).
3. `POST /api/v1/store-remittances`: Multipart form submit setoran baru.
4. `POST /api/v1/store-remittances/{uid}/verify`: Approval setoran oleh admin pusat.
5. `POST /api/v1/store-remittances/{uid}/reject`: Penolakan setoran dengan payload `{ alasan: string }`.
6. `GET /api/v1/cash-accounts?store_uid={central_store_uid}`: Menarik daftar rekening bank tujuan milik pusat.

---

## 7. Guardrail Multi-Toko & Lisensi
- **License Add-on Guard (`multi_store`)**:
  - Item menu sidebar Setoran Toko & Verifikasi Setoran wajib memiliki property `addon: "multi_store"` di `sidebar-config.ts`.
  - Halaman dan API otomatis terkunci jika lisensi toko tidak memiliki add-on `multi_store` aktif (HTTP 403 `license.addon:multi_store`).
- **Store Context Guard**:
  - Menu Setoran Cabang (`/admin/sales/remittance`) hanya relevan dan aktif untuk toko cabang (non-central / non-pusat).
  - Menu Verifikasi Setoran (`/admin/sales/remittance/verify`) hanya dapat diakses saat berada di konteks Toko Pusat (`is_central = true`).
  - Request API wajib menyertakan header `X-Store-UID` yang divalidasi oleh middleware `store.context`.

---

## 8. Checklist Verifikasi Frontend
- [ ] Item menu sidebar diproteksi guard `addon: "multi_store"`.
- [ ] Dropdown Tipe Transfer muncul di form Transfer Stok Keluar.
- [ ] Form edit harga produk di toko cabang terkunci (read-only).
- [ ] Stat card di `/admin/sales/remittance` menampilkan perhitungan Omzet, Fee, dan Wajib Setor secara realtime.
- [ ] Dialog setor uang berhasil upload bukti transfer (multipart/form-data).
- [ ] Admin Pusat dapat melihat thumbnail bukti transfer dan melakukan aksi Approve / Reject.
- [ ] Status badge tampil jelas dengan warna konsisten (`pending` = kuning, `verified` = hijau, `rejected` = merah).
