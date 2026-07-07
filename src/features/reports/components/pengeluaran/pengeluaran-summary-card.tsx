"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PengeluaranReport } from "../../types";

interface PengeluaranSummaryCardProps {
    reportData: PengeluaranReport | undefined;
    isLoading: boolean;
}

export function PengeluaranSummaryCard({ reportData, isLoading }: PengeluaranSummaryCardProps) {
    return (
        <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden my-6">
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {/* Left Section: Main KPI */}
                <div className="p-5 flex flex-col justify-between sm:w-1/2 bg-slate-50/40">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Total Pengeluaran
                        </span>
                        <h4 className="text-xs font-bold text-slate-700 mt-1.5">
                            Total Nilai Pengeluaran
                        </h4>
                        <div className="text-2xl font-extrabold tracking-tight mt-1 text-rose-600">
                            {isLoading ? (
                                <Skeleton className="h-7 w-36 mt-1" />
                            ) : (
                                formatRupiah(reportData?.total_amount ?? 0)
                            )}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 leading-normal">
                        Rangkuman total kas operasional yang dikeluarkan dalam periode terpilih.
                    </p>
                </div>

                {/* Right Section: Breakdown */}
                <div className="p-5 flex-1 flex flex-col justify-center bg-white">
                    <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                            Frekuensi Pengeluaran
                        </span>
                        <div className="text-sm font-extrabold text-slate-800 tracking-tight">
                            {isLoading ? (
                                <Skeleton className="h-5 w-24 mt-0.5" />
                            ) : (
                                `${reportData?.expenses?.length ?? 0} Transaksi`
                            )}
                        </div>
                        <span className="text-[9px] text-slate-400 block leading-tight">
                            Jumlah pencatatan pengeluaran operasional
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
