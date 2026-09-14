export type AuditTutorialId =
    | "inspeksi_aktivitas"
    | "filter_aktivitas"
    | "mode_linimasa";

export interface AuditTutorialAutoFillField {
    target: string;
    value: string;
}

export interface AuditTutorialAutoFill {
    label?: string;
    target?: string;
    value?: string;
    fields?: AuditTutorialAutoFillField[];
}

export interface AuditTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    autoFill?: AuditTutorialAutoFill;
}

export interface AuditTutorialMeta {
    id: AuditTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
