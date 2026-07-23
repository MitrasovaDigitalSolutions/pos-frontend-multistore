"use client";

import { useCallback } from "react";
import { useInfiniteReceivings } from "../api/purchase-api";
import { RECEIVING_STATUS } from "@/constants/purchase";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { AsyncQueryParams } from "@/components/forms/form-select";
import type { Receiving } from "../types";
import { CommandOption } from "@/components/ui/command-select";

/**
 * Custom React Hook for FormSelect useAsyncQuery to fetch completed stock receivings.
 * Must start with "use" to comply with React Rules of Hooks.
 */
export function useCompletedReceivingsAsyncQuery(params: AsyncQueryParams) {
    return useInfiniteReceivings({ status: RECEIVING_STATUS.COMPLETED, ...params });
}

/**
 * Maps a Receiving entity into a CommandOption structure for FormSelect.
 */
export function mapReceivingToOption(r: Receiving): CommandOption {
    return {
        value: String(r.uid),
        label: `${r.nomor_penerimaan} - ${r.supplier_relationship?.nama || r.supplier || "Supplier"}`,
        description: `Faktur: ${r.nomor_faktur || "-"} • Total: ${formatRupiah(r.nilai_faktur || 0)}`,
    };
}

export interface UseReceivingSelectConfigOptions {
    targetReceiving?: Receiving | null;
    targetUid?: string | null;
}

/**
 * Reusable hook that provides useAsyncQuery, mapOption, and getExtraOption configuration
 * for FormSelect components selecting Stock Receivings (Faktur Penerimaan).
 */
export function useReceivingSelectConfig(options?: UseReceivingSelectConfigOptions) {
    const targetReceiving = options?.targetReceiving;
    const targetUid = options?.targetUid;

    const mapOption = useCallback((r: Receiving) => mapReceivingToOption(r), []);

    const getExtraOption = useCallback(
        (uid: string) => {
            if (targetUid === uid && targetReceiving) {
                return {
                    value: uid,
                    label: targetReceiving.nomor_penerimaan || `Penerimaan ID: ${uid}`,
                    description: `Faktur: ${targetReceiving.nomor_faktur || "-"} • Terkait`,
                };
            }
            return undefined;
        },
        [targetUid, targetReceiving]
    );

    return {
        useAsyncQuery: useCompletedReceivingsAsyncQuery,
        mapOption,
        getExtraOption,
    };
}
