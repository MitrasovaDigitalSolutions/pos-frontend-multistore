"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useTutorialStore } from "@/stores/tutorial-store";

export function TutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
