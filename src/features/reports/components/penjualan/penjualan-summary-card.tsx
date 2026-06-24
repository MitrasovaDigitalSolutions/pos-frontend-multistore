"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PenjualanReport } from "../../types";

interface PenjualanSummaryCardProps {
    reportData: PenjualanReport | undefined;
    isLoading: boolean;
}

export function PenjualanSummaryCard({ reportData, isLoading }: PenjualanSummaryCardProps) {
    return (
        <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {/* Left Section: Main KPI */}
                <div className="p-5 flex flex-col justify-between sm:w-1/2 bg-slate-50/40">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Total Penjualan
                        </span>
                        <h4 className="text-xs font-bold text-slate-700 mt-1.5">
                            Total Nilai Penjualan
                        </h4>
                        <div className="text-2xl font-extrabold tracking-tight mt-1 text-emerald-600">
                            {isLoading ? (
                                <Skeleton className="h-7 w-36 mt-1" />
                            ) : (
                                formatRupiah(reportData?.total_amount ?? 0)
                            )}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 leading-normal">
                        Total nilai bersih dari seluruh transaksi penjualan barang keluar dalam periode terpilih.
                    </p>
                </div>

                {/* Right Section: Volume Transaksi */}
                <div className="p-5 flex-1 flex flex-col justify-center bg-white">
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                            Volume Transaksi
                        </span>
                        <div className="text-sm font-extrabold text-slate-800 tracking-tight">
                            {isLoading ? (
                                <Skeleton className="h-5 w-24 mt-0.5" />
                            ) : (
                                `${reportData?.sales?.meta?.total ?? reportData?.receivings?.meta?.total ?? 0} Faktur`
                            )}
                        </div>
                        <span className="text-[9px] text-slate-400 block leading-tight">
                            Jumlah faktur penjualan barang keluar yang tercatat
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
