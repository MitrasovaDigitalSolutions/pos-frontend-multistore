import type { SalesTutorialStepMeta } from "../types/sales-tutorial";
import { CASH_DRAWER_TUTORIAL_STEPS } from "../steps/cash-drawer-tutorial-steps";
import { TRANSACTIONS_TUTORIAL_STEPS } from "../steps/transactions-tutorial-steps";

export const SALES_TUTORIAL_METAS: SalesTutorialStepMeta[] = [
    {
        id: "cash_drawer",
        title: "Panduan Sesi Kasir & Shift",
        description:
            "Pelajari kontrol uang fisik di laci kasir, pembagian shift operator, formula expected cash, deteksi selisih (difference), hingga audit rincian arus kas masuk/keluar.",
        badge: "Shift & Laci Kas",
        duration: "3-4 Menit",
        stepCount: CASH_DRAWER_TUTORIAL_STEPS.length,
        isAvailable: true,
    },
    {
        id: "transactions_list",
        title: "Panduan Riwayat Transaksi Penjualan",
        description:
            "Pelajari penelusuran nota penjualan kasir, pencarian faktur belanja, filter tanggal & pembayaran, tooltip breakdown penerimaan, hingga cetak ulang struk thermal dan void transaksi.",
        badge: "Daftar Transaksi",
        duration: "2-3 Menit",
        stepCount: TRANSACTIONS_TUTORIAL_STEPS.length,
        isAvailable: true,
    },
];
