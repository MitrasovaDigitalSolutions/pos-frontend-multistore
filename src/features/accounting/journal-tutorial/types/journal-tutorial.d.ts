export type JournalTutorialId =
    | "buku_besar"
    | "list_jurnal"
    | "buat_jurnal";

export interface JournalTutorialAutoFillField {
    target: string;
    value: string;
}

export interface JournalTutorialAutoFill {
    label?: string;
    target?: string;
    value?: string;
    fillIfEmpty?: boolean;
    fields?: JournalTutorialAutoFillField[];
}

export type JournalTutorialSimulateClick = { selector: string } | string;

export interface JournalTutorialStep {
    id?: string;
    target: string;
    fallbackTarget?: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto";
    showNext?: boolean;
    showBack?: boolean;
    isLastStep?: boolean;
    nextLabel?: string;
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    autoFill?: JournalTutorialAutoFill;
    simulateClick?: JournalTutorialSimulateClick;
    navigate?: string;
    overlayNav?: boolean;
    waitForElement?: string;
    variant?: "tooltip" | "overlay_nav" | "banner";
    skipScroll?: boolean;
}

export interface JournalTutorialMeta {
    id: JournalTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
