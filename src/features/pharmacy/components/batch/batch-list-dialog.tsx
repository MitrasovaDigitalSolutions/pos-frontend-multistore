"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { DataTable } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useProductBatches } from "../../api/pharmacy-api";
import type { ProductBatch } from "../../types";
import { BatchBadge } from "./batch-badge";
import { db } from "@/lib/db";

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
    const { data: batchesData, isLoading } = useProductBatches(productUid);
    const [localBatches, setLocalBatches] = useState<ProductBatch[]>([]);

    useEffect(() => {
        let isCurrent = true;
        if (open && productUid) {
            db.products
                .get(productUid)
                .then((prod) => {
                    if (isCurrent && prod?.batches && prod.batches.length > 0) {
                        const mapped: ProductBatch[] = prod.batches.map((b) => ({
                            uid: b.batch_uid || b.id_batch || b.uid || b.batch_number,
                            id_batch: b.id_batch,
                            batch_uid: b.batch_uid,
                            product_uid: productUid,
                            batch_number: b.batch_number,
                            expired_date: b.expired_date || b.tanggal_kedaluarsa || "",
                            tanggal_kedaluarsa: b.tanggal_kedaluarsa,
                            tanggal_terima: b.tanggal_terima,
                            initial_stock: b.qty_batch ?? b.current_stock ?? 0,
                            qty_batch: b.qty_batch,
                            current_stock: b.current_stock ?? b.qty_batch ?? 0,
                            status: "active",
                        }));
                        setLocalBatches(mapped);
                    }
                })
                .catch(() => {});
        }
        return () => {
            isCurrent = false;
        };
    }, [open, productUid]);

    const batches = useMemo(() => {
        if (Array.isArray(batchesData?.data) && batchesData.data.length > 0) {
            return batchesData.data;
        }
        return localBatches;
    }, [batchesData?.data, localBatches]);

    const columns = useMemo<ColumnDef<ProductBatch, unknown>[]>(
        () => [
            {
                accessorKey: "batch_number",
                header: "No. Batch",
                cell: ({ row }) => (
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        #{row.original.batch_number}
                    </span>
                ),
            },
            {
                accessorKey: "expired_date",
                header: "Exp. Date",
                cell: ({ row }) => {
                    const exp = row.original.expired_date || row.original.tanggal_kedaluarsa;
                    const formattedDate = exp ? formatDate(exp, "dd MMM yyyy") : null;
                    return (
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {formattedDate || "—"}
                        </span>
                    );
                },
            },
            {
                id: "initial_stock",
                header: "Stok Masuk",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono text-slate-500",
                },
                cell: ({ row }) => row.original.initial_stock ?? row.original.qty_batch ?? "—",
            },
            {
                id: "current_stock",
                header: "Sisa Stok",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-bold tabular-nums text-slate-900 dark:text-slate-100",
                },
                cell: ({ row }) => {
                    const currentStock =
                        row.original.current_stock ??
                        row.original.qty_batch ??
                        row.original.stock ??
                        0;
                    return (
                        <span className={currentStock <= 0 ? "text-rose-500 font-bold" : "font-extrabold text-slate-800 dark:text-slate-200"}>
                            {currentStock}
                        </span>
                    );
                },
            },
            {
                accessorKey: "buy_price",
                header: "Harga Beli",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono text-xs text-slate-600 dark:text-slate-300",
                },
                cell: ({ row }) =>
                    row.original.buy_price ? formatRupiah(row.original.buy_price) : "—",
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
                        expiredDate={row.original.expired_date || row.original.tanggal_kedaluarsa}
                        stock={
                            row.original.current_stock ??
                            row.original.qty_batch ??
                            row.original.stock ??
                            0
                        }
                    />
                ),
            },
        ],
        []
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Daftar Batch & Pemantauan FEFO
                    </span>
                    {productName && (
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            Produk: <span className="font-bold text-slate-700 dark:text-slate-300">{productName}</span>
                        </p>
                    )}
                </div>
            }
            className="sm:max-w-2xl"
            scrollable={true}
        >
            <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <DataTable<ProductBatch, unknown>
                        columns={columns}
                        data={batches}
                        isLoading={isLoading && batches.length === 0}
                        emptyMessage="Belum ada nomor batch tercatat untuk produk ini. Lakukan penerimaan barang untuk menambahkan stok batch."
                        virtualize={false}
                        showViewToggle={false}
                    />
                </div>
            </div>
        </BaseDialog>
    );
}
