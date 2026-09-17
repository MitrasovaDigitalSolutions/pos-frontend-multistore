"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useStockTutorialStore } from "@/stores/stock-tutorial-store";

export function StockTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useStockTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
