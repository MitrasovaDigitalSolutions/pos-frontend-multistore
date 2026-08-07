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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-32 bg-slate-100/60 rounded-2xl" />
                ))}
            </div>
        );
    }

    const { stores, totals } = data;

    return (
        <div className="space-y-4">
            {/* Totals Summary Banner */}
            <Card className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-slate-800">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <IconBox size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Total Valuasi Stok Konsolidasi ({totals.stores_count} Cabang)
                        </span>
                        <p className="text-2xl font-extrabold font-mono text-emerald-400 tracking-tight">
                            {formatRupiah(totals.stock_value)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-300 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Qty Fisik</span>
                        <p className="font-mono font-bold text-sm text-white">
                            {totals.total_qty.toLocaleString("id-ID")} pcs
                        </p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Variasi SKU Produk</span>
                        <p className="font-mono font-bold text-sm text-white">
                            {totals.sku_count.toLocaleString("id-ID")} SKU
                        </p>
                    </div>
                </div>
            </Card>

            {/* Store Inventory Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                    <Card
                        key={store.store_uid}
                        className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3"
                    >
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                                <IconBuildingStore size={16} className="text-slate-600" />
                                <span>{store.store_name}</span>
                            </div>
                            {store.is_central && (
                                <span className="text-[9px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded font-bold">
                                    HQ
                                </span>
                            )}
                        </div>

                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Valuasi Stok (HPP)
                            </span>
                            <p className="text-lg font-extrabold text-slate-900 font-mono">
                                {formatRupiah(store.stock_value)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Qty Fisik</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {store.total_qty.toLocaleString("id-ID")} pcs
                                </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Variasi SKU</span>
                                <span className="font-mono font-bold text-slate-800">
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
