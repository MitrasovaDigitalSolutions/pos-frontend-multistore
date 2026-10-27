"use client";

import {
    MedicineIngredientPicker,
    type MedicineIngredientPickerProps,
} from "@/components/shared/medicine-ingredient-picker";

export type CompoundingIngredientPickerProps = MedicineIngredientPickerProps;

export function CompoundingIngredientPicker(props: CompoundingIngredientPickerProps) {
    return <MedicineIngredientPicker {...props} />;
}
