export type SettingsTutorialId =
    | "ubah_identitas_toko"
    | "atur_ppn_poin"
    | "atur_hpp_cabang"
    | "atur_kas"
    | "atur_printer";

export interface SettingsTutorialAutoFillField {
    target: string;
    value: string | number;
}

export interface SettingsTutorialAutoFill {
    label?: string;
    target?: string;
    value?: string | number;
    fields?: SettingsTutorialAutoFillField[];
}

export interface SettingsTutorialStep {
    target: string;
    title: string;
    content: string;
    tabId: "profile" | "finance" | "inventory" | "cash" | "printer";
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    autoFill?: SettingsTutorialAutoFill;
    overlayNav?: boolean;
    variant?: "tooltip" | "overlay_nav" | "banner";
}

export interface SettingsTutorialMeta {
    id: SettingsTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    adminOnly?: boolean;
    isAvailable?: boolean;
}
