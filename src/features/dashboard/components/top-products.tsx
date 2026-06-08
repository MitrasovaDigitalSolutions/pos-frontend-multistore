"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { DashboardSummary } from "../types";

interface TopProductsProps {
    summary: DashboardSummary | undefined;
}

export function TopProducts({ summary }: TopProductsProps) {
    return (
        <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4 p-0 mb-4">
                <CardTitle className="text-xs font-bold text-slate-900">
                    Produk Terlaris
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
                {summary &&
                summary.top_products &&
                summary.top_products.length > 0 ? (
                    summary.top_products.map((tp, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl"
                        >
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                #{i + 1}
                            </div>
                            <div className="grow">
                                <div className="font-bold text-[11px] text-slate-800">
                                    {tp.product_name}
                                </div>
                                <div className="text-[9px] text-slate-400 font-medium">
                                    Terjual {tp.quantity} pcs
                                </div>
                            </div>
                            <span className="font-bold text-xs text-slate-900 tabular-nums">
                                {formatRupiah(tp.revenue)}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                        Belum ada data transaksi.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
