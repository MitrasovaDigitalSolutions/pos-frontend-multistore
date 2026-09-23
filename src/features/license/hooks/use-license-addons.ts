import { useState, useMemo } from "react";
import {
    ADDON_LABELS,
    ADDON_METADATA,
} from "../constants/license-constants";

export interface PurchasedAddonItem {
    code: string;
    nama: string;
    description: string;
    menuPaths: string[];
}

export function useLicenseAddons(activeAddons: string[]) {
    const [searchQuery, setSearchQuery] = useState("");

    // Parse active/purchased add-on items with metadata
    const purchasedAddons = useMemo<PurchasedAddonItem[]>(() => {
        return activeAddons.map((code) => {
            const meta = ADDON_METADATA[code];
            return {
                code,
                nama: meta?.nama ?? ADDON_LABELS[code] ?? code,
                description:
                    meta?.description ??
                    "Add-on operasional aktif untuk instance ini.",
                menuPaths: meta?.menuPaths ?? [],
            };
        });
    }, [activeAddons]);

    // Filter by name, code, description, or menu access path
    const filteredAddons = useMemo<PurchasedAddonItem[]>(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return purchasedAddons;

        return purchasedAddons.filter((addon) => {
            return (
                addon.nama.toLowerCase().includes(q) ||
                addon.code.toLowerCase().includes(q) ||
                addon.description.toLowerCase().includes(q) ||
                addon.menuPaths.some((p) => p.toLowerCase().includes(q))
            );
        });
    }, [purchasedAddons, searchQuery]);

    return {
        purchasedAddons,
        filteredAddons,
        searchQuery,
        setSearchQuery,
    };
}
