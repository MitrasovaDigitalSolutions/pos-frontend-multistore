"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Joyride } from "react-joyride";
import { useCashTutorial } from "../hooks/use-cash-tutorial";
import { CashTutorialTooltip } from "./cash-tutorial-tooltip";
import { CashTutorialCursor } from "./cash-tutorial-cursor";
import { CashTutorialMenuDialog } from "./cash-tutorial-menu-dialog";
import type { CashTutorialId } from "../types/cash-tutorial";

const isCashIndex = (p: string) => p === "/admin/cash-accounts" || p === "/admin/cash-accounts/";

/**
 * Route prefix tempat setiap flow tutorial Kas & Bank boleh berjalan. Mencegah
 * Joyride mencari target yang salah saat user berpindah halaman.
 */
const CASH_TUTORIAL_ROUTE_MATCHERS: Record<CashTutorialId, (pathname: string) => boolean> = {
    jelajah_kas: (p) => isCashIndex(p),
    tambah_akun_kas: (p) => isCashIndex(p),
    mutasi_kas: (p) => isCashIndex(p),
    transfer_kas: (p) => isCashIndex(p),
    kelola_akun_kas: (p) => isCashIndex(p),
};

export function CashTutorialController() {
    const pathname = usePathname();
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useCashTutorial();

    const isTutorialAllowed = useMemo(() => {
        if (!activeTutorial || !pathname) return false;
        return CASH_TUTORIAL_ROUTE_MATCHERS[activeTutorial](pathname);
    }, [activeTutorial, pathname]);

    const shouldRun = isRunning && isTutorialAllowed && joyrideSteps.length > 0;

    return (
        <>
            {shouldRun && (
                <Joyride
                    key={activeTutorial || "cash-tutorial"}
                    steps={joyrideSteps}
                    run={shouldRun}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={CashTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <CashTutorialCursor />
            <CashTutorialMenuDialog />
        </>
    );
}
