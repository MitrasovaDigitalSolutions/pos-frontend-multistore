"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
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
}: RequestTransferSummaryTableProps) {
    const router = useRouter();

    const openSummary = (s: RequestTransferSummary) => {
        const params = new URLSearchParams({ supplier_uid: s.supplier_uid });
        if (s.supplier_sales_uid) {
            params.set("supplier_sales_uid", s.supplier_sales_uid);
        }
        router.push(`${ROUTES.ADMIN_REQUEST_TRANSFERS_DETAIL}?${params.toString()}`);
    };

    const columns = useMemo<ColumnDef<RequestTransferSummary>[]>(
        () => [
            {
                accessorKey: "supplier_nama",
                header: "Supplier",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900 text-xs">
                            {row.original.supplier_nama}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {row.original.supplier_sales_nama
                                ? `Katalog: ${row.original.supplier_sales_nama}`
                                : "Tanpa katalog"}
                        </span>
                    </div>
                ),
                size: 280,
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
                        {row.original.tanggal_request_terakhir || "-"}
                    </span>
                ),
                size: 130,
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
