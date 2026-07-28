"use client";

import React, { ReactNode, useState } from "react";
import { FormProvider, UseFormReturn, FieldValues } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { IconFilter, IconRotate, IconChevronUp, IconChevronDown, IconSearch, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface FilterFormProps<T extends FieldValues> {
    methods: UseFormReturn<T>;
    onSubmit: (data: T) => void;
    onReset: () => void;
    children: ReactNode;
    className?: string;
    submitLabel?: string;
    submitIcon?: React.ReactNode;
    titleLabel?: string;
    titleIcon?: React.ReactNode;
    cols?: number;
    defaultExpanded?: boolean;
}

function formatFilterKey(key: string): string {
    const map: Record<string, string> = {
        user_uid: "Kasir",
        status: "Status",
        from: "Awal",
        to: "Akhir",
        search: "Cari",
        q: "Cari",
        nama: "Nama",
        category_uid: "Kategori",
        brand_uid: "Merek",
        store_uid: "Toko",
        supplier_uid: "Supplier",
        type: "Tipe",
    };
    return map[key] || key.replace(/_/g, " ");
}

function formatFilterValue(val: string): string {
    const lower = val.toLowerCase();
    const map: Record<string, string> = {
        open: "Terbuka",
        closed: "Ditutup",
        active: "Aktif",
        inactive: "Non-Aktif",
        true: "Ya",
        false: "Tidak",
    };
    const mapped = map[lower] || val;
    return mapped.length > 16 ? `${mapped.slice(0, 14)}...` : mapped;
}

export function FilterForm<T extends FieldValues>({
    methods,
    onSubmit,
    onReset,
    children,
    className,
    submitLabel,
    submitIcon,
    titleLabel,
    titleIcon,
    cols,
    defaultExpanded = true,
}: FilterFormProps<T>) {
    const queryClient = useQueryClient();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const watchedValues = methods.watch();

    // Extract active filter entries
    const activeFilters = React.useMemo(() => {
        if (!watchedValues) return [];
        const active: { key: string; value: string }[] = [];
        Object.entries(watchedValues).forEach(([key, val]) => {
            if (
                val !== undefined &&
                val !== null &&
                val !== "" &&
                val !== "all"
            ) {
                active.push({ key, value: String(val) });
            }
        });
        return active;
    }, [watchedValues]);

    const handleClearSingle = (key: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const resetVal = key === "status" ? "all" : "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        methods.setValue(key as any, resetVal as any);
        methods.handleSubmit((data) => {
            onSubmit(data);
            queryClient.invalidateQueries({ type: "active" });
        })();
    };

    // Count the direct children to determine the grid columns dynamically
    const childCount = React.Children.count(children);
    const isSingleFilter = childCount === 1;

    // Default icon and label settings depending on child count
    const defaultTitleIcon = isSingleFilter ? <IconSearch size={16} className="text-slate-500" /> : <IconFilter size={16} className="text-slate-500" />;
    const defaultSubmitIcon = isSingleFilter ? <IconSearch size={14} /> : <IconFilter size={14} />;

    const resolvedTitleIcon = titleIcon !== undefined ? titleIcon : defaultTitleIcon;
    const resolvedSubmitIcon = submitIcon !== undefined ? submitIcon : defaultSubmitIcon;

    const resolvedTitleLabel = titleLabel || (isSingleFilter ? "Pencarian" : "Filter Pencarian");
    const resolvedSubmitLabel = submitLabel || (isSingleFilter ? "Cari" : "Terapkan Filter");

    // Dynamic grid columns for multi-filter layouts
    const resolvedCols = cols !== undefined ? cols : Math.min(Math.max(childCount, 1), 4);
    const gridColsClass = {
        1: "md:grid-cols-1",
        2: "md:grid-cols-2",
        3: "md:grid-cols-3",
        4: "md:grid-cols-4",
    }[resolvedCols as 1 | 2 | 3 | 4] || "md:grid-cols-4";

    // Optimized layout for single-filter (search-only) forms: render inline in a single row
    if (isSingleFilter) {
        return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit((data) => {
                    onSubmit(data);
                    queryClient.invalidateQueries({ type: "active" });
                })}
                className={cn(
                    "bg-slate-50 border border-slate-100 rounded-xl p-2.5 sm:p-3 my-2.5 sm:my-3 flex flex-col sm:flex-row items-end gap-2.5 sm:gap-3 select-none",
                    className
                )}
            >
                <div className="flex-1 w-full">
                    {children}
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <Button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onReset();
                        }}
                        variant="outline"
                        className="border-slate-200 text-slate-500 font-bold text-xs h-8 sm:h-10 rounded-xl px-3 sm:px-4 bg-white hover:bg-slate-50 hover:text-slate-700 transition-colors gap-1.5 flex-1 sm:flex-initial"
                    >
                        <IconRotate size={13} />
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 font-bold text-xs text-white h-8 sm:h-10 rounded-xl px-3 sm:px-4 gap-1.5 flex-1 sm:flex-initial shadow-md shadow-sky-600/10 hover:shadow-lg transition-all border-none"
                    >
                        {resolvedSubmitIcon}
                        {resolvedSubmitLabel}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

return (
    <FormProvider {...methods}>
        <form
            onSubmit={methods.handleSubmit((data) => {
                onSubmit(data);
                queryClient.invalidateQueries({ type: "active" });
            })}
            className={cn(
                "bg-slate-50 border border-slate-100 rounded-xl my-2.5 sm:my-3 transition-all duration-200 select-none",
                isExpanded ? "p-3 sm:p-4 space-y-3 sm:space-y-4" : "p-2.5 sm:p-3",
                className
            )}
        >
            {/* Toggle Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between cursor-pointer select-none"
            >
                <div className="flex items-center gap-2 text-slate-700 min-w-0">
                    {resolvedTitleIcon}
                    <span className="text-xs font-bold truncate">{resolvedTitleLabel}</span>
                    {activeFilters.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 shrink-0">
                            {activeFilters.length} Aktif
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden xs:inline">
                        {isExpanded ? "Sembunyikan" : "Tampilkan"}
                    </span>
                    {isExpanded ? (
                        <IconChevronUp size={16} />
                    ) : (
                        <IconChevronDown size={16} />
                    )}
                </div>
            </div>

            {/* Active Filter Chips Summary (Visible when collapsed and filters are applied) */}
            {!isExpanded && activeFilters.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">Filter Aktif:</span>
                    {activeFilters.map((filter) => (
                        <span
                            key={filter.key}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40 shadow-2xs"
                        >
                            <span className="capitalize">{formatFilterKey(filter.key)}</span>:{" "}
                            <span className="font-extrabold">{formatFilterValue(filter.value)}</span>
                            <button
                                type="button"
                                onClick={(e) => handleClearSingle(filter.key, e)}
                                className="ml-0.5 p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded transition-colors text-emerald-600 dark:text-emerald-400 border-none bg-transparent cursor-pointer"
                                title={`Hapus filter ${formatFilterKey(filter.key)}`}
                            >
                                <IconX size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {isExpanded && (
                <>
                    {/* Filter Fields Grid */}
                    <div className={cn("grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-4 items-end pt-2.5 sm:pt-3 border-t border-slate-100/60", gridColsClass)}>
                        {children}
                    </div>

                    {/* Filter Action Buttons (Bottom Right) */}
                    <div className="flex justify-end items-center gap-2 pt-2.5 sm:pt-3 border-t border-slate-100/50">
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onReset();
                            }}
                            variant="outline"
                            className="border-slate-200 text-slate-500 font-bold text-xs h-8 sm:h-9 rounded-xl px-3 sm:px-4 bg-white hover:bg-slate-50 hover:text-slate-700 transition-colors gap-1.5 flex-1 sm:flex-initial"
                        >
                            <IconRotate size={13} />
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            className="bg-sky-600 hover:bg-sky-700 font-bold text-xs text-white h-8 sm:h-9 rounded-xl px-3 sm:px-4 gap-1.5 shadow-md shadow-sky-600/10 hover:shadow-lg transition-all border-none flex-1 sm:flex-initial"
                        >
                            {resolvedSubmitIcon}
                            {resolvedSubmitLabel}
                        </Button>
                    </div>
                </>
            )}
        </form>
    </FormProvider>
    );
}
