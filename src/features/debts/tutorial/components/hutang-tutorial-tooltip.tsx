"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useHutangTutorialStore } from "@/stores/hutang-tutorial-store";

export function HutangTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useHutangTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
