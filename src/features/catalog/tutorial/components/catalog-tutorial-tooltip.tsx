"use client";

import React from "react";
import type { TooltipRenderProps } from "react-joyride";
import { CompactTutorialTooltip } from "@/components/shared/feature-tutorial-tooltip";
import { useCatalogTutorialStore } from "@/stores/catalog-tutorial-store";

export function CatalogTutorialTooltip(props: TooltipRenderProps) {
    const stopTutorial = useCatalogTutorialStore((state) => state.stopTutorial);

    return (
        <CompactTutorialTooltip
            {...props}
            onStop={stopTutorial}
        />
    );
}
