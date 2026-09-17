import type { CentralReportTutorialId } from "@/stores/central-report-tutorial-store";

export type { CentralReportTutorialId };

export type CentralReportTutorialSimulateClick = { selector: string } | string;

export interface CentralReportTutorialStep {
    id?: string;
    target: string;
    fallbackTarget?: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    showNext?: boolean;
    showBack?: boolean;
    isLastStep?: boolean;
    nextLabel?: string;
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    simulateClick?: CentralReportTutorialSimulateClick;
    navigate?: string;
    overlayNav?: boolean;
    waitForElement?: string;
    variant?: "tooltip" | "overlay_nav" | "banner";
    skipScroll?: boolean;
}

export interface CentralReportTutorialMeta {
    id: CentralReportTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
