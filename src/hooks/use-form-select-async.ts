"use client";

import { useCallback } from "react";
import type { CommandOption } from "@/components/ui/command-select";
import type { AsyncQueryParams, AsyncQueryResult } from "@/components/forms/form-select";

export interface UseFormSelectAsyncOptions<TData = unknown> {
    /**
     * Query hook that fetches infinite/paginated data.
     * Example: (params) => useInfiniteReceivings(params)
     */
    queryHook: (params: Record<string, unknown>) => AsyncQueryResult<TData>;
    /**
     * Transformer function to turn backend entity into CommandOption.
     * Example: (item) => ({ value: item.uid, label: item.nama })
     */
    mapOption: (item: TData) => CommandOption;
    /**
     * Optional extra parameters passed to queryHook (e.g., status, supplier_uid)
     */
    extraParams?: Record<string, unknown>;
    /**
     * Optional fallback generator for currently selected value if not in fetched pages
     */
    getExtraOption?: (selectedValue: string) => CommandOption | undefined;
}

export interface UseFormSelectAsyncReturn<TData = unknown> {
    /** Props directly spreadable into <FormSelect /> */
    useAsyncQuery: (params: AsyncQueryParams) => AsyncQueryResult<TData>;
    mapOption: (item: TData) => CommandOption;
    getExtraOption?: (selectedValue: string) => CommandOption | undefined;
}

/**
 * Reusable hook to handle infinite/paginated options for FormSelect across the entire project.
 */
export function useFormSelectAsync<TData = unknown>({
    queryHook,
    mapOption,
    extraParams,
    getExtraOption,
}: UseFormSelectAsyncOptions<TData>): UseFormSelectAsyncReturn<TData> {
    const useAsyncQuery = useCallback(
        (params: AsyncQueryParams) => {
            return queryHook({
                ...extraParams,
                ...params,
            });
        },
        [queryHook, extraParams]
    );

    return {
        useAsyncQuery,
        mapOption,
        getExtraOption,
    };
}
