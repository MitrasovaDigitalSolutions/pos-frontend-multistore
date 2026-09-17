"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useExpensesTutorialStore } from "@/stores/expenses-tutorial-store";

export function ExpensesTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useExpensesTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
