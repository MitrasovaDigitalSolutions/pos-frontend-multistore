"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { DashboardSummary } from "../types";

interface SalesChartProps {
    summary: DashboardSummary | undefined;
}

export function SalesChart({ summary }: SalesChartProps) {
    return (
        <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4 p-0">
                <CardTitle className="text-xs font-bold text-slate-900">
                    Perbandingan Penjualan
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-6">
                <div className="h-45 flex items-end justify-around px-2 gap-4">
                    <div className="flex flex-col items-center grow group gap-2">
                        <div className="w-16 bg-emerald-600 rounded-t-lg h-32.5 flex items-center justify-center text-white text-[10px] font-bold">
                            {summary ? formatRupiah(summary.net_sales) : "Rp 0"}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">
                            Bersih (Net)
                        </span>
                    </div>
                    <div className="flex flex-col items-center grow group gap-2">
                        <div className="w-16 bg-slate-300 rounded-t-lg h-37.5 flex items-center justify-center text-slate-800 text-[10px] font-bold">
                            {summary
                                ? formatRupiah(summary.gross_sales)
                                : "Rp 0"}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">
                            Kotor (Gross)
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
