"use client";

import { useMemo } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { formatToReadableDate } from "@/lib/date-utils";
import { ROUTES } from "@/constants/routes";
import type { RequestTransferSummary } from "../../types";

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
                    <span className="font-bold text-slate-900 text-xs">
                        {row.original.request_to_nama || "Pusat"}
                    </span>
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
        <DataTable
            columns={columns}
            data={summaries}
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
    );
}
