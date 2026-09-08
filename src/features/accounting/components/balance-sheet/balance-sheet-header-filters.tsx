"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AccountingReportMode } from "@/features/accounting/types";
import {
    IconScale,
    IconTrendingUp,
    IconMathSymbols,
    IconCalendar,
    IconChevronDown,
    IconCheck,
} from "@tabler/icons-react";

interface BalanceSheetHeaderFiltersProps {
    asOfDate: string;
    onAsOfDateChange: (val: string) => void;
    viewType: AccountingReportMode;
    onViewTypeChange: (val: AccountingReportMode) => void;
    showDebitCredit: boolean;
    onShowDebitCreditChange: (val: boolean) => void;
    extraAction?: React.ReactNode;
    title?: string;
    description?: string;
    badge?: React.ReactNode;
    icon?: React.ReactNode;
}

export function BalanceSheetHeaderFilters({
    asOfDate,
    onAsOfDateChange,
    viewType,
    onViewTypeChange,
    showDebitCredit,
    onShowDebitCreditChange,
    extraAction,
    title,
    description,
    badge,
    icon,
}: BalanceSheetHeaderFiltersProps) {
    const presets = useMemo(() => {
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        const lastYear = new Date(today.getFullYear() - 1, 12, 0);

        const formatDateStr = (date: Date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        };

        return [
            { label: "Hari Ini", value: formatDateStr(today) },
            { label: "Akhir Bulan Ini", value: formatDateStr(thisMonth) },
            { label: "Akhir Bulan Lalu", value: formatDateStr(lastMonth) },
            { label: "Akhir Tahun Lalu", value: formatDateStr(lastYear) },
        ];
    }, []);

    // Dynamic Title, Description & Icon based on Active Mode
    const defaultMeta = useMemo(() => {
        switch (viewType) {
            case "laba_rugi":
                return {
                    title: "Laporan Laba Rugi",
                    description: "Laporan kinerja operasional yang mencakup seluruh Pendapatan dan Beban usaha.",
                    icon: <IconTrendingUp className="w-4 h-4" />,
                };
            case "equation":
                return {
                    title: "Persamaan Dasar Akuntansi",
                    description: "Audit pembukuan komprehensif: Aset + Beban = Liabilitas + Ekuitas + Pendapatan.",
                    icon: <IconMathSymbols className="w-4 h-4" />,
                };
            case "neraca":
            default:
                return {
                    title: "Neraca Keuangan",
                    description: "Laporan posisi keuangan yang mencakup Aset, Liabilitas, dan Ekuitas perusahaan.",
                    icon: <IconScale className="w-4 h-4" />,
                };
        }
    }, [viewType]);

    const titleToRender = title || defaultMeta.title;
    const descriptionToRender = description || defaultMeta.description;
    const iconToRender = icon || defaultMeta.icon;
    const badgeToRender = badge || null;

    const reportModes: { mode: AccountingReportMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
        { mode: "neraca", label: "Neraca", icon: IconScale },
        { mode: "laba_rugi", label: "Laba Rugi", icon: IconTrendingUp },
        { mode: "equation", label: "Persamaan Akuntansi", icon: IconMathSymbols },
    ];

    return (
        <div className="space-y-3">
            {/* 1. Compact Header Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                        {iconToRender}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight truncate">
                                {titleToRender}
                            </h2>
                            {badgeToRender}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-snug hidden sm:block truncate">
                            {descriptionToRender}
                        </p>
                    </div>
                </div>

                {extraAction && (
                    <div className="self-end sm:self-auto shrink-0">
                        {extraAction}
                    </div>
                )}
            </div>

            {/* 2. Compact Filter Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 min-w-0">
                {/* Left Side: View Mode Selector */}
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <div className="relative flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-fit">
                        {reportModes.map(({ mode, label, icon: ModeIcon }) => {
                            const isActive = viewType === mode;
                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => onViewTypeChange(mode)}
                                    className={cn(
                                        "relative z-10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none flex-1 sm:flex-none justify-center",
                                        isActive
                                            ? "text-indigo-950 dark:text-indigo-50"
                                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeViewType"
                                            className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-xs border border-slate-200/40 dark:border-slate-800 -z-10"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <ModeIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Cutoff Date & D/K Switch */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between md:justify-end">
                    {/* Date Picker & Presets */}
                    <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                        <DatePicker
                            value={asOfDate}
                            onChange={(val) => onAsOfDateChange(val || "")}
                            placeholder="Cutoff Tanggal"
                            size="sm"
                            clearable={false}
                            className="w-full sm:w-36 text-xs h-8 rounded-xl"
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
                                    title="Preset Periode"
                                >
                                    <IconCalendar className="w-3.5 h-3.5 text-indigo-500" />
                                    <IconChevronDown className="w-3 h-3 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 text-xs">
                                <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase tracking-wider">
                                    Pilih Cutoff
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {presets.map((preset) => {
                                    const isSelected = asOfDate === preset.value;
                                    return (
                                        <DropdownMenuItem
                                            key={preset.label}
                                            onClick={() => onAsOfDateChange(preset.value)}
                                            className={cn(
                                                "cursor-pointer flex items-center justify-between text-xs py-1.5",
                                                isSelected && "font-bold text-indigo-600 dark:text-indigo-400"
                                            )}
                                        >
                                            <span>{preset.label}</span>
                                            {isSelected && <IconCheck className="w-3.5 h-3.5" />}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Detail D/K Switch */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 shrink-0 select-none">
                        <Switch
                            id="switch-dk-compact"
                            checked={showDebitCredit}
                            onCheckedChange={onShowDebitCreditChange}
                            className="scale-75 data-[state=checked]:bg-indigo-600"
                        />
                        <label
                            htmlFor="switch-dk-compact"
                            className="text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                            Detail D/K
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
