import { queryKeys } from "@/lib/query-keys";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { apiGetData } from "@/shared/api/api-client";
import { useQuery } from "@tanstack/react-query";
import type {
    CentralInventoryData,
    CentralOverviewData,
    CentralSalesTrendData,
    CentralStoresComparisonData,
} from "../types/central-reports-types";

function buildStoreParam(storeUids?: string[]): string {
    if (!storeUids || storeUids.length === 0) return "";
    return `&stores=${storeUids.join(",")}`;
}

export function useCentralOverview(from: string, to: string, storeUids?: string[]) {
    const storeParam = buildStoreParam(storeUids);
    return useQuery<CentralOverviewData>({
        queryKey: queryKeys.reports.centralOverview(from, to, storeUids),
        queryFn: () =>
            apiGetData<CentralOverviewData>(
                `${ENDPOINTS.REPORTS.CENTRAL.OVERVIEW}?from=${from}&to=${to}${storeParam}`
            ),
        enabled: !!from && !!to,
    });
}

export function useCentralStoresComparison(from: string, to: string, storeUids?: string[]) {
    const storeParam = buildStoreParam(storeUids);
    return useQuery<CentralStoresComparisonData>({
        queryKey: queryKeys.reports.centralStores(from, to, storeUids),
        queryFn: () =>
            apiGetData<CentralStoresComparisonData>(
                `${ENDPOINTS.REPORTS.CENTRAL.STORES}?from=${from}&to=${to}${storeParam}`
            ),
        enabled: !!from && !!to,
    });
}

export function useCentralSalesTrend(
    from: string,
    to: string,
    interval: "daily" | "weekly" | "monthly" = "daily",
    byStore: boolean = false,
    storeUids?: string[]
) {
    const storeParam = buildStoreParam(storeUids);
    return useQuery<CentralSalesTrendData>({
        queryKey: queryKeys.reports.centralSalesTrend(from, to, interval, byStore, storeUids),
        queryFn: () =>
            apiGetData<CentralSalesTrendData>(
                `${ENDPOINTS.REPORTS.CENTRAL.SALES_TREND}?from=${from}&to=${to}&interval=${interval}&by_store=${byStore}${storeParam}`
            ),
        enabled: !!from && !!to,
    });
}

export function useCentralInventory(storeUids?: string[]) {
    const storeParam = storeUids && storeUids.length > 0 ? `?stores=${storeUids.join(",")}` : "";
    return useQuery<CentralInventoryData>({
        queryKey: queryKeys.reports.centralInventory(storeUids),
        queryFn: () =>
            apiGetData<CentralInventoryData>(
                `${ENDPOINTS.REPORTS.CENTRAL.INVENTORY}${storeParam}`
            ),
    });
}

export function getCentralPrintStoresUrl(
    from: string,
    to: string,
    storeUids?: string[],
    paperSize?: string,
    orientation?: string
): string {
    const baseUrl = `/api/proxy${ENDPOINTS.REPORTS.CENTRAL.PRINT_STORES}`;
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (storeUids && storeUids.length > 0) {
        params.set("stores", storeUids.join(","));
    }
    if (paperSize) params.set("paper_size", paperSize);
    if (orientation) params.set("orientation", orientation);
    return `${baseUrl}?${params.toString()}`;
}
