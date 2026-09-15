"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useCoaTutorial, type CoaTutorialControls } from "../hooks/use-coa-tutorial";
import { CoaTutorialTooltip } from "./coa-tutorial-tooltip";
import { CoaTutorialCursor } from "./coa-tutorial-cursor";
import { CoaTutorialMenuDialog } from "./coa-tutorial-menu-dialog";

export type CoaTutorialControllerProps = CoaTutorialControls;

export function CoaTutorialController(props: CoaTutorialControllerProps) {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useCoaTutorial(props);

    return (
        <>
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "coa-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={CoaTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <CoaTutorialCursor />
            <CoaTutorialMenuDialog />
        </>
    );
}
