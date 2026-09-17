import type { BalanceSheetTutorialId, BalanceSheetTutorialStep } from "../types/balance-sheet-tutorial";
import { JELAJAH_NERACA_TUTORIAL_STEPS } from "./jelajah-neraca-tutorial-steps";
import { MODE_LAPORAN_TUTORIAL_STEPS } from "./mode-laporan-tutorial-steps";

export const BALANCE_SHEET_TUTORIAL_STEPS: Record<BalanceSheetTutorialId, BalanceSheetTutorialStep[]> = {
    jelajah_neraca: JELAJAH_NERACA_TUTORIAL_STEPS,
    mode_laporan: MODE_LAPORAN_TUTORIAL_STEPS,
};
