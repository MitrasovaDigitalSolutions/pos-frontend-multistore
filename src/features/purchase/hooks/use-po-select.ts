"use client";

import type { CommandOption } from "@/components/ui/command-select";
import { useFormSelectAsync } from "@/hooks/use-form-select-async";
import { useInfinitePurchaseOrders } from "../api/purchase-api";
import type { PurchaseOrder } from "../types";

export function mapPOToOption(po: PurchaseOrder): CommandOption {
    return {
        value: String(po.uid),
        label: po.nomor_po || `PO ID: ${po.uid}`,
        description: po.supplier?.nama ? `Supplier: ${po.supplier.nama}` : undefined,
    };
}

export function useOutstandingPOQueryHook(params: Record<string, unknown>) {
    return useInfinitePurchaseOrders({ status: "approved", ...params });
}

export interface UsePOSelectConfigOptions {
    targetPO?: PurchaseOrder | null;
    targetUid?: string | null;
    status?: string;
}

export function usePOSelectConfig(options?: UsePOSelectConfigOptions) {
    const targetPO = options?.targetPO;
    const targetUid = options?.targetUid;

    return useFormSelectAsync<PurchaseOrder>({
        queryHook: useOutstandingPOQueryHook,
        mapOption: mapPOToOption,
        extraParams: options?.status ? { status: options.status } : undefined,
        getExtraOption: (uid: string) => {
            if (targetUid === uid && targetPO) {
                return {
                    value: uid,
                    label: targetPO.nomor_po || `PO ID: ${uid}`,
                    description: targetPO.supplier?.nama ? `Supplier: ${targetPO.supplier.nama}` : undefined,
                };
            }
            return undefined;
        },
    });
}
