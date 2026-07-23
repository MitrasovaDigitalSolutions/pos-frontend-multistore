"use client";

import { useFormSelectAsync } from "@/hooks/use-form-select-async";
import { useInfiniteReceivings } from "../api/purchase-api";
import { RECEIVING_STATUS } from "@/constants/purchase";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Receiving } from "../types";
import type { CommandOption } from "@/components/ui/command-select";

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

/**
 * Custom React Hook wrapper for useInfiniteReceivings with status COMPLETED.
 * Must be a top-level hook starting with 'use' to satisfy ESLint rules-of-hooks.
 */
export function useCompletedReceivingsQueryHook(params: Record<string, unknown>) {
    return useInfiniteReceivings({ status: RECEIVING_STATUS.COMPLETED, ...params });
}

export interface UseReceivingSelectConfigOptions {
    targetReceiving?: Receiving | null;
    targetUid?: string | null;
}

/**
 * Reusable hook that provides useAsyncQuery, mapOption, and getExtraOption configuration
 * for FormSelect components selecting Stock Receivings (Faktur Penerimaan), using useFormSelectAsync.
 */
export function useReceivingSelectConfig(options?: UseReceivingSelectConfigOptions) {
    const targetReceiving = options?.targetReceiving;
    const targetUid = options?.targetUid;

    return useFormSelectAsync<Receiving>({
        queryHook: useCompletedReceivingsQueryHook,
        mapOption: mapReceivingToOption,
        getExtraOption: (uid: string) => {
            if (targetUid === uid && targetReceiving) {
                return {
                    value: uid,
                    label: targetReceiving.nomor_penerimaan || `Penerimaan ID: ${uid}`,
                    description: `Faktur: ${targetReceiving.nomor_faktur || "-"} • Terkait`,
                };
            }
            return undefined;
        },
    });
}
