import type { Product } from "@/features/master/products/types";
import type { BomComponentType } from "../../bom-component-types/types";

export interface ProductBomItem {
    uid?: string;
    product_uid?: string;
    material_product_uid: string;
    component_type_uid?: string | null;
    kuantitas_standar: number;
    tipe_komponen?: string | null;
    toleransi_waste_pct?: number;
    catatan?: string | null;
    material_product?: Product;
    component_type?: BomComponentType;
}

export interface ProductBomResponse {
    product_uid: string;
    product_nama: string;
    is_raw_material: boolean;
    boms: ProductBomItem[];
}

export interface CopyBomPayload {
    source_product_uid: string;
    ratio?: number;
}
