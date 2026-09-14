export type UsersTutorialId =
    | "tambah_karyawan"
    | "edit_karyawan"
    | "nonaktifkan_karyawan"
    | "filter_karyawan";

export interface UsersTutorialAutoFillField {
    target: string;
    value: string;
}

export interface UsersTutorialAutoFill {
    label?: string;
    target?: string;
    value?: string;
    fields?: UsersTutorialAutoFillField[];
}

export interface UsersTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    autoFill?: UsersTutorialAutoFill;
}

export interface UsersTutorialMeta {
    id: UsersTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
