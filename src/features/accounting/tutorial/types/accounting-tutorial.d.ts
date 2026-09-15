export type AccountingTutorialId =
    | "tambah_akun"
    | "edit_akun"
    | "hapus_akun";

export interface AccountingTutorialAutoFillField {
    target: string;
    value: string;
}

export interface AccountingTutorialAutoFill {
    label?: string;
    target?: string;
    value?: string;
    fields?: AccountingTutorialAutoFillField[];
}

export interface AccountingTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto";
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    autoFill?: AccountingTutorialAutoFill;
    overlayNav?: boolean;
    variant?: "tooltip" | "overlay_nav" | "banner";
    skipScroll?: boolean;
}

export interface AccountingTutorialMeta {
    id: AccountingTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
