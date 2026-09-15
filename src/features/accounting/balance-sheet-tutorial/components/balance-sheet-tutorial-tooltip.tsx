"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useBalanceSheetTutorialStore } from "@/stores/balance-sheet-tutorial-store";

export function BalanceSheetTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useBalanceSheetTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
