"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { IconTruckDelivery, IconPlus } from "@tabler/icons-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";

import { useStockTransfers } from "../api/stock-transfer-api";
import { TRANSFER_STATUS_LABELS, TRANSFER_STATUS_CLASSES } from "../constants";
import type { StockTransfer } from "../types";
import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef<StockTransfer>[] = [
    {
        accessorKey: "nomor_transfer",
        header: "No. Transfer",
        cell: ({ row }) => (
            <span className="font-semibold text-slate-800">{row.original.nomor_transfer}</span>
        ),
    },
    {
        id: "source_store",
        header: "Toko Asal",
        cell: ({ row }) => row.original.source_store?.nama || "-",
        enableSorting: false,
    },
    {
        id: "destination_store",
        header: "Toko Tujuan",
        cell: ({ row }) => row.original.destination_store?.nama || "-",
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="outline" className={TRANSFER_STATUS_CLASSES[row.original.status]}>
                {TRANSFER_STATUS_LABELS[row.original.status] || row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "tanggal_kirim",
        header: "Tanggal Kirim",
        cell: ({ row }) =>
            row.original.tanggal_kirim
                ? format(new Date(row.original.tanggal_kirim), "dd MMM yyyy HH:mm", { locale: id })
                : "-",
    },
];

export function TransferListPage() {
    const router = useAppRouter();
    const { data: session } = useSession();

    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

    const { data, isLoading, isFetching } = useStockTransfers({
        page,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const roles = session?.user?.roles || [];
    const permissions = session?.user?.permissions || [];
    const canManage = hasRole(roles, "admin") || hasPermission(roles, permissions, "manage_stock_transfers");
    const canView = canManage || hasPermission(roles, permissions, "view_stock_transfers");

    if (!canView) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat transfer stok.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <IconTruckDelivery size={20} className="text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Transfer Stok</h1>
                        <p className="text-xs text-slate-400">Kelola perpindahan stok antar cabang</p>
                    </div>
                </div>
                {canManage && (
                    <Button onClick={() => router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/new`)}>
                        <IconPlus className="mr-2 h-4 w-4" />
                        Buat Transfer
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data?.data || []}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Belum ada transfer stok."
                page={page}
                onPageChange={setPage}
                meta={data?.meta}
                entityName="transfer"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setPage(1);
                }}
                onView={(transfer) => router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/${transfer.uid}`)}
            />
        </div>
    );
}
