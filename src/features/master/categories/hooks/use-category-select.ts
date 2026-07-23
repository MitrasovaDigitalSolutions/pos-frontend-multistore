"use client";

import type { CommandOption } from "@/components/ui/command-select";
import { useFormSelectAsync } from "@/hooks/use-form-select-async";
import { useInfiniteCategories } from "../api/categories-api";
import type { Category } from "../types";

export function mapCategoryToOption(c: Category): CommandOption {
    return {
        value: String(c.uid),
        label: c.nama,
    };
}

export function useCompletedCategoriesQueryHook(params: Record<string, unknown>) {
    return useInfiniteCategories(params);
}

export interface UseCategorySelectConfigOptions {
    targetCategory?: Category | null;
    targetUid?: string | null;
}

export function useCategorySelectConfig(options?: UseCategorySelectConfigOptions) {
    const targetCategory = options?.targetCategory;
    const targetUid = options?.targetUid;

    return useFormSelectAsync<Category>({
        queryHook: useCompletedCategoriesQueryHook,
        mapOption: mapCategoryToOption,
        getExtraOption: (uid: string) => {
            if (targetUid === uid && targetCategory) {
                return {
                    value: uid,
                    label: targetCategory.nama,
                };
            }
            return undefined;
        },
    });
}
