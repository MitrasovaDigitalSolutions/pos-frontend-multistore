"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Joyride } from "react-joyride";
import { useExpensesTutorial } from "../hooks/use-expenses-tutorial";
import { ExpensesTutorialTooltip } from "./expenses-tutorial-tooltip";
import { ExpensesTutorialCursor } from "./expenses-tutorial-cursor";
import { ExpensesTutorialMenuDialog } from "./expenses-tutorial-menu-dialog";
import type { ExpensesTutorialId } from "../types/expenses-tutorial";

const isExpensesIndex = (p: string) => p === "/admin/expenses" || p === "/admin/expenses/";

/**
 * Route prefix tempat setiap flow tutorial Pengeluaran boleh berjalan. Mencegah
 * Joyride mencari target yang salah saat user berpindah halaman.
 */
const EXPENSES_TUTORIAL_ROUTE_MATCHERS: Record<ExpensesTutorialId, (pathname: string) => boolean> = {
    jelajah_pengeluaran: (p) => isExpensesIndex(p),
    catat_pengeluaran: (p) => isExpensesIndex(p),
    edit_pengeluaran: (p) => isExpensesIndex(p),
    kelola_kategori: (p) => p.includes("/admin/expenses/categories"),
};

export function ExpensesTutorialController() {
    const pathname = usePathname();
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useExpensesTutorial();

    const isTutorialAllowed = useMemo(() => {
        if (!activeTutorial || !pathname) return false;
        return EXPENSES_TUTORIAL_ROUTE_MATCHERS[activeTutorial](pathname);
    }, [activeTutorial, pathname]);

    const shouldRun = isRunning && isTutorialAllowed && joyrideSteps.length > 0;

    return (
        <>
            {shouldRun && (
                <Joyride
                    key={activeTutorial || "expenses-tutorial"}
                    steps={joyrideSteps}
                    run={shouldRun}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={ExpensesTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <ExpensesTutorialCursor />
            <ExpensesTutorialMenuDialog />
        </>
    );
}
