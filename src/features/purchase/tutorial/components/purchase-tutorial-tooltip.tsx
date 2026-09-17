"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { usePurchaseTutorialStore } from "@/stores/purchase-tutorial-store";

export function PurchaseTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = usePurchaseTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
