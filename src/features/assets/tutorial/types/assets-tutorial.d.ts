export type AssetTutorialId =
    | "catat_aset"
    | "edit_aset"
    | "susut_single"
    | "susut_bulk"
    | "detail_hapus"
    | "kategori_aset"
    | "jual_aset";

export type AssetTutorialAction =
    | { type: "type_text"; target: string; text: string; delay?: number }
    | { type: "set_field"; field: string; value: unknown }
    | { type: "wait"; ms: number }
    | { type: "sequence"; actions: AssetTutorialAction[] };

export interface AssetTutorialAutoFillField {
    target: string;
    value: string;
}

export interface AssetTutorialAutoFill {
    label?: string;
    target?: string;
    value?: string;
    fields?: AssetTutorialAutoFillField[];
}

export interface AssetTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    autoFill?: AssetTutorialAutoFill;
    action?: AssetTutorialAction;
    overlayNav?: boolean;
    variant?: "tooltip" | "overlay_nav" | "banner";
    skipScroll?: boolean;
}

export interface AssetTutorialMeta {
    id: AssetTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
