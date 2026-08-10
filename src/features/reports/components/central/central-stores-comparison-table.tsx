"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { ColumnDef } from "@tanstack/react-table";
import type {
    CentralStoreComparisonRow,
    CentralStoresComparisonTotals,
} from "../../types/central-reports-types";

interface CentralStoresComparisonTableProps {
    stores: CentralStoreComparisonRow[];
    totals?: CentralStoresComparisonTotals;
    isLoading: boolean;
}

export function CentralStoresComparisonTable({
    stores,
    totals,
    isLoading,
}: CentralStoresComparisonTableProps) {
    const columns = useMemo<ColumnDef<CentralStoreComparisonRow>[]>(
        () => [
            {
                accessorKey: "store_name",
                header: "Nama Cabang / Toko",
                cell: ({ row }) => {
                    const store = row.original;
                    return (
                        <div>
                            <div className="flex items-center gap-1.5">
                                {/* {store.is_central && (
                                    <span className="text-[9px] bg-slate-900 text-white font-mono px-1.5 py-0.5 rounded font-extrabold">
                                        HQ
                                    </span>
                                )} */}
                                <span className="font-bold text-slate-900">{store.store_name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                {store.sku_count} SKU | {store.total_stock_qty.toLocaleString("id-ID")} pcs stok
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "sales_count",
                header: () => <div className="text-right">Qty Trx</div>,
                cell: ({ row }) => (
                    <div className="text-right font-mono text-slate-700">
                        {row.original.sales_count.toLocaleString("id-ID")} trx
                    </div>
                ),
            },
            {
                accessorKey: "net_sales",
                header: () => <div className="text-right">Omset Bersih</div>,
                cell: ({ row }) => (
                    <div className="text-right font-mono font-bold text-slate-900">
                        {formatRupiah(row.original.net_sales)}
                    </div>
                ),
            },
            {
                accessorKey: "average_transaction_value",
                header: () => <div className="text-right">Rata² Trx (ATV)</div>,
                cell: ({ row }) => (
                    <div className="text-right font-mono text-slate-600">
                        {formatRupiah(row.original.average_transaction_value)}
                    </div>
                ),
            },
            {
                accessorKey: "gross_profit",
                header: () => <div className="text-right">Laba Kotor</div>,
                cell: ({ row }) => (
                    <div className="text-right font-mono text-blue-700 font-semibold">
                        {formatRupiah(row.original.gross_profit)}
                    </div>
                ),
            },
            {
                accessorKey: "total_expenses",
                header: () => <div className="text-right">Pengeluaran</div>,
                cell: ({ row }) => (
                    <div className="text-right font-mono text-amber-700">
                        {formatRupiah(row.original.total_expenses)}
                    </div>
                ),
            },
            {
                accessorKey: "net_profit",
                header: () => <div className="text-right">Laba Bersih</div>,
                cell: ({ row }) => (
                    <div className="text-right font-mono font-extrabold text-emerald-700">
                        {formatRupiah(row.original.net_profit)}
                    </div>
                ),
            },
            {
                accessorKey: "profit_margin",
                header: () => <div className="text-right">Margin %</div>,
                cell: ({ row }) => (
                    <div className="text-right">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {row.original.profit_margin}%
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "stock_value",
                header: () => <div className="text-right">Valuasi Stok</div>,
                cell: ({ row }) => (
                    <div className="text-right font-mono font-bold text-indigo-700">
                        {formatRupiah(row.original.stock_value)}
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="space-y-3">
            <DataTable<CentralStoreComparisonRow, unknown>
                columns={columns}
                data={stores}
                isLoading={isLoading}
            // searchKey="store_name"
            // searchPlaceholder="Cari nama cabang..."
            />

            {/* Total Consolidation Summary Banner */}
            {totals && stores.length > 0 && (
                <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="font-extrabold uppercase tracking-wider text-[11px] text-slate-300">
                        Total Konsolidasi ({stores.length} Cabang)
                    </div>
                    <div className="flex flex-wrap items-center gap-6 font-mono">
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-sans">Total Transaksi</span>
                            <span className="font-bold">{totals.sales_count.toLocaleString("id-ID")} trx</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-sans">Omset Bersih</span>
                            <span className="font-bold text-emerald-400">{formatRupiah(totals.net_sales)}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-sans">Laba Kotor</span>
                            <span className="font-bold text-blue-400">{formatRupiah(totals.gross_profit)}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-sans">Pengeluaran</span>
                            <span className="font-bold text-amber-400">{formatRupiah(totals.total_expenses)}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-sans">Laba Bersih</span>
                            <span className="font-extrabold text-emerald-300 text-sm">{formatRupiah(totals.net_profit)}</span>
                        </div>
                        <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-sans">Valuasi Stok</span>
                            <span className="font-bold text-indigo-300">{formatRupiah(totals.stock_value)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
