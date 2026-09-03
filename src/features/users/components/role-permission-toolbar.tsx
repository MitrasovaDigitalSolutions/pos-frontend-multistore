"use client";

import { AppButton } from "@/components/shared/app-button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
    IconArrowsMaximize,
    IconArrowsMinimize,
    IconFilter,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import type { PermissionCategoryType } from "./role-permission-types";

interface RolePermissionToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    categories: PermissionCategoryType[];
    selectedCategoryId: string;
    onSelectCategory: (categoryId: string) => void;
    onlyAssigned: boolean;
    onToggleOnlyAssigned: (value: boolean) => void;
    visibleCount: number;
    totalCount: number;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

export function RolePermissionToolbar({
    searchQuery,
    onSearchChange,
    categories,
    selectedCategoryId,
    onSelectCategory,
    onlyAssigned,
    onToggleOnlyAssigned,
    visibleCount,
    totalCount,
    onExpandAll,
    onCollapseAll,
}: RolePermissionToolbarProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-3 shadow-2xs">
            {/* Top Row: Search Input + Only Active Filter + Expand/Collapse Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                        <IconSearch size={15} />
                    </span>
                    <Input
                        type="text"
                        placeholder="Cari izin berdasarkan nama atau kode..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-8.5 pl-9 pr-8 text-xs border-slate-200 focus-visible:ring-emerald-500 rounded-lg bg-slate-50/60 dark:bg-slate-800/60 dark:border-slate-700"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <IconX size={14} />
                        </button>
                    )}
                </div>

                {/* Right Controls: Only Active Switch & Expand/Collapse */}
                <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                    {/* Only Active Filter Switch */}
                    <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                        <IconFilter size={13} className="text-slate-400" />
                        <span>Hanya Aktif</span>
                        <Switch
                            checked={onlyAssigned}
                            onCheckedChange={onToggleOnlyAssigned}
                            className="scale-80"
                        />
                    </label>

                    {/* Expand & Collapse Controls */}
                    <div className="flex items-center gap-1.5">
                        <AppButton
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={onExpandAll}
                            className="h-7 px-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg border-slate-200 dark:border-slate-700 flex items-center gap-1"
                        >
                            <IconArrowsMaximize size={12} />
                            <span>Buka Semua</span>
                        </AppButton>
                        <AppButton
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={onCollapseAll}
                            className="h-7 px-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg border-slate-200 dark:border-slate-700 flex items-center gap-1"
                        >
                            <IconArrowsMinimize size={12} />
                            <span>Tutup Semua</span>
                        </AppButton>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Category Filter Chips Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-thin">
                <button
                    type="button"
                    onClick={() => onSelectCategory("all")}
                    className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 border",
                        selectedCategoryId === "all"
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600"
                            : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                    )}
                >
                    Semua Modul ({totalCount})
                </button>

                {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const count = cat.items.length;

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onSelectCategory(cat.id)}
                            className={cn(
                                "px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5",
                                isSelected
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                            )}
                        >
                            <span>{cat.shortLabel || cat.label}</span>
                            <span
                                className={cn(
                                    "text-[9.5px] px-1.5 py-0.2 rounded-md font-mono",
                                    isSelected
                                        ? "bg-emerald-700 text-white"
                                        : "bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                )}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}

                {/* Visible Count Indicator */}
                <div className="ml-auto shrink-0 pl-2 text-[10px] text-slate-400 font-medium">
                    {visibleCount} ditampilkan
                </div>
            </div>
        </div>
    );
}
