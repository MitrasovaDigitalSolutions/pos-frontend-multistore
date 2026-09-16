import type { ExpensesTutorialId, ExpensesTutorialStep } from "../types/expenses-tutorial";
import { JELAJAH_PENGELUARAN_TUTORIAL_STEPS } from "./jelajah-pengeluaran-tutorial-steps";
import { CATAT_PENGELUARAN_TUTORIAL_STEPS } from "./catat-pengeluaran-tutorial-steps";
import { EDIT_PENGELUARAN_TUTORIAL_STEPS } from "./edit-pengeluaran-tutorial-steps";
import { KELOLA_KATEGORI_TUTORIAL_STEPS } from "./kelola-kategori-tutorial-steps";

export const EXPENSES_TUTORIAL_STEPS: Record<ExpensesTutorialId, ExpensesTutorialStep[]> = {
    jelajah_pengeluaran: JELAJAH_PENGELUARAN_TUTORIAL_STEPS,
    catat_pengeluaran: CATAT_PENGELUARAN_TUTORIAL_STEPS,
    edit_pengeluaran: EDIT_PENGELUARAN_TUTORIAL_STEPS,
    kelola_kategori: KELOLA_KATEGORI_TUTORIAL_STEPS,
};
