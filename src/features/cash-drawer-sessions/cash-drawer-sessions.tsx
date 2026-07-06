"use client";

import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { useCashDrawerSessions } from "@/features/checkout/api/cash-drawer-api";
import type { CashDrawerSession } from "@/features/checkout/types/cash-drawer";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { ColumnDef } from "@tanstack/react-table";
import { Hourglass } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { SessionDetailDialog } from "./components/session-detail-dialog";
import { SessionFilter } from "./components/session-filter";
import { formatToReadableDateTime } from "@/lib/date-utils";

export function CashDrawerSessions() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewSessions =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_cash_drawer");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>("opened_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");
    const [filters, setFilters] = useState<{
        status?: "open" | "closed";
        user_uid?: string;
        from?: string;
        to?: string;
    }>({});

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data: sessionsData, isLoading, isFetching } = useCashDrawerSessions({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,

        ...filters,
    });

    const handleFilter = (newFilters: typeof filters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleView = (s: CashDrawerSession) => {
        setSelectedSessionId(s.uid);
        setIsDetailOpen(true);
    };

    const columns = useMemo<ColumnDef<CashDrawerSession>[]>(
        () => [
            {
                accessorKey: "user.name",
                header: "Operator / Kasir",
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">
                            {row.original.user?.name || "Sistem / Kasir"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                            @{row.original.user?.username || "unknown"}
                        </span>
                    </div>
                ),
                size: 240,
            },
            {
                accessorKey: "opened_at",
                header: "Waktu Buka",
                cell: ({ row }) => (
                    <span className="text-slate-500 font-medium text-xs">
                        {formatToReadableDateTime(row.original.opened_at)}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "closed_at",
                header: "Waktu Tutup",
                cell: ({ row }) => (
                    <span className="text-slate-500 font-medium text-xs">
                        {row.original.closed_at ? (
                            formatToReadableDateTime(row.original.closed_at)
                        ) : (
                            <span className="text-emerald-600 font-bold italic text-[11px]">Aktif / Terbuka</span>
                        )}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "expected_cash",
                header: "Expected Cash",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="font-semibold text-slate-700 text-xs tabular-nums">
                        {formatRupiah(row.original.expected_cash)}
                    </span>
                ),
                size: 120,
            },
            {
                accessorKey: "difference",
                header: "Selisih",
                enableSorting: false,
                cell: ({ row }) => {
                    const diff = row.original.difference;
                    if (row.original.status === "open") return <span className="text-slate-400">-</span>;
                    if (diff === null || diff === undefined) return <span className="text-slate-400">-</span>;

                    if (diff > 0) {
                        return (
                            <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-100 tabular-nums">
                                +{formatRupiah(diff)}
                            </span>
                        );
                    }
                    if (diff < 0) {
                        return (
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-100 tabular-nums">
                                {formatRupiah(diff)}
                            </span>
                        );
                    }
                    return (
                        <span className="text-slate-500 font-bold text-xs tabular-nums">0</span>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: false,
                cell: ({ row }) => {
                    const status = row.original.status;
                    return status === "open" ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Terbuka
                        </span>
                    ) : (
                        <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Ditutup
                        </span>
                    );
                },
                size: 80,
            },
        ],
        [],
    );

    if (!hasViewSessions) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat sesi kasir.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <Hourglass size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Sesi Kasir & Shift
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Pantau status laci kasir, saldo, selisih kas, dan riwayat shift operator kasir.
                            </p>
                        </div>
                    </div>
                </div>

                <SessionFilter onFilter={handleFilter} />

                <DataTable
                    columns={columns}
                    data={sessionsData?.data || []}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="Tidak ada sesi kasir ditemukan."
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    meta={sessionsData?.meta}
                    entityName="sesi kasir"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    virtualize={true}
                    estimateRowHeight={50}
                    onView={handleView}
                />
            </section>

            <SessionDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                sessionId={selectedSessionId}
            />
        </div>
    );
}
