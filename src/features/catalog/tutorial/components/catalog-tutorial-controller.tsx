"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Joyride } from "react-joyride";
import { useCatalogTutorial } from "../hooks/use-catalog-tutorial";
import { CatalogTutorialTooltip } from "./catalog-tutorial-tooltip";
import { CatalogTutorialCursor } from "./catalog-tutorial-cursor";
import { CatalogTutorialDialog } from "./catalog-tutorial-dialog";

export function CatalogTutorialController() {
    const pathname = usePathname();
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useCatalogTutorial();

    const isTutorialAllowed = useMemo(() => {
        if (!activeTutorial || !pathname) return false;
        return pathname.includes("/admin/catalog");
    }, [activeTutorial, pathname]);

    const joyrideOptions = useMemo(() => ({
        zIndex: 99999,
        overlayColor: "rgba(15, 23, 42, 0.6)",
        skipBeacon: true,
        skipScroll: true,
    }), []);

    const shouldRun = isRunning && isTutorialAllowed && joyrideSteps.length > 0;

    return (
        <>
            {shouldRun && (
                <Joyride
                    key="catalog-tutorial"
                    steps={joyrideSteps}
                    run={shouldRun}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={CatalogTutorialTooltip}
                    options={joyrideOptions}
                />
            )}

            <CatalogTutorialCursor />
            <CatalogTutorialDialog />
        </>
    );
}
