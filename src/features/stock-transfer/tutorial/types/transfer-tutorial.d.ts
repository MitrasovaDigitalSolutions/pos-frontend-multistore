import type { RequestLineItem } from "@/features/request-transfer/schemas/request-transfer-schema";
import type { TransferItem } from "@/features/stock-transfer/components/create/transfer-items-section";

export type TransferTutorialId =
    | "request_transfer_create"
    | "request_transfer_incoming"
    | "stock_transfer_create"
    | "stock_transfer_receive"
    | "stock_transfer_validation";

export type TransferTutorialAction =
    | { type: "inject_items"; items: RequestLineItem[] | TransferItem[] }
    | { type: "clear_items" }
    | { type: "set_field"; field: string; value: unknown }
    | { type: "type_text"; target: string; text: string }
    | { type: "clear_input"; target: string }
    | { type: "click"; target: string }
    | { type: "navigate"; url: string }
    | { type: "wait"; ms: number }
    | { type: "sequence"; actions: TransferTutorialAction[] };

export interface TransferTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    action?: TransferTutorialAction;
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    variant?: "tooltip" | "overlay_nav" | "banner";
    overlayNav?: boolean;
}

export interface TransferTutorialPreSnapshot {
    requestTo?: string;
    supplierUid?: string;
    supplierSalesUid?: string | null;
    destinationUid?: string;
    catatan: string;
    items?: RequestLineItem[];
    stockItems?: TransferItem[];
}

export interface TransferTutorialMeta {
    id: TransferTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
