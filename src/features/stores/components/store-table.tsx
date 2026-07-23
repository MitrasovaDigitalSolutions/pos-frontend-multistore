"use client";

import { useMemo } from "react";
import { IconUsers, IconBuildingStore, IconPlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AppButton } from "@/components/shared/app-button";
import { ColumnDef } from "@tanstack/react-table";
import type { Store } from "../types";

interface StoreTableProps {
    stores: Store[];
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
    onEdit: (store: Store) => void;
    onManageUsers: (store: Store) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
    onAddClick?: () => void;
    hasManageStores?: boolean;
}

export function StoreTable({
    stores,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    onEdit,
    onManageUsers,
    isLoading = false,
    isFetching = false,
    filterElement,
    sortBy,
    sortOrder,
    onSortChange,
    onAddClick,
    hasManageStores = false,
}: StoreTableProps) {
    const columns = useMemo<ColumnDef<Store>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Nama Toko",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                            <IconBuildingStore size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 truncate">
                                    {row.original.nama}
                                </span>
                                {row.original.is_central && (
                                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-[9px] font-extrabold px-1.5 py-0 h-4 leading-none shrink-0 uppercase tracking-wider">
                                        Pusat
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                ),
                size: 220,
            },
            {
                accessorKey: "alamat",
                header: "Alamat",
                cell: ({ row }) => (
                    <span className="text-slate-600 text-xs line-clamp-1 min-w-[150px]">
                        {row.original.alamat || "-"}
                    </span>
                ),
                size: 280,
            },
            {
                accessorKey: "telepon",
                header: "Telepon",
                cell: ({ row }) => (
                    <span className="text-slate-600 text-xs font-mono">
                        {row.original.telepon || "-"}
                    </span>
                ),
                size: 150,
            },
            {
                accessorKey: "users_count",
                header: "Jumlah User",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => (
                    <span className="inline-flex items-center justify-center min-w-[2.25rem] h-6 px-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold">
                        {row.original.users_count ?? 0}
                    </span>
                ),
                size: 110,
            },
            {
                accessorKey: "is_active",
                header: "Status",
                cell: ({ row }) => (
                    <Badge variant={row.original.is_active ? "default" : "secondary"} className={row.original.is_active ? "bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border-emerald-200" : ""}>
                        {row.original.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                ),
                size: 100,
            },
        ],
        []
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Cabang Toko
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar cabang toko ritel dan status operasional masing-masing.
                    </p>
                </div>
                {hasManageStores && onAddClick && (
                    <AppButton
                        type="button"
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Toko
                    </AppButton>
                )}
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={stores}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="toko"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                onEdit={onEdit}
                extraActions={(store) => (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <AppButton
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => onManageUsers(store)}
                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                                <IconUsers size={16} />
                            </AppButton>
                        </TooltipTrigger>
                        <TooltipContent>Kelola User</TooltipContent>
                    </Tooltip>
                )}
            />
        </section>
    );
}