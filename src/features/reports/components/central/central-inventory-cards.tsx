"use client";

import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBox, IconBuildingStore } from "@tabler/icons-react";
import type { CentralInventoryData } from "../../types/central-reports-types";

interface CentralInventoryCardsProps {
    data?: CentralInventoryData;
    isLoading: boolean;
}

export function CentralInventoryCards({ data, isLoading }: CentralInventoryCardsProps) {
    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-28 bg-slate-100/60 rounded-xl" />
                ))}
            </div>
        );
    }

    const { stores, totals } = data;

    return (
        <div className="space-y-3.5">
            {/* Totals Summary Banner */}
            <Card className="bg-gradient-to-r from-emerald-50/70 via-white to-white border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <IconBox size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                            Total Valuasi Stok Konsolidasi ({totals.stores_count} Cabang)
                        </span>
                        <p className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
                            {formatRupiah(totals.stock_value)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-5 text-xs text-slate-700 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-2.5 sm:pt-0 sm:pl-5">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Qty Fisik</span>
                        <p className="font-mono font-bold text-sm text-slate-800">
                            {totals.total_qty.toLocaleString("id-ID")} pcs
                        </p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Variasi SKU Produk</span>
                        <p className="font-mono font-bold text-sm text-slate-800">
                            {totals.sku_count.toLocaleString("id-ID")} SKU
                        </p>
                    </div>
                </div>
            </Card>

            {/* Store Inventory Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stores.map((store) => (
                    <Card
                        key={store.store_uid}
                        className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-2xs space-y-3 hover:border-slate-300 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <IconBuildingStore size={14} />
                                </div>
                                <span className="truncate">{store.store_name}</span>
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Valuasi Stok (HPP)
                            </span>
                            <p className="text-lg font-extrabold text-emerald-700 font-mono">
                                {formatRupiah(store.stock_value)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-0.5 text-xs">
                            <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Qty Fisik</span>
                                <span className="font-mono font-bold text-slate-800 text-xs">
                                    {store.total_qty.toLocaleString("id-ID")} pcs
                                </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Variasi SKU</span>
                                <span className="font-mono font-bold text-slate-800 text-xs">
                                    {store.sku_count} SKU
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
