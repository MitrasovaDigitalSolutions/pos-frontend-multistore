import type { ReportsTutorialId, ReportsTutorialStep } from "../types/reports-tutorial";
import { JELAJAH_LABA_RUGI_TUTORIAL_STEPS } from "./jelajah-laba-rugi-tutorial-steps";
import { JELAJAH_PENJUALAN_TUTORIAL_STEPS } from "./jelajah-penjualan-tutorial-steps";
import { JELAJAH_KATEGORI_TUTORIAL_STEPS } from "./jelajah-kategori-tutorial-steps";
import { JELAJAH_PEMBELIAN_TUTORIAL_STEPS } from "./jelajah-pembelian-tutorial-steps";
import { JELAJAH_PENGELUARAN_TUTORIAL_STEPS } from "./jelajah-pengeluaran-tutorial-steps";

export const REPORTS_TUTORIAL_STEPS: Record<ReportsTutorialId, ReportsTutorialStep[]> = {
    jelajah_laba_rugi: JELAJAH_LABA_RUGI_TUTORIAL_STEPS,
    jelajah_penjualan: JELAJAH_PENJUALAN_TUTORIAL_STEPS,
    jelajah_kategori: JELAJAH_KATEGORI_TUTORIAL_STEPS,
    jelajah_pembelian: JELAJAH_PEMBELIAN_TUTORIAL_STEPS,
    jelajah_pengeluaran: JELAJAH_PENGELUARAN_TUTORIAL_STEPS,
};
