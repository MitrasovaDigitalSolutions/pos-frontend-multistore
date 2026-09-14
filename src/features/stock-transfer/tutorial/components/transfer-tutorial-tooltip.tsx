"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useTransferTutorialStore } from "@/stores/transfer-tutorial-store";

export function TransferTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useTransferTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
