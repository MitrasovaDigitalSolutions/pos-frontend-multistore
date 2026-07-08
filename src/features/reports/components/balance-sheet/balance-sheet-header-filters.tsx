"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { getTodayRange, getThisMonthRange, getThisYearRange } from "@/lib/date-utils";

interface BalanceSheetHeaderFiltersProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (val: string) => void;
    onEndDateChange: (val: string) => void;
    onPresetChange: (preset: "today" | "thisMonth" | "thisYear") => void;
}

export function BalanceSheetHeaderFilters({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onPresetChange
}: BalanceSheetHeaderFiltersProps) {
    const todayRange = getTodayRange();
    const thisMonthRange = getThisMonthRange();
    const thisYearRange = getThisYearRange();

    const isTodayActive = startDate === todayRange.from && endDate === todayRange.to;
    const isThisMonthActive = startDate === thisMonthRange.from && endDate === thisMonthRange.to;
    const isThisYearActive = startDate === thisYearRange.from && endDate === thisYearRange.to;

    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Neraca Keuangan (Balance Sheet)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    Menampilkan posisi Aset, Kewajiban (Liabilitas), dan Ekuitas Modal dalam periode yang Anda pilih.
                </p>
            </div>
            
            {/* Date Filter Control Bar */}
            <div className="flex flex-col sm:flex-row items-end gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                <div className="flex gap-3 w-full sm:w-auto">
                    <DatePicker
                        value={startDate}
                        onChange={(val) => onStartDateChange(val || "")}
                        label="Dari Tanggal"
                        className="w-[160px]"
                    />
                    <DatePicker
                        value={endDate}
                        onChange={(val) => onEndDateChange(val || "")}
                        label="Sampai Tanggal"
                        className="w-[160px]"
                    />
                </div>
                {/* Preset buttons */}
                <div className="flex gap-1.5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-3">
                    <button
                        type="button"
                        onClick={() => onPresetChange("today")}
                        className={cn(
                            "flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all duration-200",
                            isTodayActive
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                        )}
                    >
                        Hari Ini
                    </button>
                    <button
                        type="button"
                        onClick={() => onPresetChange("thisMonth")}
                        className={cn(
                            "flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all duration-200",
                            isThisMonthActive
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                        )}
                    >
                        Bulan Ini
                    </button>
                    <button
                        type="button"
                        onClick={() => onPresetChange("thisYear")}
                        className={cn(
                            "flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all duration-200",
                            isThisYearActive
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                        )}
                    >
                        Tahun Ini
                    </button>
                </div>
            </div>
        </div>
    );
}
