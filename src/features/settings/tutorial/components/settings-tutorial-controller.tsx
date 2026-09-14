"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useSettingsTutorial, type SettingsTutorialControls } from "../hooks/use-settings-tutorial";
import { SettingsTutorialTooltip } from "./settings-tutorial-tooltip";
import { SettingsTutorialCursor } from "./settings-tutorial-cursor";
import { SettingsTutorialMenuDialog } from "./settings-tutorial-menu-dialog";

export type SettingsTutorialControllerProps = SettingsTutorialControls;

export function SettingsTutorialController(props: SettingsTutorialControllerProps) {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useSettingsTutorial(props);

    return (
        <>
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "settings-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={SettingsTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <SettingsTutorialCursor />
            <SettingsTutorialMenuDialog />
        </>
    );
}
