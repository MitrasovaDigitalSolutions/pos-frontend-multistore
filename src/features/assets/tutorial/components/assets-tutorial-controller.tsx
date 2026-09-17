"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useAssetsTutorial, type AssetsTutorialControls } from "../hooks/use-assets-tutorial";
import { AssetsTutorialTooltip } from "./assets-tutorial-tooltip";
import { AssetsTutorialCursor } from "./assets-tutorial-cursor";
import { AssetsTutorialMenuDialog } from "./assets-tutorial-menu-dialog";

export type AssetsTutorialControllerProps = AssetsTutorialControls;

export function AssetsTutorialController(props: AssetsTutorialControllerProps) {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useAssetsTutorial(props);

    return (
        <>
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "assets-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    scrollToFirstStep={false}
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={AssetsTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            <AssetsTutorialCursor />
            <AssetsTutorialMenuDialog />
        </>
    );
}
