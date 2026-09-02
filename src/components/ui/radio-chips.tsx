"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RadioChipOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
    description?: string;
    badge?: string;
    disabled?: boolean;
}

export interface RadioChipsProps {
    options: RadioChipOption[];
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    className?: string;
    wrapperClassName?: string;
    disabled?: boolean;
    variant?: "chips" | "segmented" | "cards";
    size?: "xs" | "sm" | "md" | "lg";
    columns?: number;
}

export function RadioChips({
    options,
    value,
    onChange,
    label,
    className,
    wrapperClassName,
    disabled = false,
    variant = "segmented",
    size = "sm",
    columns,
}: RadioChipsProps) {
    const handleSelect = (val: string) => {
        if (disabled) return;
        onChange?.(val);
    };

    const sizeClasses = {
        xs: "py-0.5 px-1.5 text-[10px]",
        sm: "py-1 px-1.5 text-[11px]",
        md: "py-1.5 px-2.5 text-xs",
        lg: "py-2.5 px-4 text-sm",
    }[size];

    return (
        <div className={cn("space-y-1 w-full", wrapperClassName)}>
            {label && (
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {label}
                </label>
            )}

            {variant === "segmented" && (
                <div
                    className={cn(
                        "p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl h-9 flex items-center gap-0.5",
                        columns ? `grid grid-cols-${columns}` : "flex flex-nowrap",
                        className
                    )}
                >
                    {options.map((option) => {
                        const isSelected = value === option.value;
                        const isOptionDisabled = disabled || option.disabled;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={isOptionDisabled}
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "flex-1 h-7.5 flex items-center justify-center gap-1 rounded-lg font-bold transition-all duration-150 cursor-pointer border select-none leading-none",
                                    sizeClasses,
                                    isSelected
                                        ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-slate-200/80 dark:border-slate-700 shadow-xs"
                                        : "bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50",
                                    isOptionDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                                )}
                            >
                                {option.icon && (
                                    <span
                                        className={cn(
                                            "shrink-0",
                                            isSelected
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-slate-400 dark:text-slate-500"
                                        )}
                                    >
                                        {option.icon}
                                    </span>
                                )}
                                <span className="truncate">{option.label}</span>
                                {option.badge && (
                                    <span className="text-[9px] px-1 py-0.2 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                        {option.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {variant === "chips" && (
                <div
                    className={cn(
                        "flex flex-wrap gap-1.5",
                        columns && `grid grid-cols-${columns}`,
                        className
                    )}
                >
                    {options.map((option) => {
                        const isSelected = value === option.value;
                        const isOptionDisabled = disabled || option.disabled;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={isOptionDisabled}
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "rounded-full font-semibold transition-all flex items-center gap-1.5 border cursor-pointer select-none",
                                    sizeClasses,
                                    isSelected
                                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold shadow-xs"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200",
                                    isOptionDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                                )}
                            >
                                {isSelected ? (
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[3px] shrink-0" />
                                ) : (
                                    option.icon && <span className="shrink-0 text-slate-400">{option.icon}</span>
                                )}
                                <span className="truncate">{option.label}</span>
                                {option.badge && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600">
                                        {option.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {variant === "cards" && (
                <div
                    className={cn(
                        "grid gap-2",
                        columns ? `grid-cols-${columns}` : "grid-cols-1 sm:grid-cols-3",
                        className
                    )}
                >
                    {options.map((option) => {
                        const isSelected = value === option.value;
                        const isOptionDisabled = disabled || option.disabled;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={isOptionDisabled}
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none relative",
                                    isSelected
                                        ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-emerald-400/40"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50/50",
                                    isOptionDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                                )}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-1.5">
                                        {option.icon && (
                                            <span
                                                className={cn(
                                                    "shrink-0",
                                                    isSelected ? "text-emerald-600" : "text-slate-400"
                                                )}
                                            >
                                                {option.icon}
                                            </span>
                                        )}
                                        <span className="font-bold text-xs">{option.label}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 stroke-[3px]" />
                                        </div>
                                    )}
                                </div>
                                {option.description && (
                                    <p className="text-[10px] text-slate-400 leading-snug">
                                        {option.description}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
