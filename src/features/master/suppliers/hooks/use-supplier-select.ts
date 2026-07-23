"use client";

import type { CommandOption } from "@/components/ui/command-select";
import { useFormSelectAsync } from "@/hooks/use-form-select-async";
import { useInfiniteSuppliers } from "../api/suppliers-api";
import type { Supplier } from "../types";

export function mapSupplierToOption(s: Supplier): CommandOption {
    return {
        value: String(s.uid),
        label: s.nama,
        description: s.nomor_telepon ? `Telp: ${s.nomor_telepon}` : undefined,
    };
}

export function useCompletedSuppliersQueryHook(params: Record<string, unknown>) {
    return useInfiniteSuppliers(params);
}

export interface UseSupplierSelectConfigOptions {
    targetSupplier?: Supplier | null;
    targetUid?: string | null;
}

export function useSupplierSelectConfig(options?: UseSupplierSelectConfigOptions) {
    const targetSupplier = options?.targetSupplier;
    const targetUid = options?.targetUid;

    return useFormSelectAsync<Supplier>({
        queryHook: useCompletedSuppliersQueryHook,
        mapOption: mapSupplierToOption,
        getExtraOption: (uid: string) => {
            if (targetUid === uid && targetSupplier) {
                return {
                    value: uid,
                    label: targetSupplier.nama,
                };
            }
            return undefined;
        },
    });
}
