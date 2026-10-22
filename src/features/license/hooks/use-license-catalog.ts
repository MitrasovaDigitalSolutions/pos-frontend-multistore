import { useState, useMemo, useCallback } from "react";
import type { CatalogProduct } from "../types";
import { ADDON_METADATA } from "../constants/license-constants";

export function useLicenseCatalog(
    catalog: CatalogProduct[] = [],
    activeAddons: string[] = []
) {
    const [orderOpen, setOrderOpen] = useState(false);
    const [selectedProductCode, setSelectedProductCode] = useState<string | undefined>();
    const [selectedAddonId, setSelectedAddonId] = useState<string | undefined>();
    const [billingView, setBillingView] = useState<"monthly" | "annual">("monthly");
    const [searchQuery, setSearchQuery] = useState("");

    // Fast O(1) set of lowercase owned addon codes for bug-free matching
    const activeAddonSet = useMemo(() => {
        const safe = Array.isArray(activeAddons) ? activeAddons : [];
        return new Set(safe.map((a) => a.toLowerCase().trim()));
    }, [activeAddons]);

    // Only select the POS product
    const posProduct = useMemo(() => {
        const safeCatalog = Array.isArray(catalog) ? catalog : [];
        return (
            safeCatalog.find(
                (p) =>
                    p?.code?.toLowerCase() === "pos" ||
                    p?.nama?.toLowerCase().includes("pos"),
            ) ?? safeCatalog[0]
        );
    }, [catalog]);

    const rawAddons = useMemo(() => {
        return posProduct?.addons ?? [];
    }, [posProduct]);

    // Lightweight search filter only: fast on low-spec devices
    const filteredAddons = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return rawAddons;

        return rawAddons.filter((addon) => {
            const codeLower = (addon.code || "").toLowerCase();
            const nameMatch = (addon.nama || "").toLowerCase().includes(query);
            const codeMatch = codeLower.includes(query);
            const descMatch = (addon.description || "").toLowerCase().includes(query);
            const meta = ADDON_METADATA[codeLower];
            const menuMatch = meta?.menuPaths?.some((p) => p.toLowerCase().includes(query));

            return nameMatch || codeMatch || descMatch || Boolean(menuMatch);
        });
    }, [rawAddons, searchQuery]);

    // Summary statistics for compact top chips
    const stats = useMemo(() => {
        const total = rawAddons.length;
        const owned = rawAddons.filter((a) =>
            activeAddonSet.has((a.code || "").toLowerCase())
        ).length;
        const available = Math.max(0, total - owned);

        return {
            total,
            owned,
            available,
            discountPercent: 16,
        };
    }, [rawAddons, activeAddonSet]);

    const resetSearch = useCallback(() => {
        setSearchQuery("");
    }, []);

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
        addons: rawAddons,
        filteredAddons,
        billingView,
        setBillingView,
        searchQuery,
        setSearchQuery,
        stats,
        resetSearch,
        activeAddonSet,
        orderOpen,
        setOrderOpen,
        selectedProductCode,
        selectedAddonId,
        openOrder,
        closeOrder,
    };
}
