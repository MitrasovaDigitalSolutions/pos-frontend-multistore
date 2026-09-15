"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Joyride } from "react-joyride";
import { useHutangTutorial } from "../hooks/use-hutang-tutorial";
import { HutangTutorialTooltip } from "./hutang-tutorial-tooltip";
import { HutangTutorialCursor } from "./hutang-tutorial-cursor";
import { HutangTutorialMenuDialog } from "./hutang-tutorial-menu-dialog";
import type { HutangTutorialId } from "../types/hutang-tutorial";

/**
 * Route prefix tempat setiap flow tutorial Hutang boleh berjalan. Mencegah
 * Joyride mencari target yang salah saat user berpindah halaman.
 */
const HUTANG_TUTORIAL_ROUTE_MATCHERS: Record<HutangTutorialId, (pathname: string) => boolean> = {
    jelajah_hutang_member: (p) => p.includes("/admin/debts/member") && !p.includes("member-payments"),
    jelajah_hutang_sales: (p) => /\/admin\/debts\/sales\/?$/.test(p),
    jelajah_hutang_supplier: (p) => /\/admin\/debts\/sales\/[^/]+/.test(p),
    jelajah_pembayaran_member: (p) => p.includes("/admin/debts/member-payments"),
};

export function HutangTutorialController() {
    const pathname = usePathname();
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useHutangTutorial();

    const isTutorialAllowed = useMemo(() => {
        if (!activeTutorial || !pathname) return false;
        return HUTANG_TUTORIAL_ROUTE_MATCHERS[activeTutorial](pathname);
    }, [activeTutorial, pathname]);

    const shouldRun = isRunning && isTutorialAllowed && joyrideSteps.length > 0;

    return (
        <>
            {shouldRun && (
                <Joyride
                    key={activeTutorial || "hutang-tutorial"}
                    steps={joyrideSteps}
                    run={shouldRun}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={HutangTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <HutangTutorialCursor />
            <HutangTutorialMenuDialog />
        </>
    );
}
