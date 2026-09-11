"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useCheckoutTutorial } from "../hooks/use-checkout-tutorial";
import { TutorialTooltip } from "./tutorial-tooltip";
import { AnimatedCursor } from "./animated-cursor";
import { TutorialMenuDialog } from "./tutorial-menu-dialog";
import type { TutorialContextControls } from "../hooks/tutorial-action-executor";

type CheckoutTutorialControllerProps = TutorialContextControls;

export function CheckoutTutorialController(props: CheckoutTutorialControllerProps) {
    const {
        activeTutorial,
        isRunning,
        joyrideSteps,
        handleJoyrideEvent,
    } = useCheckoutTutorial(props);

    return (
        <>
            {/* Joyride Tour Engine */}
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "checkout-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    continuous
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={TutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            {/* Virtual Animated Mouse Cursor */}
            <AnimatedCursor />

            {/* Tutorial Selection Dialog */}
            <TutorialMenuDialog />
        </>
    );
}
