"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus, IconAward } from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Member } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { useDeleteMember } from "../api/members-api";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";

interface MemberListProps {
    members: Member[];
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
    onEdit: (member: Member) => void;
    onAdjustPoints: (member: Member) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function MemberList({
    members,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    onEdit,
    onAdjustPoints,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filterElement,
    sortBy,
    sortOrder,
    onSortChange,
}: MemberListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageMembers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_members");

    const getSetting = useSettingsStore((state) => state.getSetting);
    const pointSystemEnabled = getSetting("point_system_enabled", "true") === "true";

    const deleteMember = useDeleteMember();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

    const handleDelete = (m: Member) => {
        setMemberToDelete(m);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!memberToDelete) return;
        deleteMember.mutate(memberToDelete.uid, {
            onSuccess: () => {
                toast.success(`Member "${memberToDelete.nama}" berhasil dihapus.`);
                setIsConfirmOpen(false);
                setMemberToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus member.");
            },
        });
    };

    const columns = useMemo<ColumnDef<Member>[]>(
        () => {
            const baseColumns: ColumnDef<Member>[] = [
                {
                    accessorKey: "kode",
                    header: "Kode Member",
                    cell: ({ row }) => (
                        <span className="font-mono font-bold text-slate-700 text-xs">
                            {row.original.kode}
                        </span>
                    ),
                    size: 150,
                },
                {
                    accessorKey: "nama",
                    header: "Nama Member",
                    cell: ({ row }) => (
                        <span className="font-bold text-slate-900 text-xs">
                            {row.original.nama}
                        </span>
                    ),
                    size: 220,
                },
                {
                    accessorKey: "nomor_telepon",
                    header: "No. Telepon",
                    cell: ({ row }) => (
                        <span className="text-slate-500 text-xs">
                            {row.original.nomor_telepon || "-"}
                        </span>
                    ),
                    size: 150,
                },
                {
                    accessorKey: "email",
                    header: "Email",
                    cell: ({ row }) => (
                        <span className="text-slate-500 text-xs">
                            {row.original.email || "-"}
                        </span>
                    ),
                    size: 200,
                },
            ];

            if (pointSystemEnabled) {
                baseColumns.push({
                    accessorKey: "poin",
                    header: "Poin",
                    cell: ({ row }) => (
                        <span className="font-bold text-emerald-600 text-xs">
                            {row.original.poin.toLocaleString("id-ID")}
                        </span>
                    ),
                    size: 100,
                });
            }

            baseColumns.push({
                accessorKey: "status",
                header: "Status",
                enableSorting: false,
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const m = row.original;
                    return (
                        <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${m.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                        >
                            {m.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                    );
                },
                size: 100,
            });

            return baseColumns;
        },
        [pointSystemEnabled],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Member / Pelanggan
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar member terdaftar untuk program poin loyalitas pelanggan.
                    </p>
                </div>
                {hasManageMembers && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer border-none"
                    >
                        <IconPlus size={16} /> Tambah Member
                    </Button>
                )}
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={members}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada data member ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="member"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
                onEdit={hasManageMembers ? onEdit : undefined}
                onDelete={hasManageMembers ? handleDelete : undefined}
                extraActions={hasManageMembers && pointSystemEnabled ? (member) => (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onAdjustPoints(member)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                            >
                                <IconAward size={16} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Sesuaikan Poin</TooltipContent>
                    </Tooltip>
                ) : undefined}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Member"
                description={
                    memberToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus member{" "}
                            <strong className="font-semibold text-slate-900">
                                {memberToDelete.nama}
                            </strong>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menghapus member ini?"
                    )
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                isLoading={deleteMember.isPending}
                variant="danger"
            />
        </section>
    );
}
