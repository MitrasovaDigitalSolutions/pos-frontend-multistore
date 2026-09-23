// ─── License Feature Constants ───────────────────────────────────────────────

import type { LicenseEffectiveStatus } from "../types";

export const LICENSE_STATUS_LABELS: Record<LicenseEffectiveStatus, string> = {
    active: "Aktif",
    grace_period: "Masa Tenggang",
    expired: "Kedaluwarsa",
    suspended: "Ditangguhkan",
    not_activated: "Belum Diaktifkan",
};

export const LICENSE_STATUS_BADGE_VARIANTS: Record<
    LicenseEffectiveStatus,
    "emerald" | "amber" | "rose" | "blue" | "slate"
> = {
    active: "emerald",
    grace_period: "amber",
    expired: "rose",
    suspended: "rose",
    not_activated: "slate",
};

/** Addon code → menu/feature label mapping (matches active_addons from status endpoint) */
export const ADDON_LABELS: Record<string, string> = {
    purchasing: "Pembelian & Supplier",
    debts: "Hutang & Piutang",
    expenses: "Pengeluaran (Expenses)",
    members: "Member & CRM",
    stock_opname: "Stock Opname Scanner & Excel",
    reports: "Laporan & Analisis Bisnis",
    accounting: "Akuntansi Lengkap (ERP)",
    consignment: "Konsinyasi (Barang Titipan)",
    production: "Produksi & Manufaktur (BOM)",
    assets: "Manajemen Aset & Depresiasi",
    // Resto addons
    kds: "Kitchen Display System (KDS Pro)",
    table_mgmt: "Table & Floor Management",
    reservation: "Reservasi & Waitlist Pro",
};

export interface AddonMetadata {
    code: string;
    nama: string;
    description: string;
    menuPaths: string[];
}

export const ADDON_METADATA: Record<string, AddonMetadata> = {
    purchasing: {
        code: "purchasing",
        nama: "Pembelian & Supplier",
        description: "Purchase Order (PO), Penerimaan Barang (Receiving), Deteksi Selisih Harga, Retur Pembelian.",
        menuPaths: ["Transaksi → Pembelian", "Admin → Katalog (Supplier & Sales)"],
    },
    debts: {
        code: "debts",
        nama: "Hutang & Piutang",
        description: "Hutang Usaha Supplier, Penjualan Tempo/Kredit (Piutang Member), Riwayat Cicilan & Pelunasan.",
        menuPaths: ["Keuangan → Hutang"],
    },
    expenses: {
        code: "expenses",
        nama: "Pengeluaran (Expenses)",
        description: "Biaya Operasional Toko, Kategori Beban, Akun Kas Sourcing, Pengingat Jatuh Tempo Tagihan.",
        menuPaths: ["Keuangan → Pengeluaran", "Keuangan → Laporan (Pengeluaran)"],
    },
    members: {
        code: "members",
        nama: "Member & CRM",
        description: "Direktori Member Pelanggan, Level/Tier Member, Poin Loyalitas, Riwayat Belanja Pelanggan.",
        menuPaths: ["Data Master → Member / Pelanggan"],
    },
    stock_opname: {
        code: "stock_opname",
        nama: "Stock Opname Scanner & Excel",
        description: "Audit Stok Fisik via Barcode Scanner Handheld, Import/Export Excel, Two-Phase Background Finalizer.",
        menuPaths: ["Inventori → Stok Opname"],
    },
    reports: {
        code: "reports",
        nama: "Laporan & Analisis Bisnis",
        description: "Laporan Laba Bersih/Kotor, Valuasi Nilai Stok Toko, Tren Penjualan Produk & Kategori.",
        menuPaths: ["Keuangan → Laporan", "Admin → Laporan Konsolidasi"],
    },
    accounting: {
        code: "accounting",
        nama: "Akuntansi Lengkap (ERP)",
        description: "Chart of Accounts (COA), Jurnal Umum Otomatis & Manual (Double-Entry Debit/Kredit), Neraca, Laba Rugi, Buku Kas.",
        menuPaths: ["Keuangan → Akuntansi", "Admin → Keuangan & Aset (Bagan Akun CoA)"],
    },
    consignment: {
        code: "consignment",
        nama: "Konsinyasi (Barang Titipan)",
        description: "Penerimaan Off-Book (Tanpa Beban Neraca Awal), Auto FIFO HPP & Pengakuan Hutang saat Kasir Checkout, Settlement Retur.",
        menuPaths: ["Transaksi → Konsinyasi"],
    },
    production: {
        code: "production",
        nama: "Produksi & Manufaktur (BOM)",
        description: "Bill of Materials (BOM/Resep), SPK Order Produksi, Penguraian Stok Bahan Baku, Biaya Overhead & Tenaga Kerja, Auto Jurnal HPP/WIP.",
        menuPaths: ["Inventori → Manufaktur"],
    },
    assets: {
        code: "assets",
        nama: "Manajemen Aset & Depresiasi",
        description: "Inventarisasi Aset Tetap, Jadwal & Perhitungan Penyusutan Berkala (Garis Lurus), Pelepasan/Penjualan Aset, Auto Jurnal Depresiasi ke Neraca/Laba Rugi.",
        menuPaths: ["Keuangan → Aset", "Admin → Keuangan & Aset (Kategori Aset)"],
    },
    // Resto addons
    kds: {
        code: "kds",
        nama: "Kitchen Display System (KDS Pro)",
        description: "Layar monitor pesanan real-time dapur & bar dengan pengingat waktu masak (timer) dan auto-dispatch.",
        menuPaths: ["Resto → Kitchen Display System"],
    },
    reservation: {
        code: "reservation",
        nama: "Reservasi & Waitlist Pro",
        description: "Manajemen reservasi meja, waitlist pelanggan, notifikasi booking via WhatsApp, dan laporan tingkat hunian real-time.",
        menuPaths: ["Resto → Reservasi & Waitlist"],
    },
    table_mgmt: {
        code: "table_mgmt",
        nama: "Table & Floor Management",
        description: "Visualisasi denah meja, reservasi pelanggan, status okupansi meja, dan split bill.",
        menuPaths: ["Resto → Manajemen Meja"],
    },
};

/** Addon code → primary nav section it belongs to */
export const ADDON_SECTION: Record<string, string> = {
    purchasing: "Transaksi → Pembelian",
    debts: "Keuangan → Hutang",
    expenses: "Keuangan → Pengeluaran",
    members: "Data Master → Member / Pelanggan",
    stock_opname: "Inventori → Stok Opname",
    reports: "Keuangan → Laporan",
    accounting: "Keuangan → Akuntansi",
    consignment: "Transaksi → Konsinyasi",
    production: "Inventori → Manufaktur",
    assets: "Keuangan → Aset",
};

export const BILLING_PERIOD_LABELS: Record<string, string> = {
    monthly: "Bulanan",
    annual: "Tahunan",
};

export const SUBSCRIPTION_TYPE_LABELS: Record<string, string> = {
    monthly: "Langganan Bulanan",
    annual: "Langganan Tahunan",
    yearly: "Langganan Tahunan",
    lifetime: "Lisensi Permanen",
    trial: "Masa Uji Coba",
};

export const SUBSCRIPTION_TYPE_BADGE_LABELS: Record<string, string> = {
    monthly: "Bulanan",
    annual: "Tahunan",
    yearly: "Tahunan",
    lifetime: "Permanen",
    trial: "Uji Coba",
};

