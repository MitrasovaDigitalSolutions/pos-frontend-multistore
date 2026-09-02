"use client";

import { RadioChips, type RadioChipOption } from "@/components/ui/radio-chips";
import { IconBox, IconPackage, IconTools } from "@tabler/icons-react";
import type { ProductType } from "../../hooks/use-product-form-dialog";

const PRODUCT_TYPE_OPTIONS: RadioChipOption[] = [
    { value: "finished_good", label: "Barang Jadi", icon: <IconPackage size={14} /> },
    { value: "raw_material", label: "Bahan Baku", icon: <IconBox size={14} /> },
    { value: "jasa", label: "Jasa", icon: <IconTools size={14} /> },
];

interface ProductTypeRadioGroupProps {
    productType: ProductType;
    onChange: (value: ProductType) => void;
    disabled?: boolean;
}

export function ProductTypeRadioGroup({
    productType,
    onChange,
    disabled = false,
}: ProductTypeRadioGroupProps) {
    return (
        <RadioChips
            label="Tipe Produk"
            options={PRODUCT_TYPE_OPTIONS}
            value={productType}
            onChange={(val) => onChange(val as ProductType)}
            disabled={disabled}
            variant="segmented"
            size="sm"
        />
    );
}
