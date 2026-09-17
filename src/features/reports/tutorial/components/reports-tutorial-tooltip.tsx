"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useReportsTutorialStore } from "@/stores/reports-tutorial-store";

export function ReportsTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useReportsTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
