import type { CartItem, HoldTransaction } from "@/features/checkout/types";
import type { Member } from "@/features/master/members/types";

export type TutorialId =
    | "sesi_kasir"
    | "transaksi_kasir"
    | "hutang_member"
    | "hold_recall_void"
    | "transaksi_offline"
    | "cetak_ulang_struk";

export type TutorialAction =
    | { type: "inject_cart"; items: CartItem[] }
    | { type: "inject_member"; member: Member }
    | { type: "clear_member" }
    | { type: "set_discount"; discountType: "nominal" | "percent"; value: number }
    | { type: "set_nama"; nama: string }
    | { type: "click"; target: string }
    | { type: "type_text"; target: string; text: string }
    | { type: "open_dialog"; dialog: "pay" | "hold_list" | "cash_drawer" | "reprint" }
    | { type: "close_dialog"; dialog: "pay" | "hold_list" | "cash_drawer" | "reprint" }
    | { type: "wait"; ms: number }
    | { type: "clear_cart" }
    | { type: "inject_hold"; hold: HoldTransaction }
    | { type: "sequence"; actions: TutorialAction[] };

export interface TutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    action?: TutorialAction;
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
}

export interface TutorialMeta {
    id: TutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
}

export interface TutorialPreSnapshot {
    cart: CartItem[];
    selectedMember: Member | null;
    discountType: "nominal" | "percent";
    discountValue: number;
    namaTransaksi: string;
    holdList: HoldTransaction[];
}
