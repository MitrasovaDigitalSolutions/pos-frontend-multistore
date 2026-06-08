import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { DailyReport } from "../types";

export function useDailyReport(date: string) {
    return useQuery<DailyReport>({
        queryKey: queryKeys.reports.daily(date),
        queryFn: () =>
            apiGet<DailyReport>(`/v1/reports/sales/daily?date=${date}`),
        enabled: !!date,
    });
}
