"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { usePurchaseTutorial } from "../hooks/use-purchase-tutorial";
import { PurchaseTutorialTooltip } from "./purchase-tutorial-tooltip";
import { PurchaseTutorialCursor } from "./purchase-tutorial-cursor";
import { PurchaseTutorialMenuDialog } from "./purchase-tutorial-menu-dialog";

export function PurchaseTutorialController() {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = usePurchaseTutorial();

    return (
        <>
            {/* Joyride Tour Engine for Purchase */}
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "purchase-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={PurchaseTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            {/* Virtual Animated Mouse Cursor */}
            <PurchaseTutorialCursor />

            {/* Tutorial Selection Dialog */}
            <PurchaseTutorialMenuDialog />
        </>
    );
}
