import type { AddonOrderItem, ProrateItem } from "../types";

/**
 * Calculates the effective prorated price of an add-on purely on the client side.
 * When the user drags the duration slider, this calculates the new price instantly
 * without triggering an expensive backend calculate endpoint request.
 *
 * @param prorateItem Prorate data returned by the backend calculate endpoint for this add-on
 * @param customDays Number of days selected via slider (or null/undefined for default duration)
 * @param fallbackPrice Fallback price if prorate data is not available
 */
export function calculateAddonProratePrice(
    prorateItem?: ProrateItem | null,
    customDays?: number | null,
    fallbackPrice: number = 0
): number {
    if (!prorateItem) {
        return fallbackPrice;
    }

    if (!prorateItem.is_prorated) {
        return prorateItem.price ?? fallbackPrice;
    }

    // Case 1: Pure renewal without prorate gap (e.g. accounting where current remaining matches license)
    // prorated_amount is 0, so the price is strictly the renewal cycle price.
    if (
        prorateItem.with_renewal &&
        (prorateItem.prorated_amount === 0 || !prorateItem.prorated_amount)
    ) {
        return (
            prorateItem.renewal_amount ||
            prorateItem.price ||
            fallbackPrice
        );
    }

    const defaultDays =
        prorateItem.prorated_days ||
        prorateItem.selected_days ||
        prorateItem.max_days_available ||
        30;
    const days = customDays && customDays > 0 ? customDays : defaultDays;

    // Case 2: If selected days matches backend's calculated prorated_days exactly, use exact backend price
    if (days === prorateItem.prorated_days && prorateItem.price != null) {
        return prorateItem.price;
    }

    // Determine the daily rate:
    // 1. From backend daily_rate if positive
    // 2. From prorated_amount / prorated_days (if prorated_amount > 0)
    // 3. From period_full_price / 30
    const dailyRate =
        prorateItem.daily_rate > 0
            ? prorateItem.daily_rate
            : prorateItem.prorated_amount && prorateItem.prorated_days
            ? prorateItem.prorated_amount / prorateItem.prorated_days
            : prorateItem.period_full_price
            ? prorateItem.period_full_price / 30
            : 0;

    // Case 3: with_renewal has a prorate gap + renewal cycle (e.g. assets where 38 days gap + 30 days renewal)
    if (prorateItem.with_renewal && prorateItem.renewal_amount) {
        const renewalCycleDays = (prorateItem.period_months || 1) * 30;
        const gapDays = Math.max(0, days - renewalCycleDays);
        const gapAmount = Math.round(dailyRate * gapDays);
        return Math.max(0, gapAmount + prorateItem.renewal_amount);
    }

    // Case 4: Pure prorata without renewal
    const proratedAmount = Math.round(dailyRate * days);
    return Math.max(0, proratedAmount);
}

/**
 * Returns the effective active duration in days for an add-on,
 * falling back to the maximum available days from the backend prorate data.
 */
export function getAddonActiveDays(
    prorateItem?: ProrateItem | null,
    customDays?: number | null,
    fallbackDays: number = 30
): number {
    if (customDays && customDays > 0) {
        return customDays;
    }
    if (!prorateItem) {
        return fallbackDays;
    }
    if (prorateItem.slider_ticks && prorateItem.slider_ticks.length > 0) {
        return prorateItem.slider_ticks[prorateItem.slider_ticks.length - 1];
    }
    return (
        prorateItem.max_days_available ||
        prorateItem.prorated_days ||
        prorateItem.selected_days ||
        fallbackDays
    );
}

/**
 * Normalizes and formats addon items into a deterministic, uppercase, and sorted payload
 * matching backend requirements for the prorate calculate endpoint.
 *
 * @param addons Array of string IDs or objects containing code/id/custom_days
 * @returns Sorted array of AddonOrderItem with uppercase IDs
 */
export function buildProrateAddonsPayload(
    addons: Array<string | { id?: string; code?: string; custom_days?: number }>
): AddonOrderItem[] {
    return (addons || [])
        .map((item) => {
            if (typeof item === "string") {
                return { id: item.toUpperCase() };
            }
            const id = (item.code || item.id || "").toUpperCase();
            return {
                id,
                ...(item.custom_days !== undefined && item.custom_days !== null && item.custom_days > 0
                    ? { custom_days: item.custom_days }
                    : {}),
            };
        })
        .filter((item) => Boolean(item.id))
        .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Creates an O(1) multi-key lookup map for prorate items, indexing by both
 * uppercase, lowercase, and original keys for `code` and `addon_id`.
 */
export function createProrateLookupMap(items?: ProrateItem[]): Map<string, ProrateItem> {
    const map = new Map<string, ProrateItem>();
    if (!items || !Array.isArray(items)) return map;

    for (const item of items) {
        if (item.code) {
            map.set(item.code, item);
            map.set(item.code.toLowerCase(), item);
            map.set(item.code.toUpperCase(), item);
        }
        if (item.addon_id) {
            map.set(item.addon_id, item);
            map.set(item.addon_id.toLowerCase(), item);
            map.set(item.addon_id.toUpperCase(), item);
        }
    }
    return map;
}
