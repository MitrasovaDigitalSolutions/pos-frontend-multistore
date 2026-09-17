import type { SalesTutorialId, SalesJoyrideStep } from "../types/sales-tutorial";
import { CASH_DRAWER_TUTORIAL_STEPS } from "./cash-drawer-tutorial-steps";
import { TRANSACTIONS_TUTORIAL_STEPS } from "./transactions-tutorial-steps";

export { CASH_DRAWER_TUTORIAL_STEPS } from "./cash-drawer-tutorial-steps";
export { TRANSACTIONS_TUTORIAL_STEPS } from "./transactions-tutorial-steps";

export function getSalesTutorialSteps(id: SalesTutorialId): SalesJoyrideStep[] {
    switch (id) {
        case "cash_drawer":
            return CASH_DRAWER_TUTORIAL_STEPS;
        case "transactions_list":
            return TRANSACTIONS_TUTORIAL_STEPS;
        default:
            return [];
    }
}
