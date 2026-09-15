"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Joyride } from "react-joyride";
import { useBalanceSheetTutorial } from "../hooks/use-balance-sheet-tutorial";
import { BalanceSheetTutorialTooltip } from "./balance-sheet-tutorial-tooltip";
import { BalanceSheetTutorialCursor } from "./balance-sheet-tutorial-cursor";
import { BalanceSheetTutorialMenuDialog } from "./balance-sheet-tutorial-menu-dialog";

export function BalanceSheetTutorialController() {
    const pathname = usePathname();
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useBalanceSheetTutorial();

    // Route guard: allow balance sheet tutorial on balance-sheet route
    const isTutorialAllowed = useMemo(() => {
        if (!activeTutorial || !pathname) return false;
        return pathname.includes("balance-sheet");
    }, [activeTutorial, pathname]);

    const shouldRun = isRunning && isTutorialAllowed && joyrideSteps.length > 0;

    return (
        <>
            {shouldRun && (
                <Joyride
                    key={activeTutorial || "balance-sheet-tutorial"}
                    steps={joyrideSteps}
                    run={shouldRun}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={BalanceSheetTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <BalanceSheetTutorialCursor />
            <BalanceSheetTutorialMenuDialog />
        </>
    );
}
