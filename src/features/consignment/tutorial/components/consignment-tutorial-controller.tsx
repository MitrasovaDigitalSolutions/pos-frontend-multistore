"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useConsignmentTutorial } from "../hooks/use-consignment-tutorial";
import { ConsignmentTutorialTooltip } from "./consignment-tutorial-tooltip";
import { ConsignmentTutorialCursor } from "./consignment-tutorial-cursor";
import { ConsignmentTutorialMenuDialog } from "./consignment-tutorial-menu-dialog";

export function ConsignmentTutorialController() {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useConsignmentTutorial();

    return (
        <>
            {/* Joyride Tour Engine for Consignment */}
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "consignment-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={ConsignmentTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                        spotlightPadding: 6,
                    }}
                />
            )}

            {/* Virtual Animated Mouse Cursor */}
            <ConsignmentTutorialCursor />

            {/* Tutorial Selection Dialog */}
            <ConsignmentTutorialMenuDialog />
        </>
    );
}
