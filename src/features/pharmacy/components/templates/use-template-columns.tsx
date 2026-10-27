"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PrescriptionTemplate } from "../../types";

export function useTemplateColumns() {
    return useMemo<ColumnDef<PrescriptionTemplate>[]>(
        () => [
            {
                accessorKey: "nama_racikan",
                header: "Nama Racikan & Signa",
                size: 280,
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="space-y-0.5 py-0.5 min-w-[220px]">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                                {item.nama_racikan}
                            </span>
                            {item.aturan_pakai ? (
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[240px] sm:max-w-xs cursor-help hover:text-slate-700 dark:hover:text-slate-300">
                                                Signa: {item.aturan_pakai}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" align="start" className="max-w-xs text-xs">
                                            <p className="font-bold text-slate-300 text-[10px] uppercase tracking-wider mb-0.5">
                                                Aturan Pakai (Signa):
                                            </p>
                                            <p className="font-medium text-white">{item.aturan_pakai}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : null}
                        </div>
                    );
                },
            },
            {
                accessorKey: "jenis_racikan",
                header: "Bentuk Sediaan",
                size: 130,
                cell: ({ row }) => (
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-mono">
                        {row.original.jenis_racikan || "puyer"}
                    </span>
                ),
            },
            {
                id: "ingredients_count",
                header: "Komposisi Bahan",
                size: 200,
                cell: ({ row }) => {
                    const ings = row.original.ingredients || [];
                    const preview = ings
                        .map((i) => i.nama_produk || i.product?.nama)
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(", ");
                    return (
                        <div className="text-xs py-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                {ings.length} Bahan
                            </span>
                            {preview ? (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate max-w-[200px] sm:max-w-xs">
                                    ({preview}{ings.length > 2 ? ", ..." : ""})
                                </span>
                            ) : null}
                        </div>
                    );
                },
            },
            {
                accessorKey: "tuslah_fee",
                header: "Tuslah",
                size: 110,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300",
                },
                cell: ({ row }) => formatRupiah(row.original.tuslah_fee || 0),
            },
            {
                accessorKey: "embalase_fee",
                header: "Embalase",
                size: 110,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300",
                },
                cell: ({ row }) => formatRupiah(row.original.embalase_fee || 0),
            },
        ],
        []
    );
}
