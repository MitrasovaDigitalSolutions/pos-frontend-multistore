"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasPermission, hasRole } from "@/constants/roles";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { IconPlus, IconCircleX, IconChevronRight } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useDeferredValue, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    useCancelPurchaseOrder,
    useDeletePurchaseOrder,
    useFinalizePurchaseOrder,
    usePurchaseOrders,
} from "../../api/purchase-api";
import type { PurchaseOrder } from "../../types";
import {
    PO_STATUS,
    PO_STATUS_LABELS,
    type POStatus,
} from "@/constants/purchase";
import { formatDate } from "@/lib/date-utils";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { poColumns } from "./po-columns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";

interface POFilterValues {
    search: string;
    status: string;
    supplier_uid: string;
    start_date: string;
    end_date: string;
}

export function POListPage() {
    const { data: session } = useSession();
    const router = useAppRouter();
    const deleteOrder = useDeletePurchaseOrder();
    const finalizeOrder = useFinalizePurchaseOrder();
    const cancelOrder = useCancelPurchaseOrder();
    const { data: suppliers = [] } = useAllSuppliers();

    const [orderPage, setOrderPage] = useState(1);
    const [sortBy, setSortBy] = useState<string | undefined>("tanggal_po");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        supplier_uid: "all",
        start_date: "",
        end_date: "",
    });

    const deferredFilters = useDeferredValue(filters);

    const filterMethods = useForm<POFilterValues>({
        defaultValues: {
            search: "",
            status: "all",
            supplier_uid: "all",
            start_date: "",
            end_date: "",
        },
    });

    const handleFilterSubmit = (data: POFilterValues) => {
        setFilters({
            search: data.search,
            status: data.status,
            supplier_uid: data.supplier_uid,
            start_date: data.start_date,
            end_date: data.end_date,
        });
        setOrderPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            status: "all",
            supplier_uid: "all",
            start_date: "",
            end_date: "",
        });
        setFilters({
            search: "",
            status: "all",
            supplier_uid: "all",
            start_date: "",
            end_date: "",
        });
        setOrderPage(1);
    };

    // Prepare API params
    const apiParams: {
        page: number;
        per_page: number;
        search?: string;
        status?: string;
        supplier_uid?: string;
        start_date?: string;
        end_date?: string;
        sort_by?: string;
        sort_order?: "asc" | "desc";
    } = {
        page: orderPage,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
    };
    if (deferredFilters.search) {
        apiParams.search = deferredFilters.search;
    }
    if (deferredFilters.status && deferredFilters.status !== "all") {
        apiParams.status = deferredFilters.status;
    }
    if (deferredFilters.supplier_uid && deferredFilters.supplier_uid !== "all") {
        apiParams.supplier_uid = deferredFilters.supplier_uid;
    }
    if (deferredFilters.start_date) {
        apiParams.start_date = deferredFilters.start_date;
    }
    if (deferredFilters.end_date) {
        apiParams.end_date = deferredFilters.end_date;
    }

    const {
        data: ordersData,
        isLoading: ordersLoading,
        isFetching: ordersFetching,
    } = usePurchaseOrders(apiParams);

    const orders = ordersData?.data || [];

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: React.ReactNode;
        confirmText: string;
        cancelText?: string;
        variant: "danger" | "warning" | "info" | "success";
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        description: "",
        confirmText: "",
        variant: "warning",
        onConfirm: () => { },
    });

    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewPurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_purchase") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const hasManagePurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const handleFinalize = (order: PurchaseOrder) => {
        setConfirmDialog({
            open: true,
            title: "Finalisasi Purchase Order",
            description: `Apakah Anda yakin ingin memfinalisasi Purchase Order '${order.nomor_po}'? Status akan berubah menjadi ordered dan tidak dapat diedit secara langsung.`,
            confirmText: "Ya, Finalisasi",
            cancelText: "Batal",
            variant: "success",
            onConfirm: () => {
                finalizeOrder.mutate(order.uid, {
                    onSuccess: () => {
                        toast.success("Purchase Order berhasil difinalisasi.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memfinalisasi PO.");
                    },
                });
            },
        });
    };

    const handleCancel = (order: PurchaseOrder) => {
        setConfirmDialog({
            open: true,
            title: "Batalkan Purchase Order",
            description: `Apakah Anda yakin ingin membatalkan Purchase Order '${order.nomor_po}'? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: "Ya, Batalkan",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                cancelOrder.mutate(order.uid, {
                    onSuccess: () => {
                        toast.success("Purchase Order berhasil dibatalkan.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal membatalkan PO.");
                    },
                });
            },
        });
    };

    const handleDelete = (uid: string) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Purchase Order",
            description: "Apakah Anda yakin ingin menghapus draft Purchase Order ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteOrder.mutate(uid, {
                    onSuccess: () => {
                        toast.success("Draft Purchase Order berhasil dihapus.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menghapus draft PO.");
                    },
                });
            },
        });
    };

    const columns = poColumns;

    // Status options for CommandSelect
    const statusOptions = [
        { value: "all", label: "Semua Status" },
        ...Object.values(PO_STATUS).map((status) => ({
            value: status,
            label: PO_STATUS_LABELS[status],
        })),
    ];

    // Supplier options for CommandSelect
    const supplierOptions = useMemo(() => {
        return [
            { value: "all", label: "Semua Supplier" },
            ...suppliers.map((sup) => ({
                value: sup.uid,
                label: sup.nama,
            })),
        ];
    }, [suppliers]);

    if (!hasViewPurchase) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat atau mengelola pemesanan pembelian (Purchase Order)."
                requiredPermission="view_purchases"
            />
        );
    }

    return (
        <div className="space-y-6">
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Purchase Order (Pemesanan Barang)
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Daftar dokumen pemesanan pembelian ke distributor / supplier.
                        </p>
                    </div>
                    {hasManagePurchase && (
                        <Button
                            onClick={() => router.push("/admin/purchase/order/new")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                        >
                            <IconPlus size={16} /> Buat Purchase Order
                        </Button>
                    )}
                </div>

                <FilterForm
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<POFilterValues>
                        name="search"
                        label="Cari Dokumen PO"
                        placeholder="Cari nomor PO atau nama supplier..."
                    />

                    <FormSelect<POFilterValues>
                        name="supplier_uid"
                        label="Supplier"
                        options={supplierOptions}
                        placeholder="Semua Supplier"
                    />
                    <FormDatePicker<POFilterValues>
                        name="start_date"
                        label="Tanggal Awal"
                        placeholder="Dari Tanggal"
                    />
                    <FormDatePicker<POFilterValues>
                        name="end_date"
                        label="Tanggal Akhir"
                        placeholder="Sampai Tanggal"
                    />
                    <FormSelect<POFilterValues>
                        name="status"
                        label="Status"
                        options={statusOptions}
                        placeholder="Semua Status"
                    />
                </FilterForm>

                <DataTable
                    columns={columns}
                    data={orders}
                    isLoading={ordersLoading}
                    isFetching={ordersFetching}
                    emptyMessage="Belum ada Purchase Order yang tercatat."
                    page={orderPage}
                    onPageChange={setOrderPage}
                    meta={ordersData?.meta}
                    entityName="dokumen PO"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setOrderPage(1);
                    }}
                    virtualize={true}
                    estimateRowHeight={44}
                    onView={(order) => router.push(`/admin/purchase/order/${order.uid}`)}
                    onEdit={(order) => router.push(`/admin/purchase/order/${order.uid}/items`)}
                    hideEdit={(order) => !(order.status === PO_STATUS.DRAFT && hasManagePurchase)}
                    onCheck={handleFinalize}
                    hideCheck={(order) => !(order.status === PO_STATUS.DRAFT && hasManagePurchase)}
                    onDelete={(order) => handleDelete(order.uid)}
                    hideDelete={(order) => !(order.status === PO_STATUS.DRAFT && hasManagePurchase)}
                    extraActions={(order) => {
                        const canCancel = order.status !== PO_STATUS.RECEIVED &&
                            order.status !== PO_STATUS.CANCELLED &&
                            order.status !== PO_STATUS.CLOSED &&
                            hasManagePurchase;

                        if (!canCancel) return null;

                        return (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleCancel(order)}
                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                                    >
                                        <IconCircleX size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Batalkan PO</TooltipContent>
                            </Tooltip>
                        );
                    }}
                    renderCardItem={(row) => {
                        const order = row.original;
                        const status = order.status as POStatus;
                        const statusLabel = PO_STATUS_LABELS[status] || status;
                        const supplierName = order.supplier ? order.supplier.nama : order.supplier_name || "-";
                        const formattedDate = order.tanggal_po ? formatDate(order.tanggal_po, "dd MMM yyyy") : "-";

                        const canEdit = order.status === PO_STATUS.DRAFT && hasManagePurchase;
                        const canFinalize = order.status === PO_STATUS.DRAFT && hasManagePurchase;

                        return (
                            <div
                                key={order.uid || order.nomor_po}
                                onClick={() => router.push(`/admin/purchase/order/${order.uid}`)}
                                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2.5 shadow-2xs hover:border-emerald-500/50 transition-all cursor-pointer group"
                            >
                                {/* Header: Nomor PO + Status */}
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                                            PO
                                        </div>
                                        <div className="min-w-0 truncate">
                                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors font-mono">
                                                {order.nomor_po}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-medium truncate">
                                                {formattedDate}
                                            </div>
                                        </div>
                                    </div>

                                    <StatusBadge status={status} label={statusLabel} />
                                </div>

                                {/* Content Body: Supplier & Estimasi */}
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="space-y-0.5">
                                        <span className="text-[10px] text-slate-400 font-medium">Supplier:</span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {supplierName}
                                        </p>
                                    </div>
                                    <div className="space-y-0.5 text-right">
                                        <span className="text-[10px] text-slate-400 font-medium">Nilai Estimasi:</span>
                                        <p className="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                                            {formatRupiah(order.nilai_estimasi)}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer: Action Buttons */}
                                <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                                    <div className="flex items-center gap-1.5">
                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/admin/purchase/order/${order.uid}/items`);
                                                }}
                                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[10px] transition-all cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {canFinalize && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFinalize(order);
                                                }}
                                                className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white font-bold text-[10px] transition-all cursor-pointer"
                                            >
                                                Finalisasi
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/admin/purchase/order/${order.uid}`);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs shadow-emerald-600/20 shrink-0 ml-auto"
                                    >
                                        <span>Detail</span>
                                        <IconChevronRight size={14} className="stroke-[2.5]" />
                                    </button>
                                </div>
                            </div>
                        );
                    }}
                />

                {/* Confirm Dialog */}
                <ConfirmDialog
                    open={confirmDialog.open}
                    onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                    title={confirmDialog.title}
                    description={confirmDialog.description}
                    confirmText={confirmDialog.confirmText}
                    cancelText={confirmDialog.cancelText}
                    variant={confirmDialog.variant}
                    onConfirm={confirmDialog.onConfirm}
                    isLoading={deleteOrder.isPending || finalizeOrder.isPending || cancelOrder.isPending}
                />
            </section>
        </div>
    );
}
