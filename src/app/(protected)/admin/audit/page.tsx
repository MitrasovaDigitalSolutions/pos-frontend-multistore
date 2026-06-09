"use client";

import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { useActivityLogs, type ActivityLog } from "@/features/stock/api/stock-api";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

export default function AdminAuditPage() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewAuditLogs =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_audit_logs");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    // const [actionFilter, setActionFilter] = useState<string>("all");


    // Debounce search input to avoid excessive API requests
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on search
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    const { data: logsData, isLoading, isFetching } = useActivityLogs({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
    });

    // const filteredLogs = useMemo(() => {
    //     const data = logsData?.data || [];
    //     if (actionFilter === "all") return data;
    //     return data.filter((log) => log.action.includes(actionFilter));
    // }, [logsData?.data, actionFilter]);

    const getActionBadgeClass = (action: string) => {
        if (action.includes("login") || action.includes("logout")) {
            return "bg-slate-100 text-slate-700 border-slate-200";
        }
        if (action.includes("delete")) {
            return "bg-rose-50 text-rose-700 border-rose-100";
        }
        if (action.includes("create") || action.includes("store")) {
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        }
        if (action.includes("update") || action.includes("edit")) {
            return "bg-amber-50 text-amber-700 border-amber-100";
        }
        if (action.includes("finalize")) {
            return "bg-teal-50 text-teal-700 border-teal-100";
        }
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    };

    const columns = useMemo<ColumnDef<ActivityLog>[]>(
        () => [
            {
                accessorKey: "created_at",
                header: "Tanggal",
                cell: ({ row }) => (
                    <span className="text-slate-500 font-medium text-xs">
                        {new Date(row.original.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </span>
                ),
            },
            {
                accessorKey: "user",
                header: "Pengguna / Petugas",
                cell: ({ row }) => {
                    const user = row.original.user;
                    return (
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">
                                {user ? user.name : "Sistem"}
                            </span>
                            {user && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                    @{user.username}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "action",
                header: "Aksi",
                cell: ({ row }) => {
                    const action = row.original.action;
                    return (
                        <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${getActionBadgeClass(
                                action,
                            )}`}
                        >
                            {action.replace(/_/g, " ")}
                        </span>
                    );
                },
            },
            {
                accessorKey: "description",
                header: "Deskripsi",
                cell: ({ row }) => (
                    <span className="text-slate-700 font-medium text-xs break-all">
                        {row.original.description}
                    </span>
                ),
            },
            {
                accessorKey: "ip_address",
                header: "IP Address",
                cell: ({ row }) => (
                    <span className="text-slate-400 font-mono text-[10px]">
                        {row.original.ip_address || "-"}
                    </span>
                ),
            },
        ],
        [],
    );

    if (!hasViewAuditLogs) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat log aktivitas.</p>
            </div>
        );
    }

    // const actionFilterSlot = (
    //     <CommandSelect
    //         value={actionFilter}
    //         onChange={(val) => {
    //             setActionFilter(val);
    //             setPage(1);
    //         }}
    //         options={[
    //             { value: "all", label: "Semua Aksi" },
    //             { value: "login", label: "Autentikasi" },
    //             { value: "supplier", label: "Supplier" },
    //             { value: "receiving", label: "Penerimaan" },
    //             { value: "opname", label: "Opname" },
    //             { value: "adjustment", label: "Adjustment" },
    //         ]}
    //         wrapperClassName="w-40"
    //         searchPlaceholder="Cari tipe aksi..."
    //         placeholder="Pilih Aksi"
    //     />
    // );

    return (
        <div className="space-y-6">
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Log Aktivitas & Audit Keamanan
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Catatan lengkap aktivitas pengguna, mutasi stok, login, dan perubahan master data.
                        </p>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={logsData?.data || []}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="Tidak ada catatan aktivitas ditemukan."
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    meta={logsData?.meta}
                    entityName="log aktivitas"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Cari log berdasarkan deskripsi atau user..."
                    // filters={actionFilterSlot}
                    virtualize={true}
                    estimateRowHeight={44}
                />
            </section>
        </div>
    );
}
