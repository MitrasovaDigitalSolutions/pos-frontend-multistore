"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import type { Product } from "@/features/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPlus } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeletePurchaseReturn } from "../api/purchase-api";
import type { PurchaseReturn } from "../types";
import { ReturnDetailDialog } from "./return-detail-dialog";
import { ReturnFinalizeDialog } from "./return-finalize-dialog";
import { useAppRouter } from "@/hooks/use-app-router";

interface ReturnListProps {
    returns: PurchaseReturn[];
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

export function ReturnList({
    returns,
    products: _products,
    meta,
    page,
    onPageChange,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filters,
    setFilters,
}: ReturnListProps) {
    const { data: session } = useSession();
    const router = useAppRouter();
    const deleteReturn = useDeletePurchaseReturn();
    const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);

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

    const handleDelete = (id: number) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Retur Pembelian",
            description: "Apakah Anda yakin ingin menghapus draft retur pembelian ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteReturn.mutate(id, {
                    onSuccess: () => {
                        toast.success("Draft retur pembelian berhasil dihapus.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menghapus draft retur.");
                    },
                });
            },
        });
    };

    const handleEditClick = (ret: PurchaseReturn) => {
        router.push(`/admin/purchase/return/${ret.id}/items`);
    };

    const handleDetailClick = (ret: PurchaseReturn) => {
        setSelectedReturn(ret);
        setIsDetailOpen(true);
    };

    const handleFinalizeClick = (ret: PurchaseReturn) => {
        setSelectedReturn(ret);
        setIsFinalizeOpen(true);
    };

    const columns = useMemo<ColumnDef<PurchaseReturn>[]>(
        () => [
            {
                accessorKey: "tanggal_retur",
                header: "Tanggal Retur",
                cell: ({ row }) => (
                    <span className="text-slate-600 font-medium text-xs">
                        {new Date(row.original.tanggal_retur).toLocaleString("id-ID", {
                            dateStyle: "medium",
                        })}
                    </span>
                ),
                size: 120,
            },
            {
                accessorKey: "nomor_retur",
                header: "No. Retur",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900 text-xs">
                        {row.original.nomor_retur}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "supplier",
                header: "Supplier",
                cell: ({ row }) => {
                    const supplierObj = row.original.supplier;
                    return (
                        <span className="font-semibold text-slate-800 text-xs">
                            {supplierObj ? supplierObj.nama : "-"}
                        </span>
                    );
                },
                size: 240,
            },
            {
                accessorKey: "total_nominal",
                header: "Total Nominal",
                cell: ({ row }) => (
                    <span className="text-slate-700 text-xs font-bold font-mono">
                        {formatRupiah(row.original.total_nominal)}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    let colorClass = "bg-amber-50 text-amber-700 border-amber-100";
                    let label = "Draft";
                    if (status === "completed") {
                        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                        label = "Selesai (Completed)";
                    }
                    return (
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}
                        >
                            {label}
                        </span>
                    );
                },
                size: 160,
            },
        ],
        []
    );

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
    //                 <SelectItem value="completed">Completed</SelectItem>
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
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Retur Pembelian (Purchase Return)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar dokumen pengembalian barang rusak atau tidak sesuai ke supplier.
                    </p>
                </div>
                {hasManagePurchase && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Buat Retur Pembelian
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={returns}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Belum ada Retur Pembelian yang tercatat."
                page={page}
                onPageChange={onPageChange}
                meta={meta}
                entityName="dokumen retur"
                virtualize={true}
                estimateRowHeight={44}
                onView={handleDetailClick}
                onEdit={handleEditClick}
                hideEdit={(r) => !(r.status === "draft" && hasManagePurchase)}
                onCheck={handleFinalizeClick}
                hideCheck={(r) => !(r.status === "draft" && hasManagePurchase)}
                onDelete={(r) => handleDelete(r.id)}
                hideDelete={(r) => !(r.status === "draft" && hasManagePurchase)}
                search={filters.search}
                onSearchChange={(searchVal) => setFilters((prev) => ({ ...prev, search: searchVal }))}
                searchPlaceholder="Cari nomor retur atau nama supplier..."
            // filters={filtersBar}
            />



            {/* Details & Logs Dialog */}
            <ReturnDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                returnId={selectedReturn?.id || null}
            />

            {/* Finalize Dialog */}
            <ReturnFinalizeDialog
                open={isFinalizeOpen}
                onOpenChange={setIsFinalizeOpen}
                returnObj={selectedReturn}
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
                isLoading={deleteReturn.isPending}
            />
        </section>
    );
}
