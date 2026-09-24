"use client";

import { AppButton } from "@/components/shared/app-button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { DataTableActionButton } from "@/components/ui/data-table-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { IconBuildingStore, IconPlus, IconUsers, IconLock, IconSparkles } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import Link from "next/link";
import { useHasAddon } from "@/stores/license-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Store } from "../types";
import { STORE_BADGE_HQ } from "@/constants/store";

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
                                        {STORE_BADGE_HQ}
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
                    <StatusBadge status={row.original.is_active ? "active" : "inactive"} />
                ),
                size: 100,
            },
        ],
        []
    );

    const hasMultiStore = useHasAddon("multi_store");
    const totalStores = meta?.total ?? stores.length;
    const isMultiStoreLocked = totalStores >= 1 && !hasMultiStore;

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            {isMultiStoreLocked && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                            <IconLock size={16} />
                        </div>
                        <p className="text-xs leading-relaxed">
                            <span className="font-bold">Paket Toko Tunggal Aktif:</span> Untuk menambah cabang baru, transfer stok antar cabang, dan laporan multi-toko, aktifkan add-on <span className="font-bold text-amber-700 dark:text-amber-400">Multi-Store</span>.
                        </p>
                    </div>
                    <Link
                        href="/licenses?tab=catalog"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                    >
                        <IconSparkles size={14} />
                        Aktifkan Multi-Store
                    </Link>
                </div>
            )}

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
                    isMultiStoreLocked ? (
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <AppButton
                                            type="button"
                                            disabled
                                            className="bg-slate-200 text-slate-400 font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-not-allowed opacity-70"
                                        >
                                            <IconLock size={15} /> Tambah Toko
                                        </AppButton>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs text-center text-xs">
                                    Memerlukan add-on Multi-Store untuk menambah lebih dari 1 cabang toko.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <AppButton
                            type="button"
                            onClick={onAddClick}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                        >
                            <IconPlus size={16} /> Tambah Toko
                        </AppButton>
                    )
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
                    <DataTableActionButton
                        variant="emerald"
                        onClick={() => onManageUsers(store)}
                        tooltip="Kelola User"
                    >
                        <IconUsers size={16} />
                    </DataTableActionButton>
                )}
            />
        </section>
    );
}