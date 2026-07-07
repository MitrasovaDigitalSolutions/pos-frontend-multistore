"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PurchaseReport } from "../../types";

interface PembelianSummaryCardProps {
    reportData: PurchaseReport | undefined;
    isLoading: boolean;
}

export function PembelianSummaryCard({ reportData, isLoading }: PembelianSummaryCardProps) {
    return (
        <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex flex-col lg:flex-row lg:divide-x divide-slate-100">
                {/* Left Section: Main KPI */}
                <div className="p-5 flex flex-col justify-between lg:w-1/4 shrink-0 bg-slate-50/40">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Hasil Akhir
                        </span>
                        <h4 className="text-xs font-bold text-slate-700 mt-1.5">
                            Total Pembelian Bersih
                        </h4>
                        <div className="text-2xl font-extrabold tracking-tight mt-1 text-emerald-600">
                            {isLoading ? (
                                <Skeleton className="h-7 w-36 mt-1" />
                            ) : (
                                formatRupiah(reportData?.total_net ?? 0)
                            )}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 leading-normal">
                        Nilai bersih pembelian barang masuk setelah dikurangi nilai barang yang diretur.
                    </p>
                </div>

                {/* Right Section: Breakdown Grid */}
                <div className="p-5 flex-1 flex flex-col justify-center bg-white">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Total Faktur */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total Faktur (Kotor)
                            </span>
                            <div className="text-sm font-extrabold text-slate-800 tracking-tight">
                                {isLoading ? (
                                    <Skeleton className="h-5 w-20 mt-0.5" />
                                ) : (
                                    formatRupiah(reportData?.total_amount ?? 0)
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Sebelum potongan retur
                            </span>
                        </div>

                        {/* Total Retur */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total Nilai Retur
                            </span>
                            <div className="text-sm font-extrabold text-amber-600 tracking-tight">
                                {isLoading ? (
                                    <Skeleton className="h-5 w-16 mt-0.5" />
                                ) : (
                                    formatRupiah(reportData?.total_retur ?? 0)
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Nilai retur barang masuk
                            </span>
                        </div>

                        {/* Total Sisa Hutang */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total Sisa Hutang
                            </span>
                            <div className={`text-sm font-extrabold tracking-tight ${(reportData?.total_hutang ?? 0) > 0 ? "text-rose-600 animate-pulse" : "text-slate-500"}`}>
                                {isLoading ? (
                                    <Skeleton className="h-5 w-20 mt-0.5" />
                                ) : (
                                    formatRupiah(reportData?.total_hutang ?? 0)
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Hutang tempo belum lunas
                            </span>
                        </div>

                        {/* Volume Transaksi */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Volume Transaksi
                            </span>
                            <div className="text-sm font-extrabold text-slate-800 tracking-tight">
                                {isLoading ? (
                                    <Skeleton className="h-5 w-16 mt-0.5" />
                                ) : (
                                    `${reportData?.receivings?.length ?? 0} Faktur`
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Jumlah faktur masuk
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
