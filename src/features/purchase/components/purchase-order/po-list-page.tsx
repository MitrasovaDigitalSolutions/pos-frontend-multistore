"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { IconPlus, IconCircleX } from "@tabler/icons-react";
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
} from "@/constants/purchase";
import { poColumns } from "./po-columns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";

interface POFilterValues {
    search: string;
    status: string;
    supplier_id: string;
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

    // Filters state
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        supplier_id: "all",
        start_date: "",
        end_date: "",
    });

    const deferredFilters = useDeferredValue(filters);

    const filterMethods = useForm<POFilterValues>({
        defaultValues: {
            search: "",
            status: "all",
            supplier_id: "all",
            start_date: "",
            end_date: "",
        },
    });

    const handleFilterSubmit = (data: POFilterValues) => {
        setFilters({
            search: data.search,
            status: data.status,
            supplier_id: data.supplier_id,
            start_date: data.start_date,
            end_date: data.end_date,
        });
        setOrderPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            status: "all",
            supplier_id: "all",
            start_date: "",
            end_date: "",
        });
        setFilters({
            search: "",
            status: "all",
            supplier_id: "all",
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
        supplier_id?: number;
        start_date?: string;
        end_date?: string;
    } = {
        page: orderPage,
        per_page: 10,
    };
    if (deferredFilters.search) {
        apiParams.search = deferredFilters.search;
    }
    if (deferredFilters.status && deferredFilters.status !== "all") {
        apiParams.status = deferredFilters.status;
    }
    if (deferredFilters.supplier_id && deferredFilters.supplier_id !== "all") {
        apiParams.supplier_id = Number(deferredFilters.supplier_id);
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
                finalizeOrder.mutate(order.id, {
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
                cancelOrder.mutate(order.id, {
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

    const handleDelete = (id: number) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Purchase Order",
            description: "Apakah Anda yakin ingin menghapus draft Purchase Order ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteOrder.mutate(id, {
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
                value: String(sup.id),
                label: sup.nama,
            })),
        ];
    }, [suppliers]);

    if (!hasViewPurchase) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk mengakses menu Pemesanan.</p>
            </div>
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
                        name="supplier_id"
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
                    virtualize={true}
                    estimateRowHeight={44}
                    onView={(order) => router.push(`/admin/purchase/order/${order.id}`)}
                    onEdit={(order) => router.push(`/admin/purchase/order/${order.id}/items`)}
                    hideEdit={(order) => !(order.status === PO_STATUS.DRAFT && hasManagePurchase)}
                    onCheck={handleFinalize}
                    hideCheck={(order) => !(order.status === PO_STATUS.DRAFT && hasManagePurchase)}
                    onDelete={(order) => handleDelete(order.id)}
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
