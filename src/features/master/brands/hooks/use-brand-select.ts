"use client";

import type { CommandOption } from "@/components/ui/command-select";
import { useFormSelectAsync } from "@/hooks/use-form-select-async";
import { useInfiniteBrands } from "../api/brands-api";
import type { Brand } from "../types";

export function mapBrandToOption(b: Brand): CommandOption {
    return {
        value: String(b.uid),
        label: b.nama,
    };
}

export function useCompletedBrandsQueryHook(params: Record<string, unknown>) {
    return useInfiniteBrands(params);
}

export interface UseBrandSelectConfigOptions {
    targetBrand?: Brand | null;
    targetUid?: string | null;
}

export function useBrandSelectConfig(options?: UseBrandSelectConfigOptions) {
    const targetBrand = options?.targetBrand;
    const targetUid = options?.targetUid;

    return useFormSelectAsync<Brand>({
        queryHook: useCompletedBrandsQueryHook,
        mapOption: mapBrandToOption,
        getExtraOption: (uid: string) => {
            if (targetUid === uid && targetBrand) {
                return {
                    value: uid,
                    label: targetBrand.nama,
                };
            }
            return undefined;
        },
    });
}
