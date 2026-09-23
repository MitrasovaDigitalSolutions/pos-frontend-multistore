import { useState, useMemo } from "react";
import type { CatalogProduct } from "../types";

export function useLicenseCatalog(catalog: CatalogProduct[]) {
    const [orderOpen, setOrderOpen] = useState(false);
    const [selectedProductCode, setSelectedProductCode] = useState<string | undefined>();
    const [selectedAddonId, setSelectedAddonId] = useState<string | undefined>();
    const [billingView, setBillingView] = useState<"monthly" | "annual">("monthly");

    // Only select the POS product
    const posProduct = useMemo(() => {
        return (
            catalog.find(
                (p) =>
                    p.code.toLowerCase() === "pos" ||
                    p.nama.toLowerCase().includes("pos"),
            ) ?? catalog[0]
        );
    }, [catalog]);

    const openOrder = (productCode: string, addonId?: string) => {
        setSelectedProductCode(productCode);
        setSelectedAddonId(addonId);
        setOrderOpen(true);
    };

    const closeOrder = () => {
        setOrderOpen(false);
        setSelectedAddonId(undefined);
    };

    return {
        posProduct,
        addons: posProduct?.addons ?? [],
        billingView,
        setBillingView,
        orderOpen,
        setOrderOpen,
        selectedProductCode,
        selectedAddonId,
        openOrder,
        closeOrder,
    };
}
