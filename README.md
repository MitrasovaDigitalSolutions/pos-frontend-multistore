# POS Multi-Store Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=flat-square)](LICENSE)

Aplikasi Web Point of Sale (POS) & Manajemen Multi-Toko modern, responsif, dan kaya fitur yang dirancang khusus untuk bisnis ritel, grosir, dan bisnis cabang bertingkat. Dibangun dengan ekosistem Next.js 16 App Router, React 19, dan arsitektur berbasis fitur (*feature-based architecture*).

---

## 🚀 Fitur Utama

- 🛒 **Point of Sale (Kasir & Checkout)**
  - Pencarian produk cepat & kompatibilitas barcode scanner.
  - Manajemen keranjang (*cart*) real-time menggunakan Zustand.
  - Dukungan multi-metode pembayaran (Tunai, QRIS, Transfer, Kartu).
  - Cetak struk kasir langsung ke printer thermal via QZ Tray.

- 🏪 **Manajemen Multi-Toko / Multi-Outlet**
  - Pengelolaan data banyak toko/cabang dalam satu sistem terpusat.
  - Fitur perpindahan toko aktif (*store switching*) sesuai akses role user.
  - Isolasi data stok, transaksi, dan laporan per cabang.

- 📦 **Katalog & Produk**
  - Manajemen produk, varian, kategori, dan brand/merek.
  - Pengaturan harga, SKU, dan atribut produk.

- 🔄 **Stok & Mutasi (Stock Transfer & Opname)**
  - Transfer stok antar toko/cabang (Mutasi Stok).
  - Penyesuaian stok fisik (Stock Opname) beserta riwayat perubahan.
  - Audit trail perubahan persediaan barang.

- 💵 **Sesi Kas & Cash Drawer**
  - Buka/Tutup sesi kasir (Shift Cash Drawer).
  - Penyesuaian kas masuk & kas keluar (*cash in / cash out*).
  - Rekonsiliasi saldo kas awal dan akhir shift.

- 📜 **Transaksi & Struk**
  - Riwayat lengkap transaksi penjualan per cabang.
  - Cetak ulang struk (*re-print receipt*) dengan format ESC/POS terspesialisasi.
  - Detail transaksi dan pencatatan retur/pembatalan.

- 🚚 **Pengadaan & Pembelian (Purchase Orders & Suppliers)**
  - Pencatatan data pemasok (*suppliers*).
  - Manajemen Pesanan Pembelian (*Purchase Order*) dan penerimaan barang.

- 📊 **Laporan & Akuntansi**
  - Dashboard analitik penjualan dan keuangan interaktif (Recharts).
  - Pencatatan beban/pengeluaran operasional (*expenses*).
  - Pengelolaan hutang & piutang (*debts & receivables*).

- 👥 **Manajemen User & Hak Akses**
  - Role-Based Access Control (RBAC): Admin, Manajer Toko, Kasir/Karyawan.
  - Manajemen pelanggan/member program.

- ⚡ **PWA & Offline Ready**
  - Dukungan Service Worker via `@serwist/next`.
  - Caching data lokal & IndexedDB melalui `dexie`.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), Radix UI Primitives
- **Ikon & Animasi**: [Lucide React](https://lucide.dev/), [Tabler Icons](https://tabler.io/icons), [Framer Motion](https://framer.com/motion)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Client & Cart State)
- **Data Fetching & Caching**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Autentikasi**: [NextAuth.js v5](https://authjs.dev/)
- **Offline Storage**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper) & [Serwist](https://serwist.pages.dev/) (PWA Service Worker)
- **Integrasi Printer Thermal**: [QZ Tray](https://qz.io/) (`qz-tray`) & Format ESC/POS (`ReceiptFormatter`)

---

## 📂 Struktur Proyek

Proyek ini menggunakan struktur modular berbasis fitur (*feature-driven architecture*):

```text
src/
├── app/                  # Route Handlers & Pages (App Router)
│   ├── (auth)/           # Route group untuk Halaman Login / Auth
│   ├── (protected)/      # Route group terlindungi (Dashboard, Admin, Kasir)
│   ├── api/              # API Route Handlers internal
│   └── sw.ts             # Service Worker (Serwist PWA)
├── components/           # Komponen UI global (Shadcn UI, Reusable Primitives)
├── config/               # Konfigurasi aplikasi & navigasi
├── constants/            # Enum & konstanta global
├── features/             # Modul Fitur (catalog, checkout, stock, transactions, dll.)
│   ├── catalog/          # Komponen, hook, & tipe data katalog
│   ├── checkout/         # Fitur kasir & pembayaran
│   ├── stock-transfer/   # Fitur mutasi stok antar cabang
│   └── ...               # Modul fitur lainnya
├── hooks/                # Custom React Hooks
├── lib/                  # Library instances (Axios instance, Query Client setup)
├── providers/            # React Context Providers (Auth, Theme, React Query)
├── services/             # Layer Layanan Eksternal (contoh: QZ Tray printer service)
├── stores/               # State Store (Zustand)
├── styles/               # Styling global & konfigurasi CSS
├── types/                # TypeScript Interfaces & Type Declarations
└── utils/                # Utility Helpers (ReceiptFormatter, Currency & Date formatters)
```

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat

- [Node.js](https://nodejs.org/) v20+ atau [Bun](https://bun.sh/)
- Backend Service API (POS Backend Multi-Store API)

### 1. Clone Repository

```bash
git clone https://github.com/MitrasovaDigitalSolutions/pos-frontend-multistore.git
cd pos-frontend-multistore
```

### 2. Install Dependensi

Menggunakan Bun (direkomendasikan):
```bash
bun install
```

Atau menggunakan npm:
```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env` di root direktori proyek dan sesuaikan variabel berikut:

```env
NEXT_PUBLIC_API_URL=https://****
NEXTAUTH_SECRET=****
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Jalankan Development Server

```bash
bun dev
# atau
bun dev
# atau
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di peramban web Anda.

### 5. Build untuk Produksi

```bash
bun run build
bun run start
# atau
npm run build
npm run start
```

---

## 🖨️ Integrasi Printer Struk Thermal (QZ Tray)

Untuk menggunakan fitur cetak struk otomatis di Kasir:
1. Unduh dan pasang aplikasi client **[QZ Tray](https://qz.io/download/)** di komputer kasir.
2. Pastikan printer thermal (contoh: POS-58, EPSON TM-series, dsb.) telah terhubung & terinstal driver-nya di komputer.
3. Buka halaman Kasir pada aplikasi web ini; sistem akan secara otomatis mendeteksi koneksi QZ Tray untuk mengirimkan perintah cetak ESC/POS.

---

## 📄 Lisensi & Hak Cipta

Hak Cipta © 2026 **Mitrasova Digital Solutions**. Seluruh Hak Dilindungi Undang-Undang (*All Rights Reserved*).

Perangkat lunak ini berada di bawah lisensi **Proprietary / Hak Cipta Hak Milik** ([LICENSE](LICENSE)). Kode sumber ini **TIDAK BOLEH** diperjualbelikan, disewakan, diubah/dimodifikasi, maupun didistribusikan ulang tanpa izin tertulis dari Mitrasova Digital Solutions.
