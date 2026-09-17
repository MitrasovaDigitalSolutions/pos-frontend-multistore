import type { HutangTutorialId, HutangTutorialStep } from "../types/hutang-tutorial";
import { JELAJAH_HUTANG_MEMBER_TUTORIAL_STEPS } from "./jelajah-hutang-member-tutorial-steps";
import { JELAJAH_HUTANG_SALES_TUTORIAL_STEPS } from "./jelajah-hutang-sales-tutorial-steps";
import { JELAJAH_HUTANG_SUPPLIER_TUTORIAL_STEPS } from "./jelajah-hutang-supplier-tutorial-steps";
import { JELAJAH_PEMBAYARAN_MEMBER_TUTORIAL_STEPS } from "./jelajah-pembayaran-member-tutorial-steps";

export const HUTANG_TUTORIAL_STEPS: Record<HutangTutorialId, HutangTutorialStep[]> = {
    jelajah_hutang_member: JELAJAH_HUTANG_MEMBER_TUTORIAL_STEPS,
    jelajah_hutang_sales: JELAJAH_HUTANG_SALES_TUTORIAL_STEPS,
    jelajah_hutang_supplier: JELAJAH_HUTANG_SUPPLIER_TUTORIAL_STEPS,
    jelajah_pembayaran_member: JELAJAH_PEMBAYARAN_MEMBER_TUTORIAL_STEPS,
};
