"use client";

import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { User } from "@/features/users/types";

interface GlobalUserTableProps {
    users: User[];
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
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function GlobalUserTable({
    users,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    isLoading = false,
    isFetching = false,
    filterElement,
    sortBy,
    sortOrder,
    onSortChange,
}: GlobalUserTableProps) {
    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Nama Lengkap",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900">
                        {row.original.name}
                    </span>
                ),
                size: 200,
            },
            {
                accessorKey: "username",
                header: "Username",
                cell: ({ row }) => (
                    <span className="text-slate-500 font-mono">
                        {row.original.username}
                    </span>
                ),
                size: 140,
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => (
                    <span className="text-slate-500">
                        {row.original.email || "-"}
                    </span>
                ),
                size: 200,
            },
            {
                accessorKey: "roles",
                header: "Role Peran",
                enableSorting: false,
                cell: ({ row }) => {
                    const u = row.original;
                    const primaryRole = u.roles?.[0] || "-";
                    return (
                        <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${u.roles?.includes("admin")
                                ? "bg-emerald-50 text-emerald-700"
                                : u.roles?.includes("manajer_toko")
                                    ? "bg-amber-50 text-amber-700"
                                    : u.roles?.includes("supervisor")
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-slate-100 text-slate-700"
                                }`}
                        >
                            {primaryRole.replace("_", " ")}
                        </span>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "stores",
                header: "Toko Terkait",
                enableSorting: false,
                cell: ({ row }) => {
                    const stores = row.original.stores;
                    if (!stores || stores.length === 0) {
                        return <span className="text-slate-400 text-xs">-</span>;
                    }
                    return (
                        <div className="flex flex-wrap gap-1">
                            {stores.map((s, idx) => {
                                const storeKey = s.uid || (s as { id?: string | number }).id || `${s.nama || "store"}-${idx}`;
                                return (
                                    <span
                                        key={storeKey}
                                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                                    >
                                        {s.nama}
                                    </span>
                                );
                            })}
                        </div>
                    );
                },
                size: 220,
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: false,
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const u = row.original;
                    return (
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                                }`}
                        >
                            {u.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                    );
                },
                size: 80,
            },
        ],
        []
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Akun Pengguna Sistem
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar seluruh akun pengguna sistem (kasir, supervisor, manajer, admin) dan toko tempat pengguna terdaftar.
                    </p>
                </div>
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={users}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada pengguna ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="pengguna"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
            />
        </section>
    );
}
