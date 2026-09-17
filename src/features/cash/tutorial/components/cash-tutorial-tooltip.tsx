"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useCashTutorialStore } from "@/stores/cash-tutorial-store";

export function CashTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useCashTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
