import type { CashTutorialId, CashTutorialStep } from "../types/cash-tutorial";
import { JELAJAH_KAS_TUTORIAL_STEPS } from "./jelajah-kas-tutorial-steps";
import { TAMBAH_AKUN_KAS_TUTORIAL_STEPS } from "./tambah-akun-kas-tutorial-steps";
import { MUTASI_KAS_TUTORIAL_STEPS } from "./mutasi-kas-tutorial-steps";
import { TRANSFER_KAS_TUTORIAL_STEPS } from "./transfer-kas-tutorial-steps";
import { KELOLA_AKUN_KAS_TUTORIAL_STEPS } from "./kelola-akun-kas-tutorial-steps";

export const CASH_TUTORIAL_STEPS: Record<CashTutorialId, CashTutorialStep[]> = {
    jelajah_kas: JELAJAH_KAS_TUTORIAL_STEPS,
    tambah_akun_kas: TAMBAH_AKUN_KAS_TUTORIAL_STEPS,
    mutasi_kas: MUTASI_KAS_TUTORIAL_STEPS,
    transfer_kas: TRANSFER_KAS_TUTORIAL_STEPS,
    kelola_akun_kas: KELOLA_AKUN_KAS_TUTORIAL_STEPS,
};
