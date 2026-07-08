"use client";

import { DatePicker } from "@/components/ui/date-picker";

interface BalanceSheetHeaderFiltersProps {
    asOfDate: string;
    onAsOfDateChange: (val: string) => void;
    extraAction?: React.ReactNode;
}

export function BalanceSheetHeaderFilters({
    asOfDate,
    onAsOfDateChange,
    extraAction
}: BalanceSheetHeaderFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
            <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Neraca Keuangan (Balance Sheet)
                    </h2>
                    {extraAction}
                </div>
                <p className="text-xs text-slate-500">
                    Menampilkan posisi Aset, Kewajiban (Liabilitas), dan Ekuitas Modal pada tanggal yang Anda pilih.
                </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-500 mr-1">Per Tanggal:</span>
                <DatePicker
                    value={asOfDate}
                    onChange={(val) => onAsOfDateChange(val || "")}
                    size="sm"
                    clearable={false}
                    className="w-[180px]"
                />
            </div>
        </div>
    );
}


