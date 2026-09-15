"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useConsignmentTutorialStore } from "@/stores/consignment-tutorial-store";

export function ConsignmentTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useConsignmentTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
