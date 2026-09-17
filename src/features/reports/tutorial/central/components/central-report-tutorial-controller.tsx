"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Joyride } from "react-joyride";
import { useCentralReportTutorial } from "../hooks/use-central-report-tutorial";
import { CentralReportTutorialTooltip } from "./central-report-tutorial-tooltip";
import { CentralReportTutorialCursor } from "./central-report-tutorial-cursor";
import { CentralReportTutorialDialog } from "./central-report-tutorial-dialog";

export function CentralReportTutorialController() {
    const pathname = usePathname();
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useCentralReportTutorial();

    const isTutorialAllowed = useMemo(() => {
        if (!activeTutorial || !pathname) return false;
        return pathname.includes("/admin/reports/central");
    }, [activeTutorial, pathname]);

    const shouldRun = isRunning && isTutorialAllowed && joyrideSteps.length > 0;

    return (
        <>
            {shouldRun && (
                <Joyride
                    key="central-report-tutorial"
                    steps={joyrideSteps}
                    run={shouldRun}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={CentralReportTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <CentralReportTutorialCursor />
            <CentralReportTutorialDialog />
        </>
    );
}
