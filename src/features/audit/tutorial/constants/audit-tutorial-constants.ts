import type { ActivityLog } from "@/features/stock/api/stock-api";
import type { AuditTutorialMeta } from "../types/audit-tutorial";

export const AUDIT_TUTORIAL_LIST: AuditTutorialMeta[] = [
    {
        id: "inspeksi_aktivitas",
        title: "Inspeksi Detail & Jejak Perubahan",
        description: "Pelajari cara mengaudit pelaku, perangkat, komparasi data sebelum vs sesudah, dan payload JSON.",
        category: "Audit Trail",
        stepCount: 5,
        badge: "Fitur Utama",
        isAvailable: true,
    },
    {
        id: "filter_aktivitas",
        title: "Pencarian & Filter Modul Aktivitas",
        description: "Temukan riwayat transaksi, mutasi, atau aksi tertentu menggunakan kata kunci dan modul sistem.",
        category: "Audit Trail",
        stepCount: 3,
        badge: "Pencarian",
        isAvailable: true,
    },
    {
        id: "mode_linimasa",
        title: "Eksplorasi Linimasa & Tabel",
        description: "Beralih sudut pandang antara tabel data terstruktur dan linimasa kronologis visual interaktif.",
        category: "Audit Trail",
        stepCount: 3,
        isAvailable: true,
    },
];

export const MOCK_AUDIT_LOGS: ActivityLog[] = [
    {
        uid: "tutorial-mock-audit-1",
        user_uid: "tutorial-mock-user-1",
        action: "create_sale",
        model_type: "Transaction",
        model_uid: "TRX-20260914-001",
        description: "Transaksi penjualan kasir selesai #TRX-20260914-001 senilai Rp 150.000",
        module: ["penjualan"],
        ip_address: "192.168.1.105",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
        properties: {
            transaction_number: "TRX-20260914-001",
            total: 150000,
            nominal_bayar: 200000,
            kembalian: 50000,
            items: [
                {
                    product_name: "Kopi Susu Gula Aren",
                    barcode: "8992761123456",
                    qty: 5,
                    price: 30000,
                },
            ],
        },
        created_at: new Date().toISOString(),
        user: {
            uid: "tutorial-mock-user-1",
            name: "Budi Santoso (Demo)",
            username: "budikasir",
        },
    },
    {
        uid: "tutorial-mock-audit-2",
        user_uid: "tutorial-mock-user-2",
        action: "stock_adjustment",
        model_type: "StockAdjustment",
        model_uid: "ADJ-20260914-001",
        description: "Penyesuaian stok opname manual pada produk Kopi Bubuk Robusta",
        module: ["inventori"],
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
        properties: {
            old: { stok: 20, catatan: "Stok awal gudang" },
            new: { stok: 25, catatan: "Koreksi selisih fisik opname" },
        },
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user: {
            uid: "tutorial-mock-user-2",
            name: "Siti Rahma (Demo)",
            username: "sitiadmin",
        },
    },
];
