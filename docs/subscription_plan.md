# 💎 Rencana Desain Model Bisnis & Subscription POS

> [!NOTE]
> Dokumen ini berisi rancangan skema harga (Biaya Pemasangan Awal + Biaya Langganan Bulanan) serta tabel matriks pembagian fitur berdasarkan kategori modul utama (Penjualan, Inventori, Laporan/Dashboard, Keuangan/Akuntansi, dan Administrasi/Keamanan).

---

## 💰 Skema Harga & Model Bisnis

Sistem pembayaran dibagi menjadi dua komponen utama:
1. **Biaya Pemasangan Pertama (One-time Setup Fee):** **Rp 4.000.000**
   * Dikenakan sekali di awal untuk instalasi sistem, konfigurasi awal printer kasir/scanner, impor data produk awal, dan pelatihan staf.
2. **Biaya Langganan Bulanan (Monthly Subscription):**
   * Dikenakan secara berkala setelah masa pemasangan pertama, disesuaikan dengan tier berikut:
     * **Lite:** Rp 49.000 - Rp 99.000 / bulan
     * **Pro:** Rp 149.000 - Rp 299.000 / bulan
     * **Enterprise:** Rp 499.000+ / bulan

---

## 📊 Matriks Penyesuaian Fitur Navigasi Rill Aplikasi

Berikut adalah pemetaan pembatasan fitur berdasarkan menu navigasi rill yang didefinisikan pada file [sidebar-config.ts](file:///d:/MITRA/POS-FRONTEND/src/components/layout/sidebar-config.ts), ditambah dengan modul laporan keuangan baru:

| Kategori Fitur | Fitur / Halaman Rill | Jalur Rute (Route) | Lite (Basic) | Pro (Growth) | Enterprise (Premium) | Keterangan Batasan Paket |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Menu Utama** | Dashboard | `ROUTES.ADMIN` | ⚠️ *Dasar* | 🟢 Aktif | 🟢 Aktif | **Lite:** Hanya omzet & transaksi hari ini.<br>**Pro/Enterprise:** Grafik penjualan lengkap. |
| | Layar Kasir (POS) | `ROUTES.CHECKOUT` | ⚠️ *Dasar* | 🟢 Aktif | 🟢 Aktif | **Lite:** Pembayaran tunai saja.<br>**Pro/Enterprise:** Mendukung QRIS & transfer bank. |
| **Penjualan** | Sesi Kasir | `ROUTES.ADMIN_CASH_DRAWER` | ❌ Tutup | 🟢 Aktif | 🟢 Aktif | Manajemen buka/tutup shift kasir & tracking laci kas. |
| | Laporan Penjualan | `ROUTES.ADMIN_REPORTS` | ⚠️ *Dasar* | 🟢 Aktif | 🟢 Aktif | **Lite:** Harian saja.<br>**Enterprise:** Mendukung ekspor Excel & PDF. |
| | Daftar Transaksi | `ROUTES.ADMIN_TRANSACTIONS` | ⚠️ *30 Hari* | 🟢 Aktif | 🟢 Aktif | **Lite:** Dibatasi riwayat 30 hari terakhir. |
| **Pembelian** | Pemesanan (PO) | `ROUTES.ADMIN_PURCHASE_ORDER` | ❌ Tutup | ❌ Tutup | 🟢 Aktif | Modul pembuatan Purchase Order formal ke supplier. |
| | Penerimaan Barang | `ROUTES.ADMIN_PURCHASE_RECEIVING`| ❌ Tutup | ❌ Tutup | 🟢 Aktif | Pencatatan barang masuk dari supplier berdasarkan PO. |
| | Pembayaran Supplier | `ROUTES.ADMIN_PURCHASE_PAYMENT`  | ❌ Tutup | ❌ Tutup | 🟢 Aktif | Pelacakan status pembayaran utang barang supplier. |
| | Retur Pembelian | `ROUTES.ADMIN_PURCHASE_RETURN`   | ❌ Tutup | ❌ Tutup | 🟢 Aktif | Modul pengembalian barang rusak/salah ke supplier. |
| **Inventori** | Stok Opname | `ROUTES.ADMIN_STOCK` | ❌ Tutup | 🟢 Aktif | 🟢 Aktif | **Pro/Enterprise:** Penyesuaian stok berkala & mutasi. |
| **Keuangan** | Kelola Kas & Bank | `ROUTES.ADMIN_CASH_ACCOUNTS` | ❌ Tutup | 🟢 Aktif | 🟢 Aktif | **Pro/Enterprise:** Transfer kasir & mutasi bank. |
| **Akuntansi & Finansial (Baru)** | **Laporan Pengeluaran** | *Modul Pengeluaran* | ❌ Tutup | 🟢 Aktif | 🟢 Aktif | **Pro:** Log pengeluaran manual.<br>**Enterprise:** Laporan berdasar kategori pengeluaran + ekspor. |
| | **Laporan Laba Rugi** | *Modul Laba Rugi* | ❌ Tutup | ⚠️ *Dasar* | 🟢 Lengkap | **Pro:** Laba kotor (Omzet - HPP).<br>**Enterprise:** Laba Bersih (dikurangi pengeluaran/operasional) + ekspor. |
| | **Laporan Pembelian** | *Modul Lap. Pembelian* | ❌ Tutup | ❌ Tutup | 🟢 Aktif | Laporan total transaksi belanja barang ke supplier. |
| | **Neraca (Balance Sheet)** | *Modul Neraca* | ❌ Tutup | ❌ Tutup | 🟢 Aktif | Laporan posisi keuangan (aset, kewajiban, modal). |
| **Data Master**| Produk | `ROUTES.ADMIN_PRODUCTS` | ⚠️ *Limit* | 🟢 Aktif | 🟢 Aktif | **Lite:** Maksimal **100 produk aktif**.<br>**Pro/Enterprise:** Produk tanpa batas. |
| | Kategori | `ROUTES.ADMIN_CATEGORIES` | ⚠️ *Limit* | 🟢 Aktif | 🟢 Aktif | **Lite:** Maksimal **5 kategori** produk. |
| | Brand | `ROUTES.ADMIN_BRANDS` | ⚠️ *Limit* | 🟢 Aktif | 🟢 Aktif | **Lite:** Maksimal **5 brand** produk. |
| | Supplier | `ROUTES.ADMIN_SUPPLIERS` | ❌ Tutup | 🟢 Aktif | 🟢 Aktif | Database supplier untuk restock. |
| **Sistem & Admin**| Kelola Pengguna | `ROUTES.ADMIN_USERS` | ❌ Tutup | ⚠️ *Maks 5* | 🟢 Aktif | **Pro:** Maksimal 5 akun staf.<br>**Enterprise:** Staf tanpa batas. |
| | Pengaturan Toko | `ROUTES.ADMIN_SETTINGS` | ⚠️ *Dasar* | 🟢 Aktif | 🟢 Aktif | **Lite:** Struk polos.<br>**Pro/Enterprise:** Kustom struk + logo. |
| | Log Aktivitas | `ROUTES.ADMIN_AUDIT` | ❌ Tutup | ❌ Tutup | 🟢 Aktif | Audit Trail lengkap aktivitas staf kasir (void, edit harga). |

---

## 🛠️ Panduan Teknis Integrasi ke Sidebar (`sidebar-config.ts`)

> [!TIP]
> Untuk menonaktifkan menu di sidebar secara otomatis sesuai paket subscription toko, kita dapat memperluas fungsi `permission` yang sudah ada di [sidebar-config.ts](file:///d:/MITRA/POS-FRONTEND/src/components/layout/sidebar-config.ts) dengan parameter status subscription toko.

### Modifikasi Contoh Implementasi pada Sidebar

Pemeriksaan izin akses navigasi dapat dimodifikasi seperti berikut:

```typescript
// Contoh modifikasi fungsi filter menu berdasarkan role, permission, DAN subscription
export interface SidebarMenuItem {
    type: "link";
    path: string;
    label: string;
    icon: React.ComponentType<{ size: number }>;
    tab?: string;
    // Menambahkan parameter subscriptionTier
    permission: (roles: string[], permissions: string[], subscriptionTier: string) => boolean;
}

// Contoh pemetaan menu audit log pada NAVIGATION_CONFIG:
{
    type: "link",
    path: ROUTES.ADMIN_AUDIT,
    label: "Log Aktivitas",
    icon: IconShieldLock,
    // Menu ini hanya bisa dibuka oleh admin jika subscription bernilai 'enterprise'
    permission: (roles, permissions, subscriptionTier) =>
        subscriptionTier === "enterprise" &&
        (hasRole(roles, "admin") || hasPermission(roles, permissions, "view_audit_logs")),
}
```

Hal ini menjamin integritas menu sidebar, di mana menu-menu yang tidak sesuai dengan paket langganan user akan disembunyikan secara dinamis sejak awal render menu navigasi.
