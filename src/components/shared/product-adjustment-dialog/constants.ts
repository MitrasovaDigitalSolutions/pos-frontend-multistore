import type { AdjustmentElementIds } from "./types";

export const QUICK_REASONS = [
    "Koreksi Stok Fisik",
    "Barang Rusak / Cacat",
    "Barang Kadaluarsa",
    "Selisih Opname",
    "Bonus Supplier",
    "Barang Hilang",
] as const;

export const DEFAULT_ADJUSTMENT_ELEMENT_IDS: Required<AdjustmentElementIds> = {
    card: "adjustment-selected-product-card",
    quantityField: "adjustment-quantity-field",
    quantityInput: "adjustment-quantity-input",
    reasonField: "adjustment-reason-field",
    reasonInput: "adjustment-reason-input",
    submitButton: "btn-submit-adjustment",
};
