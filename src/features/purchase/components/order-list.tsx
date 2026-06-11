"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import type { Product } from "@/features/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconCircleX, IconPlus } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    useCancelPurchaseOrder,
    useDeletePurchaseOrder,
    useFinalizePurchaseOrder,
} from "../api/purchase-api";
import type { PurchaseOrder } from "../types";
import { OrderDetailDialog } from "./order-detail-dialog";
import { OrderDialog } from "./order-dialog";

interface OrderListProps {
    orders: PurchaseOrder[];
    products: Product[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    page: number;
    onPageChange: (page: number) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filters: {
        search: string;
        status: string;
        supplier_id: string;
        start_date: string;
        end_date: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<{
        search: string;
        status: string;
        supplier_id: string;
        start_date: string;
        end_date: string;
    }>>;
}

export function OrderList({
    orders,
    products,
    meta,
    page,
    onPageChange,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filters,
    setFilters,
}: OrderListProps) {
    const { data: session } = useSession();
    const deleteOrder = useDeletePurchaseOrder();
    const finalizeOrder = useFinalizePurchaseOrder();
    const cancelOrder = useCancelPurchaseOrder();
    // const { data: suppliers = [] } = useAllSuppliers();

    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

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
    const hasManagePurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const handleFinalize = (order: PurchaseOrder) => {
        setConfirmDialog({
            open: true,
            title: "Finalisasi Purchase Order",
            description: `Apakah Anda yakin ingin memfinalisasi Purchase Order '${order.nomor_po}'? Status akan berubah menjadi ordered dan tidak dapat diedit lagi.`,
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

    const handleEditClick = (order: PurchaseOrder) => {
        setSelectedOrder(order);
        setIsEditOpen(true);
    };

    const handleDetailClick = (order: PurchaseOrder) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
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
                    } else if (status === "received") {
                        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                        label = "Received";
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
        ],
        []
    );

    // Custom filters bar to pass to DataTable
    // const filtersBar = (
    //     <div className="flex flex-wrap gap-2 items-center">
    //         {/* Status Select */}
    //         <Select
    //             value={filters.status}
    //             onValueChange={(val) => setFilters((prev) => ({ ...prev, status: val || "all" }))}
    //         >
    //             <SelectTrigger className="h-9 w-32 border-slate-200 focus-visible:ring-emerald-600 rounded-xl bg-white text-xs text-slate-700">
    //                 <SelectValue placeholder="Semua Status" />
    //             </SelectTrigger>
    //             <SelectContent>
    //                 <SelectItem value="all">Semua Status</SelectItem>
    //                 <SelectItem value="draft">Draft</SelectItem>
    //                 <SelectItem value="ordered">Ordered</SelectItem>
    //                 <SelectItem value="received">Received</SelectItem>
    //                 <SelectItem value="cancelled">Cancelled</SelectItem>
    //             </SelectContent>
    //         </Select>

    //         {/* Supplier Select */}
    //         <Select
    //             value={filters.supplier_id}
    //             onValueChange={(val) => setFilters((prev) => ({ ...prev, supplier_id: val || "all" }))}
    //         >
    //             <SelectTrigger className="h-9 w-40 border-slate-200 focus-visible:ring-emerald-600 rounded-xl bg-white text-xs text-slate-700">
    //                 <SelectValue placeholder="Semua Supplier" />
    //             </SelectTrigger>
    //             <SelectContent>
    //                 <SelectItem value="all">Semua Supplier</SelectItem>
    //                 {suppliers.map((sup) => (
    //                     <SelectItem key={sup.id} value={String(sup.id)}>
    //                         {sup.nama}
    //                     </SelectItem>
    //                 ))}
    //             </SelectContent>
    //         </Select>

    //         {/* Date Range Inputs */}
    //         <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2 py-0.5">
    //             <span className="text-[10px] font-bold text-slate-400">Dari:</span>
    //             <Input
    //                 type="date"
    //                 value={filters.start_date}
    //                 onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
    //                 className="h-7 w-28 text-[10px] border-none bg-transparent focus-visible:ring-0 p-0"
    //             />
    //             <span className="text-[10px] font-bold text-slate-400">S/D:</span>
    //             <Input
    //                 type="date"
    //                 value={filters.end_date}
    //                 onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
    //                 className="h-7 w-28 text-[10px] border-none bg-transparent focus-visible:ring-0 p-0"
    //             />
    //         </div>
    //     </div>
    // );

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
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Buat Purchase Order
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={orders}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Belum ada Purchase Order yang tercatat."
                page={page}
                onPageChange={onPageChange}
                meta={meta}
                entityName="dokumen PO"
                virtualize={true}
                estimateRowHeight={44}
                onView={handleDetailClick}
                onEdit={handleEditClick}
                hideEdit={(o) => !(o.status === "draft" && hasManagePurchase)}
                onCheck={handleFinalize}
                hideCheck={(o) => !(o.status === "draft" && hasManagePurchase)}
                onDelete={(o) => handleDelete(o.id)}
                hideDelete={(o) => !(o.status === "draft" && hasManagePurchase)}
                search={filters.search}
                onSearchChange={(searchVal) => setFilters((prev) => ({ ...prev, search: searchVal }))}
                searchPlaceholder="Cari nomor PO atau nama supplier..."
                // filters={filtersBar}
                extraActions={(order) => {
                    const canCancel = order.status !== "received" && order.status !== "cancelled" && hasManagePurchase;
                    if (!canCancel) return null;
                    return (
                        <button
                            onClick={() => handleCancel(order)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                            title="Batalkan PO"
                        >
                            <IconCircleX size={16} />
                        </button>
                    );
                }}
            />

            {/* Edit Draft Dialog */}
            <OrderDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                products={products}
                editingOrder={selectedOrder}
            />

            {/* Details & Logs Dialog */}
            <OrderDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                orderId={selectedOrder?.id || null}
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
