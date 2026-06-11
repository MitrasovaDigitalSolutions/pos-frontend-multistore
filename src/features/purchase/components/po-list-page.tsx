"use client";

import { Button } from "@/components/ui/button";
import { CommandSelect } from "@/components/ui/command-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { hasPermission, hasRole } from "@/constants/roles";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconCheck, IconCircleX, IconEdit, IconEye, IconPlus, IconTrash } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    useCancelPurchaseOrder,
    useDeletePurchaseOrder,
    useFinalizePurchaseOrder,
    usePurchaseOrders,
} from "../api/purchase-api";
import type { PurchaseOrder } from "../types";

export function POListPage() {
    const { data: session } = useSession();
    const router = useRouter();
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

    const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
        () => [
            {
                accessorKey: "tanggal_po",
                header: "Tanggal PO",
                cell: ({ row }) => (
                    <span className="text-slate-600 font-medium text-xs">
                        {new Date(row.original.tanggal_po).toLocaleString("id-ID", {
                            dateStyle: "medium",
                        })}
                    </span>
                ),
            },
            {
                accessorKey: "nomor_po",
                header: "No. PO",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900 text-xs">
                        {row.original.nomor_po}
                    </span>
                ),
            },
            {
                accessorKey: "supplier",
                header: "Supplier",
                cell: ({ row }) => {
                    const supplierObj = row.original.supplier;
                    return (
                        <span className="font-semibold text-slate-800 text-xs">
                            {supplierObj ? supplierObj.nama : row.original.supplier_name || "-"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "nilai_estimasi",
                header: "Nilai Estimasi",
                cell: ({ row }) => (
                    <span className="text-slate-700 text-xs font-bold font-mono">
                        {formatRupiah(row.original.nilai_estimasi)}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    let colorClass = "bg-amber-50 text-amber-700 border-amber-100";
                    let label = "Draft";
                    if (status === "ordered") {
                        colorClass = "bg-blue-50 text-blue-700 border-blue-100";
                        label = "Ordered";
                    } else if (status === "partially_received") {
                        colorClass = "bg-indigo-50 text-indigo-700 border-indigo-100";
                        label = "Partially Received";
                    } else if (status === "received") {
                        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                        label = "Received";
                    } else if (status === "closed") {
                        colorClass = "bg-purple-50 text-purple-700 border-purple-100";
                        label = "Closed";
                    } else if (status === "cancelled") {
                        colorClass = "bg-rose-50 text-rose-700 border-rose-100";
                        label = "Cancelled";
                    }
                    return (
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}
                        >
                            {label}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const order = row.original;
                    const isDraft = order.status === "draft";
                    const canCancel = order.status !== "received" && order.status !== "cancelled" && order.status !== "closed" && hasManagePurchase;

                    return (
                        <div className="flex items-center gap-1.5">
                            {/* View Button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => router.push(`/admin/purchase/order/${order.id}`)}
                                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                    >
                                        <IconEye size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Lihat Detail</TooltipContent>
                            </Tooltip>

                            {/* Edit Button (Only for draft) */}
                            {isDraft && hasManagePurchase && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => router.push(`/admin/purchase/order/${order.id}/items`)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                        >
                                            <IconEdit size={16} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Draft Items</TooltipContent>
                                </Tooltip>
                            )}

                            {/* Finalize Button (Only for draft) */}
                            {isDraft && hasManagePurchase && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => handleFinalize(order)}
                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                        >
                                            <IconCheck size={16} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Finalisasi PO</TooltipContent>
                                </Tooltip>
                            )}

                            {/* Cancel Button */}
                            {canCancel && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => handleCancel(order)}
                                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                        >
                                            <IconCircleX size={16} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Batalkan PO</TooltipContent>
                                </Tooltip>
                            )}

                            {/* Delete Button (Only for draft) */}
                            {isDraft && hasManagePurchase && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                        >
                                            <IconTrash size={16} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Hapus Draft</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    );
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hasManagePurchase, router]
    );

    // Status options for CommandSelect
    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "draft", label: "Draft" },
        { value: "ordered", label: "Ordered" },
        { value: "partially_received", label: "Partially Received" },
        { value: "received", label: "Received" },
        { value: "closed", label: "Closed" },
        { value: "cancelled", label: "Cancelled" },
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

    const filtersBar = (
        <div className="grid grid-cols-4 gap-2.5 w-full ">
            {/* Status Select */}
            <CommandSelect
                options={statusOptions}
                value={filters.status}
                onChange={(val) => setFilters((prev) => ({ ...prev, status: val || "all" }))}
                placeholder="Semua Status"
                className="w-full h-9 text-xs"
            />

            {/* Supplier Select */}
            <CommandSelect
                options={supplierOptions}
                value={filters.supplier_id}
                onChange={(val) => setFilters((prev) => ({ ...prev, supplier_id: val || "all" }))}
                placeholder="Semua Supplier"
                className="w-full h-9 text-xs"
            />

            {/* Date Range Inputs */}
            <div className="col-span-2 flex items-center gap-2">
                <DatePicker
                    value={filters.start_date}
                    onChange={(date) => setFilters((prev) => ({ ...prev, start_date: date }))}
                    placeholder="Dari Tanggal"
                    className="w-full"
                />
                <span className="text-xs text-slate-400 font-medium">s/d</span>
                <DatePicker
                    value={filters.end_date}
                    onChange={(date) => setFilters((prev) => ({ ...prev, end_date: date }))}
                    placeholder="Sampai Tanggal"
                    className="w-full"
                />
            </div>
        </div>
    );

    if (!hasViewPurchase) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk mengakses menu Pemesanan.</p>
            </div>
        );
    }

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
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
                search={filters.search}
                onSearchChange={(searchVal) => setFilters((prev) => ({ ...prev, search: searchVal }))}
                searchPlaceholder="Cari nomor PO atau nama supplier..."
                filters={filtersBar}
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
    );
}
