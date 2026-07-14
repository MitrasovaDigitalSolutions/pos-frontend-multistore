"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { TransactionItem } from "../../types";
import { DataTable } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPackage, IconReceipt } from "@tabler/icons-react";

interface TransactionDetailItemsProps {
    items: TransactionItem[];
}

export function TransactionDetailItems({ items }: TransactionDetailItemsProps) {
    const columns: ColumnDef<TransactionItem>[] = [
        {
            accessorKey: "nama_produk",
            header: "Nama Produk",
            cell: ({ row }) => (
                <div className="flex items-center gap-2.5 py-0.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500 shadow-sm transition-transform duration-205 hover:scale-105">
                        <IconPackage size={14} className="stroke-[1.8]" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-xs tracking-tight leading-tight">
                                {row.original.nama_produk}
                            </span>
                            {row.original.product?.is_jasa && (
                                <span className="text-[8px] border-none bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-extrabold tracking-wide uppercase shrink-0">
                                    Jasa
                                </span>
                            )}
                        </div>
                        {row.original.barcode && (
                            <span className="text-[9px] font-mono font-medium text-slate-400 tracking-wider">
                                {row.original.barcode}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "harga_beli",
            header: "Harga Beli",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-semibold tabular-nums text-slate-500 text-xs",
            },
            cell: ({ row }) => {
                const hargaBeli = row.original.harga_beli ?? 0;
                return formatRupiah(hargaBeli);
            },
        },
        {
            accessorKey: "harga_satuan",
            header: "Harga Jual",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-semibold tabular-nums text-slate-600 text-xs",
            },
            cell: ({ row }) => formatRupiah(row.original.harga_satuan),
        },
        {
            accessorKey: "kuantitas",
            header: "Jumlah (Qty)",
            meta: {
                headerClassName: "text-center",
                cellClassName: "text-center shrink-0",
            },
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <span className="inline-flex items-center justify-center bg-slate-50 border border-slate-150 text-slate-800 font-extrabold text-[11px] px-2 py-0.5 rounded-lg tabular-nums shadow-sm">
                        {row.original.kuantitas} pcs
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "subtotal",
            header: "Subtotal",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-black text-slate-900 tabular-nums text-xs",
            },
            cell: ({ row }) => formatRupiah(row.original.subtotal),
        },
        {
            id: "keuntungan",
            header: "Keuntungan",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-bold tabular-nums text-xs",
            },
            cell: ({ row }) => {
                const hargaBeli = row.original.harga_beli ?? 0;
                const hargaJual = row.original.harga_satuan;
                const qty = row.original.kuantitas;
                const profit = (hargaJual - hargaBeli) * qty;

                return (
                    <span className={profit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {formatRupiah(profit)}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col p-4.5 space-y-4 transition-all duration-300 hover:shadow-md">
            {/* Header section with decorative card header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50/70 text-indigo-650 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                        <IconReceipt size={16} className="stroke-[2.2]" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-none">Daftar Item</h3>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-none">
                            Daftar suku cadang, barang, atau jasa layanan yang tercatat.
                        </p>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5">
                    {items.length} Item
                </div>
            </div>

            {/* DataTable */}
            <div className="overflow-hidden rounded-xl border border-slate-100">
                <DataTable
                    columns={columns}
                    data={items}
                    emptyMessage="Tidak ada item dalam transaksi ini."
                    virtualize={false}
                />
            </div>
        </div>
    );
}
