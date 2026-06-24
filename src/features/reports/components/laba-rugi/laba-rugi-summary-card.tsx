"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { LabaRugiReport } from "../../types";

interface LabaRugiSummaryCardProps {
    reportData: LabaRugiReport | undefined;
    isLoading: boolean;
}

export function LabaRugiSummaryCard({ reportData, isLoading }: LabaRugiSummaryCardProps) {
    return (
        <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:divide-x divide-slate-100">
                {/* Left Section: Main KPI */}
                {(() => {
                    const labaRugi = reportData?.total_laba_rugi ?? 0;
                    const isProfit = labaRugi >= 0;
                    return (
                        <div className="p-5 flex flex-col justify-between lg:w-1/4 shrink-0 bg-slate-50/40">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                        Hasil Bersih
                                    </span>
                                    {isLoading ? (
                                        <Skeleton className="h-4.5 w-10" />
                                    ) : (
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                            {isProfit ? 'Profit' : 'Loss'}
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-700 mt-2">
                                    Laba / Rugi Bersih
                                </h4>
                                <div className={`text-2xl font-extrabold tracking-tight mt-1 ${isProfit ? 'text-teal-600' : 'text-rose-600'}`}>
                                    {isLoading ? (
                                        <Skeleton className="h-7 w-36 mt-1" />
                                    ) : (
                                        formatRupiah(labaRugi)
                                    )}
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-4 leading-normal">
                                Total bersih setelah HPP, diskon, dan biaya operasional.
                            </p>
                        </div>
                    );
                })()}

                {/* Right Section: Breakdown Grid */}
                <div className="p-5 flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Penjualan Kotor */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Penjualan Kotor
                            </span>
                            <div className="text-sm font-extrabold text-slate-800 tracking-tight">
                                {isLoading ? (
                                    <Skeleton className="h-5 w-20 mt-0.5" />
                                ) : (
                                    formatRupiah(reportData?.total_h_jual ?? 0)
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Sebelum diskon & biaya
                            </span>
                        </div>

                        {/* Total HPP */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total HPP (COGS)
                            </span>
                            <div className="text-sm font-extrabold text-slate-700 tracking-tight">
                                {isLoading ? (
                                    <Skeleton className="h-5 w-20 mt-0.5" />
                                ) : (
                                    formatRupiah(reportData?.total_hpp ?? 0)
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Harga barang terjual
                            </span>
                        </div>

                        {/* Total Diskon */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total Diskon
                            </span>
                            <div className="text-sm font-extrabold text-amber-600 tracking-tight">
                                {isLoading ? (
                                    <Skeleton className="h-5 w-16 mt-0.5" />
                                ) : (
                                    formatRupiah(reportData?.total_diskon ?? 0)
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Potongan penjualan
                            </span>
                        </div>

                        {/* Laba Penjualan */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 block">
                                Laba Penjualan
                            </span>
                            <div className="text-sm font-extrabold text-emerald-600 tracking-tight">
                                {isLoading ? (
                                    <Skeleton className="h-5 w-20 mt-0.5" />
                                ) : (
                                    formatRupiah(reportData?.total_laba_penjualan ?? 0)
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Penjualan - HPP - Diskon
                            </span>
                        </div>

                        {/* Total Pengeluaran */}
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                                Total Pengeluaran
                            </span>
                            <div className="text-sm font-extrabold text-rose-600 tracking-tight">
                                {isLoading ? (
                                    <Skeleton className="h-5 w-16 mt-0.5" />
                                ) : (
                                    formatRupiah(reportData?.total_pengeluaran ?? 0)
                                )}
                            </div>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                                Biaya & pengeluaran kas
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
