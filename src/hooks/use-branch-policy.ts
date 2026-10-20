"use client";

import { useActiveStore } from "@/hooks/use-active-store";
import { useSettingsStore } from "@/stores/settings-store";

/**
 * All available branch policy setting keys.
 * These correspond to `app_settings` keys in the backend.
 */
export type BranchPolicyKey =
    | "branch_can_create_product"
    | "branch_can_edit_product_price"
    | "branch_can_edit_master_data"
    | "branch_can_manual_stock_adjustment"
    | "branch_can_stock_opname"
    | "branch_can_direct_purchase"
    | "branch_can_transfer_to_other_branch"
    | "branch_can_apply_manual_discount";

/** Default values matching backend spec */
export const BRANCH_POLICY_DEFAULTS: Record<BranchPolicyKey, boolean> = {
    branch_can_create_product: false,
    branch_can_edit_product_price: false,
    branch_can_edit_master_data: false,
    branch_can_manual_stock_adjustment: false,
    branch_can_stock_opname: false,
    branch_can_direct_purchase: false,
    branch_can_transfer_to_other_branch: false,
    branch_can_apply_manual_discount: false,
};

/**
 * Pure evaluation function to check whether a specific branch policy is allowed.
 *
 * - If the active store is Central (HQ), **always returns `true`**.
 * - If the active store is a branch, reads from settings and falls back to backend default.
 */
export function isBranchPolicyAllowed(
    key: BranchPolicyKey,
    settings: Record<string, string | boolean | null | undefined>,
    isCentralStore: boolean
): boolean {
    if (isCentralStore) {
        return true;
    }

    const val = settings[key];
    if (val === undefined || val === null) {
        return BRANCH_POLICY_DEFAULTS[key];
    }

    return val === true || val === "true" || String(val) === "true";
}

/**
 * Checks whether a specific branch policy is allowed for the current store.
 *
 * - If the active store is Central (HQ), **always returns `true`**.
 * - If the active store is a branch, reads from `settings-store` and falls back to the backend default.
 *
 * @example
 * ```tsx
 * const canCreateProduct = useBranchPolicy("branch_can_create_product");
 * ```
 */
export function useBranchPolicy(key: BranchPolicyKey): boolean {
    const { isCentralStore } = useActiveStore();
    const settings = useSettingsStore((s) => s.settings);

    return isBranchPolicyAllowed(key, settings, isCentralStore);
}

/**
 * Convenience hook to check multiple branch policies at once.
 *
 * @example
 * ```tsx
 * const { branch_can_create_product, branch_can_edit_product_price } = useBranchPolicies([
 *   "branch_can_create_product",
 *   "branch_can_edit_product_price",
 * ]);
 * ```
 */
export function useBranchPolicies<K extends BranchPolicyKey>(keys: K[]): Record<K, boolean> {
    const { isCentralStore } = useActiveStore();
    const settings = useSettingsStore((s) => s.settings);

    const result = {} as Record<K, boolean>;

    for (const key of keys) {
        result[key] = isBranchPolicyAllowed(key, settings, isCentralStore);
    }

    return result;
}

