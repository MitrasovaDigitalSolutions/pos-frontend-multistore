"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { useDeactivateUser } from "../api/users-api";
import type { User } from "../types";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { CommandSelect } from "@/components/ui/command-select";

interface UserTableProps {
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
    search: string;
    onSearchChange: (search: string) => void;
    onEdit: (user: User) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

export function UserTable({
    users,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    search,
    onSearchChange,
    onEdit,
    onAddClick,
    isLoading = false,
    isFetching = false,
}: UserTableProps) {
    const { data: session } = useSession();
    const deactivateUser = useDeactivateUser();
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    const currentUser = session?.user;

    const handleDeactivate = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menonaktifkan pengguna ini?")) {
            deactivateUser.mutate(id, {
                onSuccess: () => {
                    toast.success("Pengguna berhasil dinonaktifkan.");
                },
                onError: () => {
                    toast.error("Gagal menonaktifkan pengguna.");
                },
            });
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            if (statusFilter === "all") return true;
            return u.status === statusFilter;
        });
    }, [users, statusFilter]);

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
            },
            {
                accessorKey: "username",
                header: "Username",
                cell: ({ row }) => (
                    <span className="text-slate-500 font-mono">
                        {row.original.username}
                    </span>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => (
                    <span className="text-slate-500">
                        {row.original.email || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "roles",
                header: "Role Peran",
                cell: ({ row }) => {
                    const u = row.original;
                    return (
                        <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                u.roles.includes("admin")
                                    ? "bg-indigo-50 text-indigo-700"
                                    : u.roles.includes("manajer_toko")
                                      ? "bg-amber-50 text-amber-700"
                                      : u.roles.includes("supervisor")
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-slate-100 text-slate-700"
                            }`}
                        >
                            {u.roles[0]?.replace("_", " ")}
                        </span>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const u = row.original;
                    return (
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                u.status === "active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                            }`}
                        >
                            {u.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                header: "Aksi",
                enableSorting: false,
                meta: {
                    headerClassName: "text-center w-28",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const u = row.original;
                    return (
                        <div className="flex justify-center gap-1.5">
                            <button
                                onClick={() => onEdit(u)}
                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                            >
                                <IconEdit size={16} />
                            </button>
                            {currentUser &&
                                u.id !== currentUser.id &&
                                u.status === "active" && (
                                    <button
                                        onClick={() => handleDeactivate(u.id)}
                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                )}
                        </div>
                    );
                },
            },
        ],
        [currentUser],
    );

    const filtersSlot = (
        <CommandSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as any)}
            options={[
                { value: "all", label: "Semua Status" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
            ]}
            wrapperClassName="w-36"
            searchPlaceholder="Cari status..."
            placeholder="Pilih status"
        />
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Kelola Pengguna Sistem
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar akun kasir, supervisor, dan manajer.
                    </p>
                </div>
                <Button
                    onClick={onAddClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                >
                    <IconPlus size={16} /> Tambah Pengguna
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredUsers}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada pengguna ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="pengguna"
                search={search}
                onSearchChange={onSearchChange}
                searchPlaceholder="Cari user berdasarkan nama atau username..."
                filters={filtersSlot}
                virtualize={true}
                estimateRowHeight={44}
            />
        </section>
    );
}
