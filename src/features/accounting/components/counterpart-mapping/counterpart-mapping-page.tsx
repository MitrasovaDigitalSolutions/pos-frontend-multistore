"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    IconArrowsExchange,
    IconRefresh,
    IconSearch,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { hasPermission, hasRole } from "@/constants/roles";
import { useFlatChartOfAccounts } from "../../api/coa-api";
import {
    useCoaCounterpartMappings,
    useDeleteCoaCounterpartMapping,
} from "../../api/counterpart-mapping-api";
import { useCounterpartMappingFilter } from "./hooks/use-counterpart-mapping-filter";
import { CounterpartQuickAdd } from "./counterpart-quick-add";
import { CounterpartMappingTable } from "./counterpart-mapping-table";
import type { CoaCounterpartMapping } from "../../types";

export function CounterpartMappingPage() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const canView =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_chart_of_accounts") ||
        hasPermission(userRoles, userPermissions, "manage_chart_of_accounts") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    const canManage =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_chart_of_accounts");

    // Queries
    const {
        data: mappings = [],
        isLoading: isLoadingMappings,
        isRefetching: isRefetchingMappings,
        refetch: refetchMappings,
    } = useCoaCounterpartMappings();

    const {
        data: accounts = [],
        isLoading: isLoadingAccounts,
        refetch: refetchAccounts,
    } = useFlatChartOfAccounts();

    // Mutations
    const deleteMutation = useDeleteCoaCounterpartMapping();

    // Editing mapping state
    const [editingMapping, setEditingMapping] = useState<CoaCounterpartMapping | null>(null);

    // Delete dialog state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [mappingToDelete, setMappingToDelete] = useState<CoaCounterpartMapping | null>(null);

    // Search state via hook
    const {
        searchQuery,
        setSearchQuery,
        filteredMappings,
    } = useCounterpartMappingFilter({
        mappings,
        accounts,
    });

    const isLoading = isLoadingMappings || isLoadingAccounts;

    const handleRefetch = () => {
        refetchMappings();
        refetchAccounts();
    };

    // Form reference for reliable auto-scrolling
    const formRef = useRef<HTMLDivElement>(null);

    const handleEditClick = (mapping: CoaCounterpartMapping) => {
        setEditingMapping(mapping);
        // Scroll smoothly to top for both the overflow-y-auto main container and window
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                const mainContainer = formRef.current.closest("main");
                if (mainContainer) {
                    mainContainer.scrollTo({ top: 0, behavior: "smooth" });
                }
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
    };

    const handleDeleteClick = (mapping: CoaCounterpartMapping) => {
        setMappingToDelete(mapping);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!mappingToDelete) return;
        try {
            await deleteMutation.mutateAsync(mappingToDelete.uid);
            toast.success("Mapping lawan akun berhasil dihapus.");
            if (editingMapping?.uid === mappingToDelete.uid) {
                setEditingMapping(null);
            }
            setDeleteOpen(false);
            setMappingToDelete(null);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || "Gagal menghapus mapping lawan akun.");
        }
    };

    if (!canView) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Anda tidak memiliki izin untuk mengakses halaman Mapping Lawan Akun.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-28 sm:pb-8">
            {/* ── Header Bar with Search ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0">
                        <IconArrowsExchange size={18} stroke={2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                                Mapping Lawan Akun (Contra Account)
                            </h1>
                            <span className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200/70 dark:border-blue-900">
                                {mappings.length} Mapping
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Menentukan default akun penyeimbang saat entri jurnal manual atau neraca.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-56">
                        <IconSearch
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari akun..."
                            className="pl-8 pr-3 h-8 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRefetch}
                        disabled={isLoading || isRefetchingMappings}
                        className="rounded-lg border-slate-200 dark:border-slate-700 h-8 text-xs font-semibold shrink-0 cursor-pointer"
                    >
                        <IconRefresh
                            size={13}
                            className={`mr-1.5 ${isRefetchingMappings ? "animate-spin" : ""}`}
                        />
                        <span>Segarkan</span>
                    </Button>
                </div>
            </div>

            {/* ── Form Section (Tambah / Ubah) ── */}
            {canManage && (
                <div ref={formRef} className="scroll-mt-4">
                    <CounterpartQuickAdd
                        key={editingMapping?.uid ?? "create-new"}
                        accounts={accounts}
                        existingMappings={mappings}
                        editingMapping={editingMapping}
                        onCancelEdit={() => setEditingMapping(null)}
                    />
                </div>
            )}

            {/* ── Data Table ── */}
            {isLoading ? (
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-9 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
                        />
                    ))}
                </div>
            ) : (
                <CounterpartMappingTable
                    mappings={filteredMappings}
                    accounts={accounts}
                    editingUid={editingMapping?.uid ?? null}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    canManage={canManage}
                />
            )}

            {/* ── Confirm Delete Dialog ── */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                variant="danger"
                title="Hapus Mapping Lawan Akun?"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus pasangan mapping untuk{" "}
                        <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                            {mappingToDelete?.coa?.nama || "Akun ini"}
                        </strong>
                        ? Tindakan ini tidak dapat dibatalkan.
                    </span>
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
