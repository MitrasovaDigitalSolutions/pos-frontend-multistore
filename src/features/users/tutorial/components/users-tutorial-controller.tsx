"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useUsersTutorial, type UsersTutorialControls } from "../hooks/use-users-tutorial";
import { useUsersTutorialStore } from "@/stores/users-tutorial-store";
import { UsersTutorialTooltip } from "./users-tutorial-tooltip";
import { UsersTutorialCursor } from "./users-tutorial-cursor";
import { UsersTutorialMenuDialog } from "./users-tutorial-menu-dialog";

export type UsersTutorialControllerProps = UsersTutorialControls;

export function UsersTutorialController(props: UsersTutorialControllerProps) {
    const activeTutorial = useUsersTutorialStore((state) => state.activeTutorial);
    const {
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useUsersTutorial(props);

    return (
        <>
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "users-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={UsersTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <UsersTutorialCursor />
            <UsersTutorialMenuDialog />
        </>
    );
}
