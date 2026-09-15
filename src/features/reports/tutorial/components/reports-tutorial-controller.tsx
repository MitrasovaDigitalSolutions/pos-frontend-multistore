"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Joyride } from "react-joyride";
import { useReportsTutorial } from "../hooks/use-reports-tutorial";
import { ReportsTutorialTooltip } from "./reports-tutorial-tooltip";
import { ReportsTutorialCursor } from "./reports-tutorial-cursor";
import { ReportsTutorialMenuDialog } from "./reports-tutorial-menu-dialog";
import type { ReportsTutorialId } from "../types/reports-tutorial";

/**
 * Route prefix tempat setiap flow tutorial Laporan boleh berjalan. Mencegah
 * Joyride mencari target yang salah saat user berpindah halaman.
 */
const REPORTS_TUTORIAL_ROUTE_MATCHERS: Record<ReportsTutorialId, (pathname: string) => boolean> = {
    jelajah_laba_rugi: (p) => p.includes("/admin/reports/laba-rugi"),
    jelajah_penjualan: (p) => p.includes("/admin/reports/sales") && !p.includes("/by-category"),
    jelajah_kategori: (p) => p.includes("/admin/reports/sales/by-category"),
    jelajah_pembelian: (p) => p.includes("/admin/reports/pembelian"),
    jelajah_pengeluaran: (p) => p.includes("/admin/reports/pengeluaran"),
};

export function ReportsTutorialController() {
    const pathname = usePathname();
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useReportsTutorial();

    const isTutorialAllowed = useMemo(() => {
        if (!activeTutorial || !pathname) return false;
        return REPORTS_TUTORIAL_ROUTE_MATCHERS[activeTutorial](pathname);
    }, [activeTutorial, pathname]);

    const shouldRun = isRunning && isTutorialAllowed && joyrideSteps.length > 0;

    return (
        <>
            {shouldRun && (
                <Joyride
                    key={activeTutorial || "reports-tutorial"}
                    steps={joyrideSteps}
                    run={shouldRun}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={ReportsTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <ReportsTutorialCursor />
            <ReportsTutorialMenuDialog />
        </>
    );
}
