import type { JournalTutorialId, JournalTutorialStep } from "../types/journal-tutorial";
import { BUKU_BESAR_TUTORIAL_STEPS } from "./buku-besar-tutorial-steps";
import { LIST_JURNAL_TUTORIAL_STEPS } from "./list-jurnal-tutorial-steps";
import { BUAT_JURNAL_TUTORIAL_STEPS } from "./buat-jurnal-tutorial-steps";

export const JOURNAL_TUTORIAL_STEPS: Record<JournalTutorialId, JournalTutorialStep[]> = {
    buku_besar: BUKU_BESAR_TUTORIAL_STEPS,
    list_jurnal: LIST_JURNAL_TUTORIAL_STEPS,
    buat_jurnal: BUAT_JURNAL_TUTORIAL_STEPS,
};

export {
    BUKU_BESAR_TUTORIAL_STEPS,
    LIST_JURNAL_TUTORIAL_STEPS,
    BUAT_JURNAL_TUTORIAL_STEPS,
};
