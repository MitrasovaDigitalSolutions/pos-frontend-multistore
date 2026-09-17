export type SalesTutorialId = "cash_drawer" | "transactions_list";

export interface SalesTutorialStepMeta {
    id: SalesTutorialId;
    title: string;
    description: string;
    badge: string;
    duration: string;
    stepCount: number;
    isAvailable?: boolean;
}

export type SalesTutorialAction =
    | { type: "click_element"; selector: string }
    | { type: "type_input"; selector: string; text: string }
    | { type: "highlight_only"; selector: string }
    | { type: "scroll_into_view"; selector: string };

export interface SalesJoyrideStep {
    target: string;
    fallbackTarget?: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "center" | "auto";
    disableBeacon?: boolean;
    disableOverlayClose?: boolean;
    spotlightPadding?: number;
    action?: SalesTutorialAction;
}

export interface SalesTutorialPreSnapshot {
    pathname: string;
    searchQuery?: string;
}
