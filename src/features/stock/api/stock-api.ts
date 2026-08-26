import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetData, apiGetList, apiPost, apiPut, apiPatch, apiDelete } from "@/shared/api/api-client";
import { apiClient } from "@/shared/api/axios";
import { queryKeys } from "@/lib/query-keys";
import { invalidateStockQueries } from "@/lib/cache-invalidation";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import type { StockMovement, Opname, OpnameItem } from "../types";
import type { AdjustmentInput } from "../schemas/adjustment-schema";
import type { OpnameHeaderInput } from "../schemas/opname-schema";
import { ENDPOINTS } from "@/shared/api/endpoints";

/** Standard 5-minute timeout (300,000ms) for all Stock Opname operations with large datasets */
const OPNAME_API_TIMEOUT = 300000;

export function useStockMovements(params?: PaginationParams & { tipe?: string }) {
    return useQuery<PaginatedResponse<StockMovement>>({
        queryKey: [...queryKeys.inventory.movements(), params],
        queryFn: () => apiGetList<StockMovement>(ENDPOINTS.INVENTORY.MOVEMENTS, params),
    });
}

export function useOpnames(params?: PaginationParams) {
    return useQuery<PaginatedResponse<Opname>>({
        queryKey: [...queryKeys.inventory.opnames(), params],
        queryFn: () =>
            apiGetList<Opname>(
                ENDPOINTS.INVENTORY.OPNAME.LIST,
                params,
                { timeout: OPNAME_API_TIMEOUT },
            ),
    });
}

export function useOpnameDetail(uid: string | null) {
    return useQuery<Opname>({
        queryKey: queryKeys.inventory.opnameDetail(uid || ""),
        queryFn: () =>
            apiGetData<Opname>(
                ENDPOINTS.INVENTORY.OPNAME.DETAIL(uid || ""),
                { timeout: OPNAME_API_TIMEOUT },
            ),
        enabled: uid !== null && uid !== "",
    });
}

export interface OpnameItemsSummary {
    total_count: number;
    match_count: number;
    positive_count: number;
    negative_count: number;
}

export interface OpnameItemsPaginatedResponse extends PaginatedResponse<OpnameItem> {
    summary?: OpnameItemsSummary;
}

export interface OpnameItemsFilterParams extends PaginationParams {
    search?: string;
    filter_selisih?: "all" | "diff" | "match" | "plus" | "minus" | string;
    category_uid?: string;
    brand_uid?: string;
}

export function useOpnameItems(uid: string | null, params?: OpnameItemsFilterParams) {
    return useQuery<OpnameItemsPaginatedResponse>({
        queryKey: [...queryKeys.inventory.opnameDetail(uid || ""), "items", params],
        queryFn: () =>
            apiGetList<OpnameItem>(
                ENDPOINTS.INVENTORY.OPNAME.ITEMS(uid || ""),
                params,
                { timeout: OPNAME_API_TIMEOUT },
            ),
        enabled: uid !== null && uid !== "",
    });
}

export interface OpnameProgress {
    uid: string;
    status: string;
    progress: number;
    total_items: number;
    processed_items: number;
    error_message: string | null;
}

export function useOpnameProgress(uid: string | null, enabled = true) {
    return useQuery<OpnameProgress>({
        queryKey: [...queryKeys.inventory.opnameDetail(uid || ""), "progress"],
        queryFn: () =>
            apiGetData<OpnameProgress>(
                ENDPOINTS.INVENTORY.OPNAME.PROGRESS(uid || ""),
                { timeout: OPNAME_API_TIMEOUT },
            ),
        enabled: uid !== null && uid !== "" && enabled,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return 2000;
            return data.status === "processing" || data.status === "pending" ? 2000 : false;
        },
    });
}

export function useCreateAdjustment() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, AdjustmentInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<void>, AdjustmentInput>(
                ENDPOINTS.INVENTORY.ADJUSTMENT,
                data,
            ),
        onSuccess: () => {
            invalidateStockQueries(queryClient);
        },
    });
}

export function useCreateOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Opname>, Error, OpnameHeaderInput>({
        mutationFn: (data) =>
            apiPost<ApiResponse<Opname>, OpnameHeaderInput>(
                ENDPOINTS.INVENTORY.OPNAME.CREATE,
                data,
                { timeout: OPNAME_API_TIMEOUT },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useUpdateOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Opname>, Error, { uid: string; data: OpnameHeaderInput }>({
        mutationFn: ({ uid, data }) =>
            apiPut<ApiResponse<Opname>, OpnameHeaderInput>(
                ENDPOINTS.INVENTORY.OPNAME.UPDATE(uid),
                data,
                { timeout: OPNAME_API_TIMEOUT },
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(variables.uid),
            });
        },
    });
}

export function useScanOpnameItem() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<OpnameItem>,
        Error,
        {
            uid: string;
            data: {
                barcode: string;
                stok_fisik?: number;
            };
        },
        { previousQueries: Array<[readonly unknown[], OpnameItemsPaginatedResponse | undefined]> }
    >({
        mutationFn: ({ uid, data }) =>
            apiPost<ApiResponse<OpnameItem>, { barcode: string; stok_fisik?: number }>(
                ENDPOINTS.INVENTORY.OPNAME.SCAN(uid),
                data,
            ),
        onMutate: async ({ uid, data }) => {
            const queryFilter = { queryKey: [...queryKeys.inventory.opnameDetail(uid), "items"] };
            await queryClient.cancelQueries(queryFilter);

            const previousQueries = queryClient.getQueriesData<OpnameItemsPaginatedResponse>(queryFilter);

            queryClient.setQueriesData<OpnameItemsPaginatedResponse>(
                queryFilter,
                (old) => {
                    if (!old || !old.data) return old;
                    const existingIndex = old.data.findIndex(
                        (item) => item.barcode === data.barcode || item.product?.barcode === data.barcode
                    );

                    const items = [...old.data];
                    if (existingIndex >= 0) {
                        const existing = items[existingIndex];
                        const newStokFisik = data.stok_fisik !== undefined ? data.stok_fisik : (Number(existing.stok_fisik) || 0) + 1;
                        const stokSistem = Number(existing.stok_sistem) || 0;
                        items[existingIndex] = {
                            ...existing,
                            stok_fisik: newStokFisik,
                            selisih: newStokFisik - stokSistem,
                        };
                    }

                    return {
                        ...old,
                        data: items,
                    };
                }
            );

            return { previousQueries };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, queryData]) => {
                    queryClient.setQueryData(queryKey, queryData);
                });
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...queryKeys.inventory.opnameDetail(variables.uid), "items"],
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(variables.uid),
            });
        },
    });
}

export function useUpdateOpnameItemRow() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<OpnameItem>,
        Error,
        {
            opnameUid: string;
            itemUid: string;
            data: {
                stok_fisik?: number;
                alasan?: string | null;
                brand_uid?: string | null;
                category_uid?: string | null;
            };
        },
        { previousQueries: Array<[readonly unknown[], OpnameItemsPaginatedResponse | undefined]> }
    >({
        mutationFn: ({ opnameUid, itemUid, data }) =>
            apiPatch<
                ApiResponse<OpnameItem>,
                {
                    stok_fisik?: number;
                    alasan?: string | null;
                    brand_uid?: string | null;
                    category_uid?: string | null;
                }
            >(
                ENDPOINTS.INVENTORY.OPNAME.ITEM_UPDATE(opnameUid, itemUid),
                data,
            ),
        onMutate: async ({ opnameUid, itemUid, data }) => {
            const queryFilter = { queryKey: [...queryKeys.inventory.opnameDetail(opnameUid), "items"] };
            await queryClient.cancelQueries(queryFilter);

            const previousQueries = queryClient.getQueriesData<OpnameItemsPaginatedResponse>(queryFilter);

            queryClient.setQueriesData<OpnameItemsPaginatedResponse>(
                queryFilter,
                (old) => {
                    if (!old || !old.data) return old;
                    const items = old.data.map((item) => {
                        if (item.uid === itemUid) {
                            const newStokFisik = data.stok_fisik !== undefined ? data.stok_fisik : Number(item.stok_fisik) || 0;
                            const stokSistem = Number(item.stok_sistem) || 0;
                            const newSelisih = newStokFisik - stokSistem;
                            return {
                                ...item,
                                ...(data.stok_fisik !== undefined && { stok_fisik: newStokFisik, selisih: newSelisih }),
                                ...(data.alasan !== undefined && { alasan: data.alasan }),
                                ...(data.brand_uid !== undefined && { brand_uid: data.brand_uid }),
                                ...(data.category_uid !== undefined && { category_uid: data.category_uid }),
                            };
                        }
                        return item;
                    });

                    let newSummary = old.summary;
                    if (old.summary && data.stok_fisik !== undefined) {
                        let matchCount = 0;
                        let positiveCount = 0;
                        let negativeCount = 0;
                        items.forEach((item) => {
                            const diff = Number(item.selisih ?? (Number(item.stok_fisik) - Number(item.stok_sistem)));
                            if (diff === 0) matchCount++;
                            else if (diff > 0) positiveCount++;
                            else negativeCount++;
                        });
                        newSummary = {
                            ...old.summary,
                            match_count: matchCount,
                            positive_count: positiveCount,
                            negative_count: negativeCount,
                        };
                    }

                    return {
                        ...old,
                        data: items,
                        summary: newSummary,
                    };
                }
            );

            return { previousQueries };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, queryData]) => {
                    queryClient.setQueryData(queryKey, queryData);
                });
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...queryKeys.inventory.opnameDetail(variables.opnameUid), "items"],
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(variables.opnameUid),
            });
        },
    });
}

export function useDeleteOpnameItemRow() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<void>,
        Error,
        {
            opnameUid: string;
            itemUid: string;
        },
        { previousQueries: Array<[readonly unknown[], OpnameItemsPaginatedResponse | undefined]> }
    >({
        mutationFn: ({ opnameUid, itemUid }) =>
            apiDelete<ApiResponse<void>>(
                ENDPOINTS.INVENTORY.OPNAME.ITEM_DELETE(opnameUid, itemUid),
            ),
        onMutate: async ({ opnameUid, itemUid }) => {
            const queryFilter = { queryKey: [...queryKeys.inventory.opnameDetail(opnameUid), "items"] };
            await queryClient.cancelQueries(queryFilter);

            const previousQueries = queryClient.getQueriesData<OpnameItemsPaginatedResponse>(queryFilter);

            queryClient.setQueriesData<OpnameItemsPaginatedResponse>(
                queryFilter,
                (old) => {
                    if (!old || !old.data) return old;
                    const items = old.data.filter((item) => item.uid !== itemUid);
                    const newTotal = Math.max(0, (old.meta?.total ?? items.length) - 1);
                    return {
                        ...old,
                        data: items,
                        meta: old.meta ? { ...old.meta, total: newTotal } : old.meta,
                        summary: old.summary ? { ...old.summary, total_count: newTotal } : old.summary,
                    };
                }
            );

            return { previousQueries };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, queryData]) => {
                    queryClient.setQueryData(queryKey, queryData);
                });
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...queryKeys.inventory.opnameDetail(variables.opnameUid), "items"],
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(variables.opnameUid),
            });
        },
    });
}

export function useFinalizeOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Opname>, Error, string>({
        mutationFn: (uid) =>
            apiPost<ApiResponse<Opname>, undefined>(
                ENDPOINTS.INVENTORY.OPNAME.FINALIZE(uid),
                undefined,
                { timeout: OPNAME_API_TIMEOUT },
            ),
        onSuccess: (_, uid) => {
            invalidateStockQueries(queryClient);
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(uid),
            });
        },
    });
}

// ─── Opname Import & Template Download Helpers ───────────────────────────────

export async function downloadOpnameTemplateXlsx(): Promise<void> {
    const response = await apiClient.get(ENDPOINTS.INVENTORY.OPNAME.SHEET_XLSX, {
        responseType: "blob",
        timeout: OPNAME_API_TIMEOUT,
    });
    let filename = "template_stock_opname.xlsx";
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
        }
    }
    const contentType = response.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const blob = new Blob([response.data], { type: typeof contentType === "string" ? contentType : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export async function downloadOpnameSheetPdf(): Promise<void> {
    const response = await apiClient.get(ENDPOINTS.INVENTORY.OPNAME.SHEET_PDF, {
        responseType: "blob",
        timeout: OPNAME_API_TIMEOUT,
    });
    let filename = "lembar_stock_opname.pdf";
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
        }
    }
    const contentType = response.headers["content-type"] || "application/pdf";
    const blob = new Blob([response.data], { type: typeof contentType === "string" ? contentType : "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export function useImportOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Opname>, Error, FormData>({
        mutationFn: (formData) =>
            apiPost<ApiResponse<Opname>, FormData>(
                ENDPOINTS.INVENTORY.OPNAME.IMPORT,
                formData,
                { timeout: OPNAME_API_TIMEOUT },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useImportOpnameIntoDraft() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Opname>, Error, { uid: string; formData: FormData }>({
        mutationFn: ({ uid, formData }) =>
            apiPost<ApiResponse<Opname>, FormData>(
                ENDPOINTS.INVENTORY.OPNAME.IMPORT_INTO_DRAFT(uid),
                formData,
                { timeout: OPNAME_API_TIMEOUT },
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(variables.uid),
            });
            queryClient.invalidateQueries({
                queryKey: [...queryKeys.inventory.opnameDetail(variables.uid), "items"],
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

// ─── Opname Deletion Hook ────────────────────────────────────────────────────

export function useDeleteOpname() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) =>
            apiDelete<ApiResponse<void>>(
                ENDPOINTS.INVENTORY.OPNAME.DELETE(uid),
                { timeout: OPNAME_API_TIMEOUT },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
        },
    });
}

// ─── Audit / Activity Logs Hooks ─────────────────────────────────────────────

export interface ActivityLog {
    uid: string;
    user_uid: string | null;
    action: string;
    model_type: string | null;
    model_uid: string | null;
    description: string;
    module?: string[] | null;
    ip_address: string | null;
    user_agent: string | null;
    properties: Record<string, unknown> | null;
    created_at: string;
    user?: {
        uid: string;
        name: string;
        username: string;
    };
}

export function useActivityLogs(params?: PaginationParams & { search?: string; module?: string }) {
    return useQuery<PaginatedResponse<ActivityLog>>({
        queryKey: [...queryKeys.activityLogs.list(), params],
        queryFn: () => apiGetList<ActivityLog>("/v1/activity-logs", params),
    });
}
