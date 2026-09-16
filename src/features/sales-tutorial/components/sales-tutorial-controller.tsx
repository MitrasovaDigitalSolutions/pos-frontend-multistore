"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useSalesTutorial } from "../hooks/use-sales-tutorial";
import { SalesTutorialTooltip } from "./sales-tutorial-tooltip";
import { SalesTutorialCursor } from "./sales-tutorial-cursor";
import { SalesTutorialMenuDialog } from "./sales-tutorial-menu-dialog";

export function SalesTutorialController() {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useSalesTutorial();

    return (
        <>
            {/* Joyride Tour Engine for Sales Module */}
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "sales-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={SalesTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                        spotlightPadding: 6,
                    }}
                />
            )}

            {/* Virtual Animated Mouse Cursor */}
            <SalesTutorialCursor />

            {/* Tutorial Selection Dialog */}
            <SalesTutorialMenuDialog />
        </>
    );
}
