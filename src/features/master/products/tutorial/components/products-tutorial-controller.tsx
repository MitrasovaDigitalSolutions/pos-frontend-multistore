"use client";

import React from "react";
import { Joyride } from "react-joyride";
import { useProductsTutorial, type ProductsTutorialControls } from "../hooks/use-products-tutorial";
import { ProductsTutorialTooltip } from "./products-tutorial-tooltip";
import { ProductsTutorialCursor } from "./products-tutorial-cursor";
import { ProductsTutorialMenuDialog } from "./products-tutorial-menu-dialog";

export type ProductsTutorialControllerProps = ProductsTutorialControls;

export function ProductsTutorialController(props: ProductsTutorialControllerProps) {
    const {
        activeTutorial,
        isRunning,
        stepIndex,
        joyrideSteps,
        handleJoyrideEvent,
    } = useProductsTutorial(props);

    return (
        <>
            {/* Joyride Tour Engine for Master Produk */}
            {isRunning && joyrideSteps.length > 0 && (
                <Joyride
                    key={activeTutorial || "products-tutorial"}
                    steps={joyrideSteps}
                    run={isRunning}
                    stepIndex={stepIndex}
                    continuous
                    onEvent={handleJoyrideEvent}
                    tooltipComponent={ProductsTutorialTooltip}
                    options={{
                        zIndex: 99999,
                        overlayColor: "rgba(15, 23, 42, 0.6)",
                        skipBeacon: true,
                    }}
                />
            )}

            {/* Virtual Animated Mouse Cursor */}
            <ProductsTutorialCursor />

            {/* Tutorial Selection Dialog */}
            <ProductsTutorialMenuDialog />
        </>
    );
}
