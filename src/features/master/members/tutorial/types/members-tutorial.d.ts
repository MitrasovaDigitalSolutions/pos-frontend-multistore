export type MembersTutorialId =
    | "tambah_member"
    | "edit_member"
    | "sesuaikan_poin"
    | "hapus_member"
    | "filter_member";

export interface MembersTutorialAutoFillField {
    target: string;
    value: string;
}

export interface MembersTutorialAutoFill {
    label?: string;
    target?: string;
    value?: string;
    fields?: MembersTutorialAutoFillField[];
}

export interface MembersTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    autoFill?: MembersTutorialAutoFill;
}

export interface MembersTutorialMeta {
    id: MembersTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
