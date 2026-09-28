import { useState, useMemo } from "react";
import {
    ADDON_LABELS,
    ADDON_METADATA,
} from "../constants/license-constants";
import type { ProrateItem } from "../types";
import { useLicenseProrateQuery } from "../api/license-api";

export interface PurchasedAddonItem {
    code: string;
    nama: string;
    description: string;
    menuPaths: string[];
    expires_at?: string | null;
    days_remaining?: number | null;
    is_currently_active?: boolean;
}

export function useLicenseAddons(
    activeAddons: string[],
    isOperable: boolean = true
) {
    const [searchQuery, setSearchQuery] = useState("");

    const proratePayload = useMemo(
        () => activeAddons.map((code) => ({ id: code })),
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

    const prorateMap = useMemo(() => {
        const map = new Map<string, ProrateItem>();
        if (!prorateData?.items) return map;
        for (const item of prorateData.items) {
            if (item.code) map.set(item.code, item);
            if (item.addon_id) map.set(item.addon_id, item);
        }
        return map;
    }, [prorateData]);

    // Parse active/purchased add-on items with metadata and accurate expiration from calculate endpoint
    const purchasedAddons = useMemo<PurchasedAddonItem[]>(() => {
        return activeAddons.map((code) => {
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
    }, [activeAddons, prorateMap]);

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
