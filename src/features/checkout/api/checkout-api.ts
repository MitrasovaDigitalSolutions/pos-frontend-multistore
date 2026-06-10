import type { Product } from "@/features/products/types";
import { queryKeys } from "@/lib/query-keys";
import { apiGet, apiPost } from "@/shared/api/api-client";
import type { ApiResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Receipt } from "../types";

// ─── Bulk Checkout Mutation ──────────────────────────────────────────────────
// Sends all checkout items and payment details in a single request to the backend.
export function useBulkCheckout() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Receipt>, Error, any>({
        mutationFn: (payload) =>
            apiPost<ApiResponse<Receipt>>("/v1/transactions", payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
            queryClient.invalidateQueries({ queryKey: ["cash-drawer"] });
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
