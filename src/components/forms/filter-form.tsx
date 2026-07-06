"use client";

import React, { ReactNode, useState } from "react";
import { FormProvider, UseFormReturn, FieldValues } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { IconFilter, IconRotate, IconChevronUp, IconChevronDown, IconSearch } from "@tabler/icons-react";
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
                    "bg-slate-50 border border-slate-100 rounded-xl p-3 my-3 flex flex-col sm:flex-row items-end gap-3 select-none",
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
                        className="border-slate-200 text-slate-500 font-bold text-xs h-10 rounded-xl px-4 bg-white hover:bg-slate-50 hover:text-slate-700 transition-colors gap-1.5 flex-1 sm:flex-initial"
                    >
                        <IconRotate size={14} />
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 font-bold text-xs text-white h-10 rounded-xl px-4 gap-1.5 flex-1 sm:flex-initial shadow-md shadow-sky-600/10 hover:shadow-lg transition-all border-none"
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
                "bg-slate-50 border border-slate-100 rounded-xl my-3 transition-all duration-200 select-none",
                isExpanded ? "p-4 space-y-4" : "p-3",
                className
            )}
        >
            {/* Toggle Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center gap-2 text-slate-700">
                    {resolvedTitleIcon}
                    <span className="text-xs font-bold">{resolvedTitleLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isExpanded ? "Sembunyikan" : "Tampilkan"}
                    </span>
                    {isExpanded ? (
                        <IconChevronUp size={16} />
                    ) : (
                        <IconChevronDown size={16} />
                    )}
                </div>
            </div>

            {isExpanded && (
                <>
                    {/* Filter Fields Grid */}
                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-3 border-t border-slate-100/60", gridColsClass)}>
                        {children}
                    </div>

                    {/* Filter Action Buttons (Bottom Right) */}
                    <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-100/50">
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onReset();
                            }}
                            variant="outline"
                            className="border-slate-200 text-slate-500 font-bold text-xs h-9 rounded-xl px-4 bg-white hover:bg-slate-50 hover:text-slate-700 transition-colors gap-1.5"
                        >
                            <IconRotate size={14} />
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            className="bg-sky-600 hover:bg-sky-700 font-bold text-xs text-white h-9 rounded-xl px-4 gap-1.5 shadow-md shadow-sky-600/10 hover:shadow-lg transition-all border-none"
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
