"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/ui/data-table";
import type { RequestTransferSummary } from "../types";

interface RequestTransferSummaryListProps {
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
    filterElement?: React.ReactNode;
}

export function RequestTransferSummaryList({
    summaries,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    isLoading = false,
    isFetching = false,
    filterElement,
}: RequestTransferSummaryListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const canManage =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_request_transfers");

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [canManage],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Summary Request Transfer</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar permintaan stok yang masih pending, dikelompokkan per supplier dan katalog.
                    </p>
                </div>
                {canManage && (
                    <Button
                        onClick={() => router.push(ROUTES.ADMIN_REQUEST_TRANSFERS_CREATE)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Buat Request
                    </Button>
                )}
            </div>

            {filterElement}

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
        </section>
    );
}
