import type {
    LabaRugiReport,
    PenjualanReport,
    SalesByCategoryResponse,
    PurchaseReport,
    PengeluaranReport,
} from "@/features/reports/types";
import type { ReportsTutorialMeta } from "../types/reports-tutorial";

export const REPORTS_TUTORIAL_LIST: ReportsTutorialMeta[] = [
    {
        id: "jelajah_laba_rugi",
        title: "Jelajah Laporan Laba Rugi",
        description: "Memahami analisis pendapatan, HPP, diskon, dan laba bersih toko.",
        category: "Laporan",
        stepCount: 7,
        badge: "Profitabilitas",
        isAvailable: true,
    },
    {
        id: "jelajah_penjualan",
        title: "Jelajah Laporan Penjualan",
        description: "Membaca faktur penjualan barang keluar beserta detail barang terjual.",
        category: "Laporan",
        stepCount: 7,
        badge: "Penjualan",
        isAvailable: true,
    },
    {
        id: "jelajah_kategori",
        title: "Penjualan Per Kategori",
        description: "Analisis kontribusi penjualan berdasarkan kategori produk.",
        category: "Laporan",
        stepCount: 6,
        badge: "Kategori",
        isAvailable: true,
    },
    {
        id: "jelajah_pembelian",
        title: "Jelajah Laporan Pembelian",
        description: "Memahami faktur pembelian, retur, dan sisa hutang kepada supplier.",
        category: "Laporan",
        stepCount: 7,
        badge: "Pembelian",
        isAvailable: true,
    },
    {
        id: "jelajah_pengeluaran",
        title: "Jelajah Laporan Pengeluaran",
        description: "Membaca log biaya pengeluaran kas operasional toko.",
        category: "Laporan",
        stepCount: 6,
        badge: "Pengeluaran",
        isAvailable: true,
    },
];

export const MOCK_LABA_RUGI: LabaRugiReport = {
    from: "2026-08-16",
    to: "2026-09-15",
    interval: "daily",
    report_data: [
        {
            tanggal: "2026-09-10",
            date_raw: "2026-09-10",
            no_faktur: "SJ/Demo/0001",
            keterangan: "Penjualan Kasir Harian (Demo)",
            tipe: "sale",
            h_jual: 5000000,
            hpp: 3500000,
            diskon: 100000,
            laba_rugi: 1400000,
        },
        {
            tanggal: "2026-09-12",
            date_raw: "2026-09-12",
            no_faktur: "EXP/Demo/0001",
            keterangan: "Beban Listrik & Internet Toko (Demo)",
            tipe: "expense",
            h_jual: 0,
            hpp: 750000,
            diskon: 0,
            laba_rugi: -750000,
        },
    ],
    total_h_jual: 25000000,
    total_hpp: 15000000,
    total_diskon: 500000,
    total_laba_rugi: 6000000,
    total_laba_penjualan: 9500000,
    total_pengeluaran: 3500000,
};

export const MOCK_PENJUALAN: PenjualanReport = {
    from: "2026-09-15",
    to: "2026-09-15",
    sales: {
        data: [
            {
                no: 1,
                tanggal: "2026-09-15",
                tanggal_raw: "2026-09-15",
                no_faktur: "INV/Demo/0001",
                operator: "Admin Demo",
                jumlah: 3500000,
                total_net: 3500000,
                daftar_barang: [
                    {
                        nama_barang: "Kopi Susu Gula Aren (Demo)",
                        satuan: "Cup",
                        qty: 12,
                        harga_jual: 18000,
                        subtotal: 216000,
                    },
                    {
                        nama_barang: "Roti Bakar Coklat (Demo)",
                        satuan: "Pcs",
                        qty: 8,
                        harga_jual: 25000,
                        subtotal: 200000,
                    },
                ],
            },
        ],
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 1,
        },
    },
    total_amount: 3500000,
    include_items: true,
};

export const MOCK_KATEGORI: SalesByCategoryResponse = {
    from: "2026-08-16",
    to: "2026-09-15",
    data: [
        {
            category_uid: "tutorial-mock-cat-1",
            category: "Minuman (Demo)",
            total_sales: 9000000,
            total_profit: 3200000,
            total_quantity: 540,
            percentage_sales: 60,
        },
        {
            category_uid: "tutorial-mock-cat-2",
            category: "Makanan (Demo)",
            total_sales: 4500000,
            total_profit: 1500000,
            total_quantity: 210,
            percentage_sales: 30,
        },
        {
            category_uid: "tutorial-mock-cat-3",
            category: "Snack (Demo)",
            total_sales: 1500000,
            total_profit: 500000,
            total_quantity: 130,
            percentage_sales: 10,
        },
    ],
};

export const MOCK_PEMBELIAN: PurchaseReport = {
    from: "2026-08-16",
    to: "2026-09-15",
    receivings: [
        {
            no: 1,
            tanggal: "2026-09-05",
            tanggal_raw: "2026-09-05",
            no_faktur: "PO/Demo/0001",
            supplier: "Supplier Kopi Nusantara (Demo)",
            operator: "Admin Demo",
            pembayaran: "TEMPO",
            jumlah: 4500000,
            retur: 0,
            total_net: 4500000,
            hutang: 2000000,
            daftar_barang: [
                {
                    nama_barang: "Biji Kopi Arabika (Demo)",
                    satuan: "Kg",
                    qty_beli: 30,
                    qty_retur: 0,
                    net_qty: 30,
                    harga_beli: 150000,
                    subtotal_net: 4500000,
                },
            ],
        },
    ],
    total_amount: 4500000,
    total_retur: 0,
    total_net: 4500000,
    total_hutang: 2000000,
    include_items: true,
    include_payments: true,
};

export const MOCK_PENGELUARAN: PengeluaranReport = {
    from: "2026-08-16",
    to: "2026-09-15",
    expenses: [
        {
            uid: "tutorial-mock-exp-1",
            tanggal: "2026-09-12",
            nomor_pengeluaran: "EXP/Demo/0001",
            category_uid: "tutorial-mock-expcat-1",
            category_name: "Operasional (Demo)",
            category: { uid: "tutorial-mock-expcat-1", nama: "Operasional (Demo)" },
            nama: "Beban Listrik & Internet Toko (Demo)",
            amount: 750000,
            cash_account_uid: "tutorial-mock-cash-1",
            cash_account: { uid: "tutorial-mock-cash-1", nama: "Kas Toko (Demo)" },
            user_uid: "tutorial-mock-user-1",
            user: { uid: "tutorial-mock-user-1", name: "Admin Demo" },
        },
    ],
    total_amount: 750000,
};
