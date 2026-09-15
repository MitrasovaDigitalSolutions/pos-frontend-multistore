"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useTransferTutorial } from "../hooks/use-transfer-tutorial";
import { TransferTutorialTooltip } from "./transfer-tutorial-tooltip";
import { TransferTutorialCursor } from "./transfer-tutorial-cursor";
import { TransferTutorialMenuDialog } from "./transfer-tutorial-menu-dialog";

export function TransferTutorialController() {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useTransferTutorial();

    return (
        <>
            {/* Joyride Tour Engine for Transfer Module */}
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "transfer-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={TransferTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                        spotlightPadding: 6,
                    }}
                />
            )}

            {/* Virtual Animated Mouse Cursor */}
            <TransferTutorialCursor />

            {/* Tutorial Selection Dialog */}
            <TransferTutorialMenuDialog />
        </>
    );
}
