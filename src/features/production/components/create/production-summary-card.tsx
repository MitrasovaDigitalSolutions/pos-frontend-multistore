"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconCheck,
    IconDeviceFloppy,
    IconLoader2,
    IconScale,
} from "@tabler/icons-react";

interface ProductionSummaryCardProps {
    totalBiayaBahan: number;
    totalOutputQty: number;
    totalAlokasiHpp: number;
    materialsCount: number;
    outputsCount: number;
    isPending: boolean;
    isEdit?: boolean;
    onSaveDraft?: () => void;
    onComplete?: () => void;
}

export function ProductionSummaryCard({
    totalBiayaBahan,
    totalOutputQty,
    totalAlokasiHpp,
    materialsCount,
    outputsCount,
    isPending,
    isEdit = false,
    onSaveDraft,
    onComplete,
}: ProductionSummaryCardProps) {
    const isBalanced = totalBiayaBahan > 0 && totalBiayaBahan === totalAlokasiHpp;
    const diff = Math.abs(totalBiayaBahan - totalAlokasiHpp);

    return (
        <div className="sticky bottom-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 px-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left KPI Chips */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs w-full md:w-auto">
                {/* 1. Biaya Bahan Baku */}
                <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/70 px-2.5 py-1 rounded-xl">
                    <span className="text-[10px] text-amber-700 font-bold uppercase">Biaya Bahan:</span>
                    <span className="font-extrabold text-amber-900 font-mono text-xs">
                        {formatRupiah(totalBiayaBahan)}
                    </span>
                </div>

                {/* 2. Total Hasil Jadi */}
                <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/70 px-2.5 py-1 rounded-xl">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Hasil Jadi:</span>
                    <span className="font-extrabold text-emerald-900 font-mono text-xs">
                        {totalOutputQty} Pcs
                    </span>
                </div>

                {/* 3. Total HPP Output */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                        Total HPP Output:
                    </span>
                    <span className="font-extrabold text-slate-800 font-mono text-xs">
                        {formatRupiah(totalAlokasiHpp)}
                    </span>
                </div>

                {/* 4. Status Alokasi Biaya */}
                <Badge
                    variant="outline"
                    className={`text-[10px] px-2.5 py-0.5 font-bold flex items-center gap-1 ${
                        isBalanced
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : totalAlokasiHpp === 0
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                >
                    <IconScale size={11} />
                    <span>
                        {isBalanced
                            ? "Alokasi Seimbang 100%"
                            : totalAlokasiHpp === 0
                                ? "Belum Diisi"
                                : `Selisih Alokasi: ${formatRupiah(diff)}`}
                    </span>
                </Badge>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {/* Save Draft Button */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={onSaveDraft}
                    disabled={isPending || materialsCount === 0 || outputsCount === 0}
                    className="flex-1 sm:flex-none h-9 px-4 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    {isPending ? (
                        <IconLoader2 size={15} className="animate-spin" />
                    ) : (
                        <IconDeviceFloppy size={15} className="text-slate-500" />
                    )}
                    <span>{isEdit ? "Update Draft" : "Simpan Draft"}</span>
                </Button>

                {/* Complete / Finalize Button */}
                <Button
                    type="button"
                    onClick={onComplete}
                    disabled={isPending || materialsCount === 0 || outputsCount === 0}
                    className="flex-1 sm:flex-none h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                    {isPending ? (
                        <>
                            <IconLoader2 size={15} className="animate-spin" />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <IconCheck size={15} />
                            <span>Selesaikan Produksi</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
