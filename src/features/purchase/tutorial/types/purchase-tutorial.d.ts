import type { PurchaseItemLocal } from "@/features/purchase/types";
import type { SavedHeaderData } from "@/stores/purchase-items-store";

export type PurchaseTutorialId =
    | "po_create"
    | "receiving_create"
    | "payment_create"
    | "return_create";

export type PurchaseSubmenu = "order" | "receiving" | "payment" | "return";

export type PurchaseTutorialAction =
    | { type: "inject_po_items"; items: PurchaseItemLocal[] }
    | { type: "clear_po_items" }
    | { type: "set_po_supplier"; supplier_uid: string; supplier_nama?: string }
    | { type: "set_po_date"; date: string }
    | { type: "set_po_notes"; notes: string }
    | { type: "type_text"; target: string; text: string }
    | { type: "clear_input"; target: string }
    | { type: "click"; target: string }
    | { type: "navigate"; url: string }
    | { type: "wait"; ms: number }
    | { type: "sequence"; actions: PurchaseTutorialAction[] };

export interface PurchaseTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    action?: PurchaseTutorialAction;
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
}

export interface PurchaseTutorialPreSnapshot {
    items: PurchaseItemLocal[];
    headerData: SavedHeaderData | null;
}

export interface PurchaseTutorialMeta {
    id: PurchaseTutorialId;
    submenu: PurchaseSubmenu;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
