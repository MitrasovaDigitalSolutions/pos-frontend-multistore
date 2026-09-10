"use client";

import type { CommandOption } from "@/components/ui/command-select";
import { useFormSelectAsync } from "@/hooks/use-form-select-async";
import { useInfiniteUnits } from "../api/units-api";
import type { Unit } from "../types";

export function mapUnitToOption(u: Unit): CommandOption {
    return {
        value: String(u.uid),
        label: `${u.nama} (${u.simbol})`,
    };
}

export function useCompletedUnitsQueryHook(params: Record<string, unknown>) {
    return useInfiniteUnits(params);
}

export interface UseUnitSelectConfigOptions {
    targetUnit?: Unit | { uid: string; nama: string; simbol: string } | null;
    targetUid?: string | null;
}

export function useUnitSelectConfig(options?: UseUnitSelectConfigOptions) {
    const targetUnit = options?.targetUnit;
    const targetUid = options?.targetUid;

    return useFormSelectAsync<Unit>({
        queryHook: useCompletedUnitsQueryHook,
        mapOption: mapUnitToOption,
        getExtraOption: (uid: string) => {
            if (targetUid === uid && targetUnit) {
                return {
                    value: uid,
                    label: `${targetUnit.nama} (${targetUnit.simbol})`,
                };
            }
            return undefined;
        },
    });
}
