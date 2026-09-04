import {
    IconBox,
    IconBuildingBank,
    IconBuildingStore,
    IconChartBar,
    IconDeviceLaptop,
    IconPackage,
    IconSettings,
    IconShield,
    IconShoppingCart,
    IconTruckDelivery,
    IconUserCheck,
    IconWallet,
} from "@tabler/icons-react";
import type { PermissionMeta, RoleMeta, StaticPermissionCategory } from "../components/role-permission-types";

// ─── Metadata Peran Pengguna ──────────────────────────────────────────────────

export const ROLE_METADATA: Record<string, RoleMeta> = {
    admin: {
        label: "Administrator",
        desc: "Akses penuh ke semua fitur, modul, cabang, dan konfigurasi master sistem.",
        colorClass: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-200 text-rose-700 dark:border-rose-900/40 dark:text-rose-400",
        icon: IconShield,
    },
    manajer_toko: {
        label: "Manajer Toko",
        desc: "Mengelola inventori toko, transfer stok cabang, laporan penjualan, dan supervisi kasir.",
        colorClass: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-200 text-blue-700 dark:border-blue-900/40 dark:text-blue-400",
        icon: IconBuildingStore,
    },
    supervisor: {
        label: "Supervisor",
        desc: "Memantau shift kasir, melakukan stock opname fisik, serta verifikasi penerimaan barang.",
        colorClass: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-200 text-amber-700 dark:border-amber-900/40 dark:text-amber-400",
        icon: IconUserCheck,
    },
    kasir: {
        label: "Kasir / Staff",
        desc: "Fokus pada layar checkout transaksi POS, pencatatan laci kasir, dan struk belanja.",
        colorClass: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200 text-emerald-700 dark:border-emerald-900/40 dark:text-emerald-400",
        icon: IconDeviceLaptop,
    },
};

// ─── Metadata 41 Permissions ──────────────────────────────────────────────────

export const PERMISSION_METADATA: Record<string, PermissionMeta> = {
    // 1. Penjualan & Kasir (POS)
    create_sales: {
        label: "Transaksi Penjualan (POS)",
        desc: "Akses layar kasir checkout, input barang keranjang, dan pemrosesan pembayaran.",
        actionType: "auth",
        categoryId: "pos",
    },
    view_sales: {
        label: "Lihat Riwayat Penjualan",
        desc: "Melihat daftar transaksi penjualan, rincian nota, dan riwayat pesanan pelanggan.",
        actionType: "view",
        categoryId: "pos",
    },
    manage_sales: {
        label: "Kelola Transaksi Penjualan",
        desc: "Mengubah status transaksi penjualan, menyelesaikan pesanan tertahan, atau merevisi nota.",
        actionType: "manage",
        categoryId: "pos",
    },
    void_sales: {
        label: "Void / Pembatalan Penjualan",
        desc: "Melakukan void atau pembatalan transaksi kasir yang telah dibayar atau tercatat.",
        actionType: "auth",
        categoryId: "pos",
    },
    operate_cash_drawer: {
        label: "Buka / Tutup Shift Kasir",
        desc: "Membuka laci kasir, mencatat modal awal, uang masuk, dan penutupan kas per shift.",
        actionType: "auth",
        categoryId: "pos",
    },
    view_cash_drawer: {
        label: "Lihat Laporan Laci Kas",
        desc: "Melihat laporan sesi kasir, saldo akhir shift, serta riwayat buka/tutup cash drawer.",
        actionType: "view",
        categoryId: "pos",
    },
    manage_cash_drawer: {
        label: "Kelola Sesi & Audit Laci Kas",
        desc: "Mengaudit selisih kas fisik, reset sesi kasir, dan konfigurasi limit kas laci.",
        actionType: "manage",
        categoryId: "pos",
    },

    // 2. Master Produk & Pelanggan
    view_products: {
        label: "Lihat Master Produk",
        desc: "Melihat katalog produk, varian, barcode, kategori, dan harga jual barang.",
        actionType: "view",
        categoryId: "master",
    },
    manage_products: {
        label: "Kelola Master Produk",
        desc: "Menambah, mengedit, menghapus produk, kategori, merk, dan penetapan harga jual.",
        actionType: "manage",
        categoryId: "master",
    },
    view_members: {
        label: "Lihat Data Member",
        desc: "Melihat daftar pelanggan/member terdaftar, riwayat poin loyalitas, dan data kontak.",
        actionType: "view",
        categoryId: "master",
    },
    manage_members: {
        label: "Kelola Data Member",
        desc: "Menambah, mengedit data pelanggan, mendaftarkan kartu member, dan penyesuaian poin.",
        actionType: "manage",
        categoryId: "master",
    },

    // 3. Pengadaan, Pembelian & Konsinyasi
    view_purchase: {
        label: "Lihat Pembelian (PO)",
        desc: "Melihat riwayat pemesanan barang (PO), status penerimaan barang, dan faktur supplier.",
        actionType: "view",
        categoryId: "procurement",
    },
    manage_purchase: {
        label: "Kelola Pembelian (PO)",
        desc: "Membuat PO baru, mencatat receiving barang masuk, pembayaran faktur, dan retur supplier.",
        actionType: "manage",
        categoryId: "procurement",
    },
    view_consignment: {
        label: "Lihat Data Konsinyasi",
        desc: "Melihat riwayat penerimaan barang titipan/konsinyasi, stok titipan, dan penjualan konsinyasi.",
        actionType: "view",
        categoryId: "procurement",
    },
    manage_consignment: {
        label: "Kelola Konsinyasi",
        desc: "Mencatat penerimaan konsinyasi baru, proses pelunasan penjualan titipan, dan retur sisa barang.",
        actionType: "manage",
        categoryId: "procurement",
    },
    view_suppliers: {
        label: "Lihat Data Supplier",
        desc: "Melihat daftar distributor pemasok barang, info kontak, dan syarat pembayaran.",
        actionType: "view",
        categoryId: "procurement",
    },
    manage_suppliers: {
        label: "Kelola Data Supplier",
        desc: "Menambah, mengubah, dan menghapus master data pemasok/distributor barang.",
        actionType: "manage",
        categoryId: "procurement",
    },

    // 4. Inventori, Transfer Stok & Produksi
    view_inventory: {
        label: "Lihat Stok & Kartu Stok",
        desc: "Melihat sisa kuantitas barang, mutasi kartu stok, dan riwayat pergerakan inventori.",
        actionType: "view",
        categoryId: "inventory",
    },
    manage_inventory: {
        label: "Kelola Stok & Opname",
        desc: "Melakukan proses stock opname fisik toko dan penyesuaian (adjusment) stok.",
        actionType: "manage",
        categoryId: "inventory",
    },
    view_stock_transfers: {
        label: "Lihat Transfer Stok",
        desc: "Melihat riwayat surat jalan transfer antar cabang, status transfer masuk dan keluar.",
        actionType: "view",
        categoryId: "inventory",
    },
    manage_stock_transfers: {
        label: "Kelola Transfer Stok",
        desc: "Membuat surat jalan transfer, mengirim stok ke cabang lain, dan memvalidasi barang tiba.",
        actionType: "manage",
        categoryId: "inventory",
    },
    view_request_transfers: {
        label: "Lihat Request Transfer",
        desc: "Melihat daftar permohonan pemindahan stok barang yang diajukan oleh cabang.",
        actionType: "view",
        categoryId: "inventory",
    },
    manage_request_transfers: {
        label: "Kelola Request Transfer",
        desc: "Mengajukan permohonan stok baru dan memproses persetujuan (order/reject/kirim) request.",
        actionType: "manage",
        categoryId: "inventory",
    },
    view_production: {
        label: "Lihat Produksi Harian",
        desc: "Melihat riwayat proses produksi harian, status pengerjaan, dan output barang jadi.",
        actionType: "view",
        categoryId: "inventory",
    },
    manage_production: {
        label: "Kelola Produksi Harian",
        desc: "Mencatat formula BOM, alokasi konsumsi bahan baku, dan penghitungan HPP barang jadi.",
        actionType: "manage",
        categoryId: "inventory",
    },

    // 5. Keuangan & Biaya Operasional
    manage_cash_accounts: {
        label: "Kelola Kas & Bank",
        desc: "Mengatur akun kas tunai, rekening bank, mutasi pemindahan kas internal toko.",
        actionType: "manage",
        categoryId: "finance",
    },
    view_expenses: {
        label: "Lihat Pengeluaran Toko",
        desc: "Melihat riwayat biaya operasional, tagihan listrik/sewa, dan pengeluaran toko lainnya.",
        actionType: "view",
        categoryId: "finance",
    },
    manage_expenses: {
        label: "Kelola Pengeluaran Toko",
        desc: "Mencatat biaya operasional baru, mengedit, menyetujui, atau membatalkan pengeluaran.",
        actionType: "manage",
        categoryId: "finance",
    },

    // 6. Akuntansi & Aset Tetap
    view_chart_of_accounts: {
        label: "Lihat Bagan Akun (COA)",
        desc: "Melihat bagan akun perkiraan (COA) akuntansi, klasifikasi akun, dan saldo buku besar.",
        actionType: "view",
        categoryId: "accounting",
    },
    manage_chart_of_accounts: {
        label: "Kelola Bagan Akun (COA)",
        desc: "Menambah, mengedit kode/nama akun perkiraan, dan mengatur induk bagan akun.",
        actionType: "manage",
        categoryId: "accounting",
    },
    view_manual_journals: {
        label: "Lihat Jurnal Manual",
        desc: "Melihat riwayat entri ayat jurnal umum manual dan detail debit/kredit akun.",
        actionType: "view",
        categoryId: "accounting",
    },
    manage_manual_journals: {
        label: "Kelola Jurnal Manual",
        desc: "Membuat, mengoreksi, dan memposting ayat jurnal umum manual akuntansi.",
        actionType: "manage",
        categoryId: "accounting",
    },
    view_assets: {
        label: "Lihat Aset Tetap",
        desc: "Melihat daftar aset tetap toko, tanggal perolehan, nilai buku, dan status barang inventaris.",
        actionType: "view",
        categoryId: "accounting",
    },
    manage_assets: {
        label: "Kelola Aset & Penyusutan",
        desc: "Menambah aset baru, mengubah masa manfaat aset, dan menjalankan penyusutan (depresiasi).",
        actionType: "manage",
        categoryId: "accounting",
    },

    // 7. Laporan & Analisis
    view_reports: {
        label: "Akses Laporan & Analitik",
        desc: "Mengakses dashboard analitik, laporan laba rugi, laporan penjualan, dan ringkasan keuangan.",
        actionType: "view",
        categoryId: "reports",
    },

    // 8. Pengguna, Cabang & Sistem
    view_users: {
        label: "Lihat Pengguna & Karyawan",
        desc: "Melihat daftar pengguna sistem, staf kasir, supervisor toko, dan peran yang diberikan.",
        actionType: "view",
        categoryId: "system",
    },
    manage_users: {
        label: "Kelola Pengguna & Hak Akses",
        desc: "Menambah akun baru, mengubah password/role karyawan, serta menetapkan hak akses peran.",
        actionType: "manage",
        categoryId: "system",
    },
    view_stores: {
        label: "Lihat Cabang Toko",
        desc: "Melihat daftar cabang/outlet toko, nomor telepon, dan status operasional cabang.",
        actionType: "view",
        categoryId: "system",
    },
    manage_stores: {
        label: "Kelola Cabang Toko",
        desc: "Menambah cabang toko baru, mengatur profil toko, gudang, dan sinkronisasi cabang.",
        actionType: "manage",
        categoryId: "system",
    },
    view_audit_logs: {
        label: "Lihat Log Audit Sistem",
        desc: "Memeriksa riwayat jejak aktivitas pengguna, audit login, dan riwayat keamanan sistem.",
        actionType: "view",
        categoryId: "system",
    },
    manage_settings: {
        label: "Kelola Pengaturan Sistem",
        desc: "Mengatur konfigurasi umum toko, PPN, printer struk kasir, backup data, dan integrasi.",
        actionType: "manage",
        categoryId: "system",
    },
};

// ─── 8 Kategori Modul Fungsional ──────────────────────────────────────────────

export const PERMISSION_CATEGORIES: StaticPermissionCategory[] = [
    {
        id: "pos",
        label: "Penjualan & Kasir (POS)",
        shortLabel: "Kasir (POS)",
        desc: "Operasional kasir checkout, pembayaran, void transaksi, serta pembukaan & tutup shift laci kasir.",
        icon: IconShoppingCart,
        colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40",
        badgeClass: "bg-emerald-100/80 text-emerald-800 border-emerald-200",
        permissions: [
            "create_sales",
            "view_sales",
            "manage_sales",
            "void_sales",
            "operate_cash_drawer",
            "view_cash_drawer",
            "manage_cash_drawer",
        ],
    },
    {
        id: "master",
        label: "Master Produk & Pelanggan",
        shortLabel: "Produk & Member",
        desc: "Manajemen katalog produk, harga jual, barcode, kategori barang, serta member dan loyalitas.",
        icon: IconPackage,
        colorClass: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40",
        badgeClass: "bg-blue-100/80 text-blue-800 border-blue-200",
        permissions: [
            "view_products",
            "manage_products",
            "view_members",
            "manage_members",
        ],
    },
    {
        id: "procurement",
        label: "Pengadaan, Pembelian & Konsinyasi",
        shortLabel: "Pembelian & PO",
        desc: "Pemesanan barang (PO), penerimaan barang masuk, pembayaran supplier, retur, dan barang konsinyasi.",
        icon: IconTruckDelivery,
        colorClass: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40",
        badgeClass: "bg-amber-100/80 text-amber-800 border-amber-200",
        permissions: [
            "view_purchase",
            "manage_purchase",
            "view_consignment",
            "manage_consignment",
            "view_suppliers",
            "manage_suppliers",
        ],
    },
    {
        id: "inventory",
        label: "Inventori, Transfer & Produksi",
        shortLabel: "Stok & Transfer",
        desc: "Stock opname fisik, mutasi kartu stok, transfer stok antar cabang toko, request mutasi, dan produksi harian.",
        icon: IconBox,
        colorClass: "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/40",
        badgeClass: "bg-indigo-100/80 text-indigo-800 border-indigo-200",
        permissions: [
            "view_inventory",
            "manage_inventory",
            "view_stock_transfers",
            "manage_stock_transfers",
            "view_request_transfers",
            "manage_request_transfers",
            "view_production",
            "manage_production",
        ],
    },
    {
        id: "finance",
        label: "Keuangan & Biaya Operasional",
        shortLabel: "Kas & Biaya",
        desc: "Manajemen akun kas tunai, rekening bank, mutasi antar kas, dan pencatatan pengeluaran operasional toko.",
        icon: IconWallet,
        colorClass: "text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800/40",
        badgeClass: "bg-teal-100/80 text-teal-800 border-teal-200",
        permissions: [
            "manage_cash_accounts",
            "view_expenses",
            "manage_expenses",
        ],
    },
    {
        id: "accounting",
        label: "Akuntansi & Aset Tetap",
        shortLabel: "Akuntansi & Aset",
        desc: "Bagan akun perkiraan (COA), pembuatan jurnal manual, buku besar, neraca, serta aset tetap & depresiasi.",
        icon: IconBuildingBank,
        colorClass: "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40",
        badgeClass: "bg-purple-100/80 text-purple-800 border-purple-200",
        permissions: [
            "view_chart_of_accounts",
            "manage_chart_of_accounts",
            "view_manual_journals",
            "manage_manual_journals",
            "view_assets",
            "manage_assets",
        ],
    },
    {
        id: "reports",
        label: "Laporan & Analitik",
        shortLabel: "Laporan",
        desc: "Dashboard laporan performa toko, laba rugi, riwayat penjualan per kategori, dan analitik bisnis.",
        icon: IconChartBar,
        colorClass: "text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800/40",
        badgeClass: "bg-cyan-100/80 text-cyan-800 border-cyan-200",
        permissions: [
            "view_reports",
        ],
    },
    {
        id: "system",
        label: "Pengguna, Cabang & Sistem",
        shortLabel: "Sistem & User",
        desc: "Manajemen akun karyawan, hak akses role, outlet cabang, catatan audit keamanan, dan pengaturan sistem.",
        icon: IconSettings,
        colorClass: "text-slate-700 bg-slate-100 border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
        badgeClass: "bg-slate-200 text-slate-800 border-slate-300",
        permissions: [
            "view_users",
            "manage_users",
            "view_stores",
            "manage_stores",
            "view_audit_logs",
            "manage_settings",
        ],
    },
];
