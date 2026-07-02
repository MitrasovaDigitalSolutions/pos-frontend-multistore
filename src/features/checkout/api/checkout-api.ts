import type { Product } from "@/features/products/types";
import { queryKeys } from "@/lib/query-keys";
import { apiGet, apiPost, apiPatch } from "@/shared/api/api-client";
import type { ApiResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Receipt } from "../types";
import { useSettingsStore } from "@/stores/settings-store";

// ─── Bulk Checkout Mutation ──────────────────────────────────────────────────
// Sends all checkout items and payment details in a single request to the backend.
export function useBulkCheckout() {
    const queryClient = useQueryClient();
    const getSetting = useSettingsStore((state) => state.getSetting);

    return useMutation<
        ApiResponse<Receipt>,
        Error,
        { payload: Record<string, unknown>; grandTotal: number; memberUid: string | null }
    >({
        mutationFn: async ({ payload, grandTotal, memberUid }) => {
            // 1. Submit checkout transaction
            const response = await apiPost<ApiResponse<Receipt>>("/v1/transactions", payload);

            // 2. Award member points if transaction succeeds, member is selected, and point system is enabled
            const pointSystemEnabled = getSetting("point_system_enabled", "true") === "true";
            if (pointSystemEnabled && memberUid && grandTotal > 0 && response.data) {
                const pointRate = parseFloat(getSetting("point_rate", "1000")) || 1000;
                const points = Math.floor(grandTotal / pointRate);

                if (points > 0) {
                    try {
                        await apiPatch(`/v1/members/${memberUid}/points`, {
                            type: "add",
                            points,
                            note: `Poin transaksi #${response.data.uid || "checkout"}`
                        });
                    } catch (pointsErr) {
                        console.error("Gagal menyesuaikan poin member saat checkout:", pointsErr);
                        // Do not fail the transaction if only the points fail
                    }
                }
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
            queryClient.invalidateQueries({ queryKey: ["cash-drawer"] });
            queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
        },
    });
}

// ─── Barcode Lookup ──────────────────────────────────────────────────────────
export async function lookupBarcode(barcode: string): Promise<Product> {
    const res = await apiGet<ApiResponse<Product>>(
        `/v1/products/barcode/${encodeURIComponent(barcode)}`,
    );
    return res.data;
}
