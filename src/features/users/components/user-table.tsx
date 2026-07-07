/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { IconPlus } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeactivateUser } from "../api/users-api";
import type { User } from "../types";

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
    onEdit: (user: User) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function UserTable({
    users,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    onEdit,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filterElement,
    sortBy,
    sortOrder,
    onSortChange,
}: UserTableProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageUsers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_users");

    const deactivateUser = useDeactivateUser();

    const currentUser = session?.user;

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

    const handleDeactivate = (u: User) => {
        setUserToDeactivate(u);
        setIsConfirmOpen(true);
    };

    const handleConfirmDeactivate = () => {
        if (!userToDeactivate) return;
        deactivateUser.mutate(userToDeactivate.uid, {
            onSuccess: () => {
                toast.success(`Pengguna "${userToDeactivate.name}" berhasil dinonaktifkan.`);
                setIsConfirmOpen(false);
                setUserToDeactivate(null);
            },
            onError: () => {
                toast.error("Gagal menonaktifkan pengguna.");
            },
        });
    };

    const columns = useMemo<ColumnDef<User>[]>(
        () => {
            const baseColumns: ColumnDef<User>[] = [
                {
                    accessorKey: "name",
                    header: "Nama Lengkap",
                    cell: ({ row }) => (
                        <span className="font-bold text-slate-900">
                            {row.original.name}
                        </span>
                    ),
                    size: 240,
                },
                {
                    accessorKey: "username",
                    header: "Username",
                    cell: ({ row }) => (
                        <span className="text-slate-500 font-mono">
                            {row.original.username}
                        </span>
                    ),
                    size: 160,
                },
                {
                    accessorKey: "email",
                    header: "Email",
                    cell: ({ row }) => (
                        <span className="text-slate-500">
                            {row.original.email || "-"}
                        </span>
                    ),
                    size: 240,
                },
                {
                    accessorKey: "roles",
                    header: "Role Peran",
                    enableSorting: false,
                    cell: ({ row }) => {
                        const u = row.original;
                        return (
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${u.roles.includes("admin")
                                    ? "bg-emerald-50 text-emerald-700"
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
                    size: 120,
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
            ];

            return baseColumns;
        },
        [hasManageUsers],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Pengguna Sistem
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar akun kasir, supervisor, dan manajer.
                    </p>
                </div>
                {hasManageUsers && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Pengguna
                    </Button>
                )}
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
                onEdit={hasManageUsers ? onEdit : undefined}
                onDelete={hasManageUsers ? handleDeactivate : undefined}
                hideDelete={(u) => !(currentUser && u.uid !== currentUser.uid && u.status === "active")}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Nonaktifkan Pengguna"
                description={
                    userToDeactivate ? (
                        <span>
                            Apakah Anda yakin ingin menonaktifkan pengguna{" "}
                            <strong className="font-semibold text-slate-900">
                                {userToDeactivate.name}
                            </strong>
                            ? Akun ini tidak akan bisa digunakan untuk masuk ke sistem.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menonaktifkan pengguna ini?"
                    )
                }
                confirmText="Ya, Nonaktifkan"
                cancelText="Batal"
                onConfirm={handleConfirmDeactivate}
                isLoading={deactivateUser.isPending}
                variant="danger"
            />
        </section>
    );
}
