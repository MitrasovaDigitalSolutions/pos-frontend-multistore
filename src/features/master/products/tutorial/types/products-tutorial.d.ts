import type { Product } from "@/features/master/products/types";

export type ProductsTutorialId =
    | "tambah_produk"
    | "edit_produk"
    | "hapus_produk"
    | "filter_produk";

export interface ProductsTutorialAutoFillField {
    target: string;
    value: string;
}

export interface ProductsTutorialAutoFill {
    label?: string;
    target?: string;
    value?: string;
    fields?: ProductsTutorialAutoFillField[];
}

export interface ProductsTutorialStep {
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto" | "center";
    disableBeacon?: boolean;
    spotlightClicks?: boolean;
    autoFill?: ProductsTutorialAutoFill;
}

export interface ProductsTutorialMeta {
    id: ProductsTutorialId;
    title: string;
    description: string;
    category: string;
    stepCount: number;
    badge?: string;
    isAvailable?: boolean;
}
