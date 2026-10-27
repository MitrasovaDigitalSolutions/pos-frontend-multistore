"use client";

import { useMemo, useState } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { IconPlus } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useProductBatches } from "../../api/pharmacy-api";
import type { ProductBatch } from "../../types";
import { BatchBadge } from "./batch-badge";
import { BatchFormDialog } from "./batch-form-dialog";

interface BatchListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productUid: string;
    productName?: string;
}

export function BatchListDialog({
    open,
    onOpenChange,
    productUid,
    productName,
}: BatchListDialogProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { data: batchesData, isLoading, refetch } = useProductBatches(productUid);
    const batches = Array.isArray(batchesData?.data) ? batchesData.data : [];

    const columns = useMemo<ColumnDef<ProductBatch, unknown>[]>(
        () => [
            {
                accessorKey: "batch_number",
                header: "No. Batch",
                cell: ({ row }) => (
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {row.original.batch_number}
                    </span>
                ),
            },
            {
                accessorKey: "expired_date",
                header: "Expired Date",
                cell: ({ row }) => (
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                        {row.original.expired_date}
                    </span>
                ),
            },
            {
                accessorKey: "stock",
                header: "Sisa Stok",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-bold tabular-nums text-slate-900 dark:text-slate-100",
                },
                cell: ({ row }) => row.original.stock,
            },
            {
                id: "status",
                header: "Status FEFO",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => (
                    <BatchBadge
                        expiredDate={row.original.expired_date}
                        stock={row.original.stock}
                    />
                ),
            },
        ],
        []
    );

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <div>
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Manajemen Batch & FEFO
                        </span>
                        {productName && (
                            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                Produk: <span className="font-bold text-slate-700 dark:text-slate-300">{productName}</span>
                            </p>
                        )}
                    </div>
                }
                headerRight={
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setIsAddOpen(true)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={14} />
                        <span>Tambah Batch</span>
                    </Button>
                }
                className="sm:max-w-xl"
                scrollable={true}
            >
                <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <DataTable<ProductBatch, unknown>
                        columns={columns}
                        data={batches}
                        isLoading={isLoading}
                        emptyMessage="Belum Ada Nomor Batch. Tambahkan nomor batch dan expired date agar pemotongan stok FEFO berjalan otomatis."
                        virtualize={false}
                        showViewToggle={false}
                    />
                </div>
            </BaseDialog>

            {isAddOpen && (
                <BatchFormDialog
                    open={isAddOpen}
                    onOpenChange={(open) => {
                        setIsAddOpen(open);
                        if (!open) refetch();
                    }}
                    productUid={productUid}
                    productName={productName}
                />
            )}
        </>
    );
}
