import { useState, useMemo } from "react";
import {
    ADDON_LABELS,
    ADDON_METADATA,
} from "../constants/license-constants";
import type { PurchasedAddonItem } from "../types";
import { useLicenseProrateQuery } from "../api/license-api";
import {
    buildProrateAddonsPayload,
    createProrateLookupMap,
} from "../utils/license-pricing";

export type { PurchasedAddonItem };

export interface UseLicenseAddonsReturn {
    purchasedAddons: PurchasedAddonItem[];
    filteredAddons: PurchasedAddonItem[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isProrateLoading: boolean;
}

export function useLicenseAddons(
    activeAddons: string[],
    isOperable: boolean = true
): UseLicenseAddonsReturn {
    const [searchQuery, setSearchQuery] = useState("");

    // Normalizing keys for local lookup against ADDON_METADATA
    const normalizedActiveAddons = useMemo(
        () => (activeAddons || []).map((code) => code.toLowerCase()),
        [activeAddons]
    );

    // Build uppercase and alphabetically sorted payload matching backend calculate contract
    const proratePayload = useMemo(
        () => buildProrateAddonsPayload(activeAddons),
        [activeAddons]
    );

    const { data: prorateData, isLoading: isProrateLoading } = useLicenseProrateQuery(
        {
            addons: proratePayload,
            with_renewal: false,
            renewal_period: "monthly",
        },
        {
            enabled: isOperable && proratePayload.length > 0,
            staleTime: 60_000,
        }
    );

    // Fast O(1) multi-cased lookup map for prorate responses
    const prorateMap = useMemo(() => {
        return createProrateLookupMap(prorateData?.items);
    }, [prorateData?.items]);

    // Parse active/purchased add-on items with metadata and accurate expiration from calculate endpoint
    const purchasedAddons = useMemo<PurchasedAddonItem[]>(() => {
        return normalizedActiveAddons.map((code) => {
            const meta = ADDON_METADATA[code];
            const prorateItem = prorateMap.get(code);

            return {
                code,
                nama:
                    meta?.nama ??
                    prorateItem?.name ??
                    ADDON_LABELS[code] ??
                    code,
                description:
                    meta?.description ??
                    "Add-on operasional aktif untuk instance ini.",
                menuPaths: meta?.menuPaths ?? [],
                expires_at: prorateItem?.current_expires_at ?? null,
                days_remaining: prorateItem?.current_remaining_days ?? null,
                is_currently_active: prorateItem?.is_currently_active ?? true,
            };
        });
    }, [normalizedActiveAddons, prorateMap]);

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
        isProrateLoading,
    };
}
