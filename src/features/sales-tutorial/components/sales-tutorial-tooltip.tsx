"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useSalesTutorialStore } from "@/stores/sales-tutorial-store";

export function SalesTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useSalesTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
