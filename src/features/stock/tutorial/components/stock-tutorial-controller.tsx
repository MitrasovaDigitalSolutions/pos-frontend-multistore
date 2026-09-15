"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useStockTutorial } from "../hooks/use-stock-tutorial";
import { StockTutorialTooltip } from "./stock-tutorial-tooltip";
import { StockTutorialCursor } from "./stock-tutorial-cursor";
import { StockTutorialMenuDialog } from "./stock-tutorial-menu-dialog";

export function StockTutorialController() {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useStockTutorial();

    return (
        <>
            {/* Joyride Tour Engine for Stock Opname Module */}
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "stock-opname-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={StockTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                        spotlightPadding: 6,
                    }}
                />
            )}

            {/* Virtual Animated Mouse Cursor */}
            <StockTutorialCursor />

            {/* Tutorial Selection Dialog */}
            <StockTutorialMenuDialog />
        </>
    );
}
