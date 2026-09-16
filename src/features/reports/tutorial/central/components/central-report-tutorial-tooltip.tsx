"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useCentralReportTutorialStore } from "@/stores/central-report-tutorial-store";

export function CentralReportTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useCentralReportTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
