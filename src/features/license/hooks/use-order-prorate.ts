import { useCallback, useMemo, useState } from "react";
import type { CatalogAddon, ProrateCalculateData, ProrateItem } from "../types";
import { useLicenseProrateQuery } from "../api/license-api";

// ─── Params ──────────────────────────────────────────────────────────────────

interface UseOrderProrateParams {
    addons: CatalogAddon[];
    withRenewal: boolean;
    billingPeriod: "monthly" | "annual";
    open: boolean;
    isOperable: boolean;
}

// ─── Return Type ─────────────────────────────────────────────────────────────

export interface OrderProrateState {
    addonCustomDays: Record<string, number>;
    setAddonCustomDays: (addonId: string, days: number) => void;
    resetAddonCustomDays: () => void;
    prorateData: ProrateCalculateData | undefined;
    prorateMap: Map<string, ProrateItem>;
    isCalculating: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOrderProrate({
    addons,
    withRenewal,
    billingPeriod,
    open,
    isOperable,
}: UseOrderProrateParams): OrderProrateState {
    const [addonCustomDays, setAddonCustomDaysState] = useState<
        Record<string, number>
    >({});

    // Reset custom days when dialog opens (derive-during-render, avoids setState in effect)
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setAddonCustomDaysState({});
        }
    }

    const setAddonCustomDays = useCallback(
        (addonId: string, days: number) => {
            setAddonCustomDaysState((prev) => ({
                ...prev,
                [addonId]: days,
            }));
        },
        []
    );

    const resetAddonCustomDays = useCallback(() => {
        setAddonCustomDaysState({});
    }, []);

    // Build payload for ALL addons without custom_days. Sliding the duration
    // is calculated 100% on the client for instant 60fps UX without network roundtrips.
    const prorateAddonsPayload = useMemo(() => {
        return addons.map((a) => ({
            id: a.code || a.id,
        }));
    }, [addons]);

    // Query key changes naturally when params change → react-query auto-fetches.
    // No manual invalidateQueries or refetch needed.
    const {
        data: prorateData,
        isLoading: isProrateLoading,
        isFetching: isProrateFetching,
    } = useLicenseProrateQuery(
        {
            addons: prorateAddonsPayload,
            with_renewal: withRenewal,
            renewal_period: billingPeriod,
        },
        {
            enabled:
                open &&
                isOperable &&
                prorateAddonsPayload.length > 0,
        }
    );

    const isCalculating = isProrateLoading || isProrateFetching;

    // O(n) lookup map keyed by addon_id and code for fast prorate lookups
    const prorateMap = useMemo(() => {
        const map = new Map<string, ProrateItem>();
        if (!prorateData?.items) return map;
        for (const item of prorateData.items) {
            if (item.addon_id) map.set(item.addon_id, item);
            if (item.code) map.set(item.code, item);
        }
        return map;
    }, [prorateData]);

    return {
        addonCustomDays,
        setAddonCustomDays,
        resetAddonCustomDays,
        prorateData,
        prorateMap,
        isCalculating,
    };
}
