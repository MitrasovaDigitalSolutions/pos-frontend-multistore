"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

interface BalanceSheetHeaderFiltersProps {
    asOfDate: string;
    onAsOfDateChange: (val: string) => void;
    viewType: "standard" | "equation";
    onViewTypeChange: (val: "standard" | "equation") => void;
    showDebitCredit: boolean;
    onShowDebitCreditChange: (val: boolean) => void;
    extraAction?: React.ReactNode;
}

export function BalanceSheetHeaderFilters({
    asOfDate,
    onAsOfDateChange,
    viewType,
    onViewTypeChange,
    showDebitCredit,
    onShowDebitCreditChange,
    extraAction
}: BalanceSheetHeaderFiltersProps) {
    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800/80 mb-6">
            <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                        Neraca Keuangan (Balance Sheet)
                    </h2>
                    {extraAction}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Pencatatan posisi Aset, Kewajiban (Liabilitas), dan Ekuitas Modal untuk usaha Anda.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 xl:gap-6">
                {/* 1. Laporan View Mode (Standard vs Equation) */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/20 dark:border-slate-800/50">
                    <button
                        type="button"
                        onClick={() => onViewTypeChange("standard")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            viewType === "standard"
                                ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 shadow-sm font-extrabold"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                    >
                        Neraca Standar
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewTypeChange("equation")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            viewType === "equation"
                                ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 shadow-sm font-extrabold"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                    >
                        Persamaan Akuntansi
                    </button>
                </div>

                {/* 2. Toggle Debit/Credit Display format */}
                <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showDebitCredit}
                            onChange={(e) => onShowDebitCreditChange(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-650" />
                        <span className="ml-2 text-xs font-bold text-slate-650 dark:text-slate-400">
                            Tampilkan Detail D/K
                        </span>
                    </label>
                </div>

                {/* 3. Date Picker Filter */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">Per Tanggal:</span>
                    <DatePicker
                        value={asOfDate}
                        onChange={(val) => onAsOfDateChange(val || "")}
                        size="sm"
                        clearable={false}
                        className="w-[155px]"
                    />
                </div>
            </div>
        </div>
    );
}
