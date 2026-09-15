import React from "react";
import type { Opname, OpnameItem } from "../../types";

export type StockTutorialId = "stock_opname";
export type StockTutorialBranch = "excel" | "manual";

export type StockTutorialAction =
    | { type: "open_dialog"; dialog: "opname_create" | "finalize" }
    | { type: "close_dialog" }
    | { type: "set_dialog_tab"; tab: "import" | "manual" }
    | { type: "set_mock_excel_file" }
    | { type: "type_text"; target: string; text: string }
    | { type: "click"; target: string }
    | { type: "navigate"; url: string }
    | { type: "wait"; ms: number }
    | { type: "inject_mock_item"; item?: OpnameItem }
    | { type: "sequence"; actions: StockTutorialAction[] };

export interface StockTutorialStep {
    target: string;
    title: string;
    content: React.ReactNode;
    placement?: "top" | "bottom" | "left" | "right" | "center" | "auto";
    action?: StockTutorialAction;
    overlayNav?: boolean;
    variant?: "tooltip" | "overlay_nav" | "banner";
}

export interface StockTutorialPreSnapshot {
    opname?: Opname | null;
    items?: OpnameItem[];
}

export interface StockTutorialMeta {
    id: StockTutorialId;
    title: string;
    description: string;
    badge: string;
    duration: string;
    stepCount: number;
    isAvailable: boolean;
}

