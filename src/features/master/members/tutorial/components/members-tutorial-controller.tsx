"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useMembersTutorial, type MembersTutorialControls } from "../hooks/use-members-tutorial";
import { MembersTutorialTooltip } from "./members-tutorial-tooltip";
import { MembersTutorialCursor } from "./members-tutorial-cursor";
import { MembersTutorialMenuDialog } from "./members-tutorial-menu-dialog";

export type MembersTutorialControllerProps = MembersTutorialControls;

export function MembersTutorialController(props: MembersTutorialControllerProps) {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useMembersTutorial(props);

    return (
        <>
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "members-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={MembersTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <MembersTutorialCursor />
            <MembersTutorialMenuDialog />
        </>
    );
}
