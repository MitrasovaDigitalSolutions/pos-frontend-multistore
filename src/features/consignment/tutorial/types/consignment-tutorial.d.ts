import type { ConsignmentReceivingFormValues } from "../../schemas/consignment-schema";
import type { Product } from "@/features/master/products/types";

export type ConsignmentTutorialId = "consignment_create" | "consignment_payment";

export type ConsignmentTutorialAction =
    | { type: "inject_items"; items: ConsignmentReceivingFormValues["items"]; products: Product[] }
    | { type: "clear_items" }
    | { type: "set_field"; field: keyof ConsignmentReceivingFormValues; value: unknown }
    | { type: "inject_payment_mock" }
    | { type: "clear_payment_mock" }
    | { type: "open_payment_modal" }
    | { type: "close_payment_modal" }
    | { type: "set_payment_field"; field: string; value: unknown }
    | { type: "type_text"; target: string; text: string }
    | { type: "clear_input"; target: string }
    | { type: "click"; target: string }
    | { type: "navigate"; url: string }
    | { type: "wait"; ms: number }
    | { type: "sequence"; actions: ConsignmentTutorialAction[] };

export interface ConsignmentTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    action?: ConsignmentTutorialAction;
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    variant?: "tooltip" | "overlay_nav" | "banner";
    overlayNav?: boolean;
}

export interface ConsignmentTutorialPreSnapshot {
    formValues: ConsignmentReceivingFormValues;
    products: Product[];
}

export interface ConsignmentTutorialMeta {
    id: ConsignmentTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
