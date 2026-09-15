"use client";

import { useMemo } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { formatToReadableDate } from "@/lib/date-utils";
import { ROUTES } from "@/constants/routes";
import type { RequestTransferSummary } from "../../types";
import { useTransferTutorialStore } from "@/stores/transfer-tutorial-store";
import { MOCK_INCOMING_SUMMARY } from "@/features/stock-transfer/tutorial/constants/transfer-tutorial-constants";

interface RequestTransferSummaryTableProps {
    summaries: RequestTransferSummary[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    page: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    mode?: "outgoing" | "incoming";
}

export function RequestTransferSummaryTable({
    summaries,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    isLoading = false,
    isFetching = false,
    mode = "outgoing",
}: RequestTransferSummaryTableProps) {
    const router = useAppRouter();
    const isTutorialRunning = useTransferTutorialStore(
        (state) => state.isRunning && state.activeTutorial === "request_transfer_incoming" && state.stepIndex < 4
    );

    const displaySummaries = useMemo(() => {
        if (mode === "incoming" && isTutorialRunning) {
            const hasMock = summaries.some((s) => s.summary_uid === MOCK_INCOMING_SUMMARY.summary_uid);
            if (!hasMock) {
                return [MOCK_INCOMING_SUMMARY, ...summaries];
            }
            return summaries;
        }
        // When not in tutorial mode, strictly exclude any mock items
        return summaries.filter(
            (s) => s.summary_uid !== MOCK_INCOMING_SUMMARY.summary_uid && !s.summary_uid.startsWith("mock-")
        );
    }, [mode, isTutorialRunning, summaries]);

    const openSummary = (s: RequestTransferSummary) => {
        const detailRoute =
            mode === "incoming"
                ? ROUTES.ADMIN_REQUEST_TRANSFERS_INCOMING_DETAIL
                : ROUTES.ADMIN_REQUEST_TRANSFERS_DETAIL;
        router.push(`${detailRoute}?summary_uid=${s.summary_uid}`);
    };

    const columns = useMemo<ColumnDef<RequestTransferSummary>[]>(
        () => [
            {
                accessorKey: "request_to_nama",
                header: "Tujuan Request",
                cell: ({ row }) => (
                    <div id={row.index === 0 ? "req-incoming-row-0" : undefined}>
                        <span className="font-bold text-slate-900 text-xs">
                            {row.original.request_to_nama || "Pusat"}
                        </span>
                    </div>
                ),
                size: 160,
            },
            {
                accessorKey: "supplier_nama",
                header: "Supplier & Katalog",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800 text-xs">
                            {row.original.supplier_nama || "Tanpa Supplier"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {row.original.supplier_sales_nama
                                ? `Katalog: ${row.original.supplier_sales_nama}`
                                : "Tanpa katalog"}
                        </span>
                    </div>
                ),
                size: 220,
            },
            {
                accessorKey: "request_count",
                header: "Jumlah Request",
                cell: ({ row }) => (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                        {row.original.request_count} request
                    </span>
                ),
                size: 130,
            },
            {
                accessorKey: "total_item_lines",
                header: "Total Baris Item",
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600">{row.original.total_item_lines} item</span>
                ),
                size: 130,
            },
            {
                accessorKey: "tanggal_request_terakhir",
                header: "Request Terakhir",
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600">
                        {row.original.tanggal_request_terakhir
                            ? formatToReadableDate(row.original.tanggal_request_terakhir)
                            : "-"}
                    </span>
                ),
                size: 150,
            },
        ],
        [],
    );



    return (
        <div id="req-incoming-summary-table" className="relative">
            <DataTable
                columns={columns}
                data={displaySummaries}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada summary request transfer pending."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="summary"
                virtualize={true}
                estimateRowHeight={44}
                onView={openSummary}
            />
        </div>
    );
}
