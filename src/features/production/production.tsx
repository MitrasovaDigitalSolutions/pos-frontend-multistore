"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, DataTableActionButton } from "@/components/ui/data-table";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { Show } from "@/components/ui/show";
import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { IconAlertTriangle, IconAssembly, IconBan, IconPlus } from "@tabler/icons-react";
import {
    useDeleteProduction,
    useProductions,
    useVoidProduction,
} from "./api/production-api";
import { ProductionDetailDialog } from "./components/production-detail-dialog";
import { ProductionFinalizeDialog } from "./components/production-finalize-dialog";
import { useProductionColumns } from "./components/use-production-columns";
import type { Production } from "./types";

interface ProductionFilterValues {
    q: string;
    status: string;
    dari: string;
    sampai: string;
}

export function ProductionPage() {
    const router = useAppRouter();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewPermission =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_production") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const hasManagePermission =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [sortBy, setSortBy] = useState<string | undefined>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

    const [filters, setFilters] = useState<{
        q?: string;
        status?: string;
        dari?: string;
        sampai?: string;
    }>({});

    const [selectedProductionUid, setSelectedProductionUid] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Action dialog states
    const [actionProduction, setActionProduction] = useState<Production | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isVoidOpen, setIsVoidOpen] = useState(false);
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);

    const deleteMutation = useDeleteProduction();
    const voidMutation = useVoidProduction();

    const filterMethods = useForm<ProductionFilterValues>({
        defaultValues: {
            q: "",
            status: "all",
            dari: "",
            sampai: "",
        },
    });

    const handleFilterSubmit = (data: ProductionFilterValues) => {
        setFilters({
            q: data.q || undefined,
            status: data.status !== "all" ? data.status : undefined,
            dari: data.dari || undefined,
            sampai: data.sampai || undefined,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            q: "",
            status: "all",
            dari: "",
            sampai: "",
        });
        setFilters({});
        setPage(1);
    };

    const { data: res, isLoading, isFetching } = useProductions({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...filters,
    });

    const productions = res?.data || [];
    const meta = res?.meta;

    const handleViewDetail = (item: Production) => {
        setSelectedProductionUid(item.uid);
        setIsDetailOpen(true);
    };

    const handleEditDraft = (item: Production) => {
        router.push(ROUTES.ADMIN_PRODUCTION_EDIT(item.uid));
    };

    const handleDeleteClick = (item: Production) => {
        setActionProduction(item);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!actionProduction) return;
        try {
            await deleteMutation.mutateAsync(actionProduction.uid);
            toast.success("Draft produksi berhasil dihapus.");
            setIsDeleteOpen(false);
            setActionProduction(null);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error?.message || "Gagal menghapus draft produksi.");
        }
    };

    const handleVoidClick = (item: Production) => {
        setActionProduction(item);
        setIsVoidOpen(true);
    };

    const handleConfirmVoid = async () => {
        if (!actionProduction) return;
        try {
            await voidMutation.mutateAsync(actionProduction.uid);
            toast.success("Transaksi produksi berhasil dibatalkan (void).");
            setIsVoidOpen(false);
            setActionProduction(null);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error?.message || "Gagal membatalkan transaksi produksi.");
        }
    };

    const handleFinalizeClick = (item: Production) => {
        setActionProduction(item);
        setIsFinalizeOpen(true);
    };

    const columns = useProductionColumns();

    if (!hasViewPermission) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat data riwayat produksi harian."
                requiredPermission="view_production"
            />
        );
    }

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "completed", label: "Selesai (Completed)" },
        { value: "draft", label: "Draft" },
        { value: "void", label: "Dibatalkan (Void)" },
    ];

    return (
        <div className="space-y-6">
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
                            <IconAssembly size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Produksi Harian (Bahan Baku &amp; Konveksi)
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Catatan pemakaian bahan baku, konversi barang jadi, dan alokasi HPP otomatis.
                            </p>
                        </div>
                    </div>

                    <Show.When isTrue={hasManagePermission}>
                        <Button
                            onClick={() => router.push(ROUTES.ADMIN_PRODUCTION_CREATE)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                            <IconPlus size={16} /> Buat Produksi Baru
                        </Button>
                    </Show.When>
                </div>

                <FilterForm
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<ProductionFilterValues>
                        name="q"
                        label="Cari Produksi"
                        placeholder="Cari nomor produksi atau catatan..."
                    />
                    <FormSelect<ProductionFilterValues>
                        name="status"
                        label="Status"
                        options={statusOptions}
                        placeholder="Semua Status"
                    />
                    <FormDatePicker<ProductionFilterValues>
                        name="dari"
                        label="Dari Tanggal"
                        placeholder="Pilih tanggal mulai"
                    />
                    <FormDatePicker<ProductionFilterValues>
                        name="sampai"
                        label="Sampai Tanggal"
                        placeholder="Pilih tanggal akhir"
                    />
                </FilterForm>

                <DataTable
                    columns={columns}
                    data={productions}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="Belum ada riwayat produksi tercatat."
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    meta={meta}
                    entityName="produksi"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    onView={handleViewDetail}
                    onEdit={handleEditDraft}
                    hideEdit={(row) => row.status !== "draft" || !hasManagePermission}
                    onDelete={handleDeleteClick}
                    hideDelete={(row) => row.status !== "draft" || !hasManagePermission}
                    onCheck={handleFinalizeClick}
                    hideCheck={(row) => row.status !== "draft" || !hasManagePermission}
                    extraActions={(row) =>
                        row.status === "completed" && hasManagePermission ? (
                            <DataTableActionButton
                                variant="rose"
                                onClick={() => handleVoidClick(row)}
                                tooltip="Batalkan (Void)"
                            >
                                <IconBan size={16} />
                            </DataTableActionButton>
                        ) : null
                    }
                />
            </section>

            {/* Detail Dialog */}
            <ProductionDetailDialog
                productionUid={selectedProductionUid}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />

            {/* Confirm Dialog: Delete Draft */}
            <ConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Hapus Draft Produksi"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus draft produksi{" "}
                        <span className="font-mono font-bold text-slate-800">
                            #{actionProduction?.nomor_produksi}
                        </span>
                        ? Tindakan ini akan menghapus data draft secara permanen.
                    </span>
                }
                confirmText="Hapus Draft"
                cancelText="Batal"
                variant="danger"
                isLoading={deleteMutation.isPending}
                onConfirm={handleConfirmDelete}
            />

            {/* Confirm Dialog: Void Completed */}
            <ConfirmDialog
                open={isVoidOpen}
                onOpenChange={setIsVoidOpen}
                title="Batalkan (Void) Produksi"
                description={
                    <div className="space-y-2 text-left">
                        <p>
                            Apakah Anda yakin ingin membatalkan transaksi produksi{" "}
                            <span className="font-mono font-bold text-slate-800">
                                #{actionProduction?.nomor_produksi}
                            </span>
                            ?
                        </p>
                        <div className="flex items-start gap-1.5 p-2 bg-rose-50 border border-rose-200/60 rounded-lg text-rose-800 text-[11px] leading-relaxed">
                            <IconAlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                            <span>
                                Pembatalan ini akan memulihkan stok bahan baku, mengurangi stok barang jadi, dan mencatat pembalikan jurnal. Tindakan ini tidak dapat diulang.
                            </span>
                        </div>
                    </div>
                }
                confirmText="Ya, Batalkan Transaksi"
                cancelText="Kembali"
                variant="danger"
                isLoading={voidMutation.isPending}
                onConfirm={handleConfirmVoid}
            />

            {/* Finalize Dialog */}
            <ProductionFinalizeDialog
                open={isFinalizeOpen}
                onOpenChange={setIsFinalizeOpen}
                productionUid={actionProduction?.uid || null}
                nomorProduksi={actionProduction?.nomor_produksi}
                onSuccess={() => {
                    setActionProduction(null);
                }}
            />
        </div>
    );
}
