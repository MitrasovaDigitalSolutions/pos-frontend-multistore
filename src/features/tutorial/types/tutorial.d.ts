import type { CartItem, HoldTransaction } from "@/features/checkout/types";
import type { Member } from "@/features/master/members/types";

export type TutorialId =
    | "sesi_kasir"
    | "transaksi_kasir"
    | "hutang_member"
    | "hold_recall_void"
    | "transaksi_offline"
    | "cetak_ulang_struk";

export type TutorialDialogType =
    | "pay"
    | "hold_list"
    | "cash_drawer"
    | "reprint"
    | "offline"
    | "pay_debt"
    | "void_confirm";

export type TutorialAction =
    | { type: "inject_cart"; items: CartItem[] }
    | { type: "inject_member"; member: Member }
    | { type: "clear_member" }
    | { type: "set_discount"; discountType: "nominal" | "percent"; value: number }
    | { type: "set_nama"; nama: string }
    | { type: "click"; target: string }
    | { type: "type_text"; target: string; text: string }
    | { type: "open_dialog"; dialog: TutorialDialogType }
    | { type: "close_dialog"; dialog: TutorialDialogType }
    | { type: "wait"; ms: number }
    | { type: "clear_cart" }
    | { type: "clear_input"; target: string }
    | { type: "inject_hold"; hold: HoldTransaction }
    | { type: "clear_hold" }
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
