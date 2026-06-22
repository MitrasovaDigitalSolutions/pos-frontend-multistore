import { useQuery } from "@tanstack/react-query";
import { apiGetData } from "@/shared/api/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { DailyReport, LabaRugiReport, PengeluaranReport, PurchaseReport } from "../types";

export function useDailyReport(date: string) {
    return useQuery<DailyReport>({
        queryKey: queryKeys.reports.daily(date),
        queryFn: () =>
            apiGetData<DailyReport>(`/v1/reports/sales/daily?date=${date}`),
        enabled: !!date,
    });
}

export function useLabaRugiReport(from: string, to: string, interval: string) {
    return useQuery<LabaRugiReport>({
        queryKey: queryKeys.reports.labaRugi(from, to, interval),
        queryFn: () =>
            apiGetData<LabaRugiReport>(
                `/v1/reports/laba-rugi?from=${from}&to=${to}&interval=${interval}`
            ),
        enabled: !!from && !!to && !!interval,
    });
}

export function usePengeluaranReport(from: string, to: string) {
    return useQuery<PengeluaranReport>({
        queryKey: queryKeys.reports.pengeluaran(from, to),
        queryFn: () =>
            apiGetData<PengeluaranReport>(`/v1/reports/pengeluaran?from=${from}&to=${to}`),
        enabled: !!from && !!to,
    });
}

export function usePembelianReport(
    from: string,
    to: string,
    includeItems: boolean,
    includePayments: boolean
) {
    return useQuery<PurchaseReport>({
        queryKey: queryKeys.reports.pembelian(from, to, includeItems, includePayments),
        queryFn: () =>
            apiGetData<PurchaseReport>(
                `/v1/reports/pembelian?from=${from}&to=${to}&include_items=${includeItems}&include_payments=${includePayments}`
            ),
        enabled: !!from && !!to,
    });
}
