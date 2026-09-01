import { useState, useMemo } from "react";
import type { CoaCounterpartMapping, ChartOfAccount } from "../../../types";

interface UseCounterpartMappingFilterParams {
    mappings?: CoaCounterpartMapping[];
    accounts?: ChartOfAccount[];
}

export function useCounterpartMappingFilter({
    mappings = [],
    accounts = [],
}: UseCounterpartMappingFilterParams) {
    const [searchQuery, setSearchQuery] = useState("");

    // Fast Map for looking up accounts by UID
    const accountsMap = useMemo(() => {
        const map = new Map<string, ChartOfAccount>();
        accounts.forEach((acc) => map.set(acc.uid, acc));
        return map;
    }, [accounts]);

    // Enriched mappings with CoA details
    const enrichedMappings = useMemo(() => {
        return mappings.map((m) => ({
            ...m,
            coa: m.coa || accountsMap.get(m.coa_uid) || null,
            counterpart: m.counterpart || accountsMap.get(m.counterpart_coa_uid) || null,
        }));
    }, [mappings, accountsMap]);

    // Simple search filter
    const filteredMappings = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return enrichedMappings;

        return enrichedMappings.filter((m) => {
            const mainCoa = m.coa;
            const counterpartCoa = m.counterpart;

            return (
                (mainCoa?.kode && mainCoa.kode.toLowerCase().includes(query)) ||
                (mainCoa?.nama && mainCoa.nama.toLowerCase().includes(query)) ||
                (counterpartCoa?.kode && counterpartCoa.kode.toLowerCase().includes(query)) ||
                (counterpartCoa?.nama && counterpartCoa.nama.toLowerCase().includes(query)) ||
                (m.keterangan && m.keterangan.toLowerCase().includes(query))
            );
        });
    }, [enrichedMappings, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        filteredMappings,
    };
}
