"use client";

import { useState } from "react";
import { Controller, type FieldPath, type FieldValues, type FieldError, type FieldErrors, useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, Search, Loader2, X } from "lucide-react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";
import type { CommandOption } from "@/components/ui/command-select";
import { STORE_BADGE_HQ, STORE_LABEL_HQ } from "@/constants/store";

export interface MultiSelectOption {
    value: string;
    label: string;
    description?: string;
    badge?: string;
    disabled?: boolean;
}

export interface FormMultiSelectProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string;
    options: (MultiSelectOption | CommandOption)[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    isLoading?: boolean;
    className?: string;
    wrapperClassName?: string;
    disabled?: boolean;
    selectAllText?: string;
    size?: "sm" | "md" | "lg";
    maxLabelLength?: number;
    leftIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
    onChange?: (value: string[]) => void;
}

export function FormMultiSelect<T extends FieldValues>({
    name,
    label,
    options,
    placeholder = "Pilih opsi...",
    searchPlaceholder = "Cari opsi...",
    emptyMessage = "Tidak ada data.",
    isLoading = false,
    className,
    wrapperClassName,
    disabled = false,
    selectAllText,
    size = "md",
    maxLabelLength,
    leftIcon,
    rightElement,
    onChange: propsOnChange,
}: FormMultiSelectProps<T>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const effectiveSelectAllText = selectAllText || (placeholder !== "Pilih opsi..." ? placeholder : undefined);

    const filteredOptions = options.filter((opt) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
            opt.label.toLowerCase().includes(q) ||
            opt.value.toLowerCase().includes(q) ||
            (opt.description && opt.description.toLowerCase().includes(q))
        );
    });

    const sizeClasses = {
        sm: "h-8 text-xs font-normal text-slate-700",
        md: "h-10 text-xs font-normal text-slate-800",
        lg: "h-12 text-sm font-normal text-slate-800",
    }[size];

    // Helper to resolve nested errors
    const getNestedValue = (
        obj: FieldErrors<T>,
        path: string,
    ): FieldError | undefined => {
        const value = path
            .split(/[.[\]]+/)
            .filter(Boolean)
            .reduce<unknown>((prev, curr) => {
                if (prev && typeof prev === "object") {
                    return (prev as Record<string, unknown>)[curr];
                }
                return undefined;
            }, obj);
        return value as FieldError | undefined;
    };

    const error = getNestedValue(errors, name);

    return (
        <div className={cn("space-y-1.5 w-full", wrapperClassName)}>
            {label && (
                <label
                    htmlFor={name}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                    {label}
                </label>
            )}

            <Controller
                control={control}
                name={name}
                render={({ field: { value, onChange } }) => {
                    const selectedValues: string[] = Array.isArray(value) ? value : [];
                    const isAllSelected = selectedValues.length === 0;

                    const handleToggleOption = (val: string) => {
                        let updated: string[];
                        if (selectedValues.includes(val)) {
                            updated = selectedValues.filter((v) => v !== val);
                        } else {
                            updated = [...selectedValues, val];
                        }
                        onChange(updated);
                        if (propsOnChange) {
                            propsOnChange(updated);
                        }
                    };

                    const handleClearAll = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        onChange([]);
                        if (propsOnChange) {
                            propsOnChange([]);
                        }
                    };

                    const getDisplayLabel = () => {
                        if (isAllSelected) {
                            return effectiveSelectAllText || placeholder;
                        }
                        if (selectedValues.length === 1) {
                            const match = options.find((o) => o.value === selectedValues[0]);
                            const labelStr = match?.label || selectedValues[0];
                            if (maxLabelLength && labelStr.length > maxLabelLength) {
                                return labelStr.substring(0, maxLabelLength) + "...";
                            }
                            return labelStr;
                        }
                        return `${selectedValues.length} Dipilih`;
                    };

                    return (
                        <div className="relative w-full max-w-full min-w-0">
                            <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
                                <PopoverPrimitive.Trigger
                                    render={
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            className={cn(
                                                "flex w-full max-w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 outline-none transition-all hover:bg-slate-50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer overflow-hidden",
                                                isOpen && "border-emerald-600 ring-2 ring-emerald-600/20",
                                                error && "border-rose-400 focus:border-rose-400 focus:ring-rose-500/20",
                                                sizeClasses,
                                                className
                                            )}
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                                {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                                                <span
                                                    className={cn(
                                                        "truncate text-left",
                                                        isAllSelected ? "text-slate-400 font-normal" : "text-slate-800 font-medium"
                                                    )}
                                                >
                                                    {getDisplayLabel()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {!isAllSelected && (
                                                    <span
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={handleClearAll}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                e.preventDefault();
                                                                handleClearAll(e as unknown as React.MouseEvent);
                                                            }
                                                        }}
                                                        className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                                                        title="Reset Opsi"
                                                    >
                                                        <X size={12} />
                                                    </span>
                                                )}
                                                {rightElement}
                                                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 text-slate-500" />
                                            </div>
                                        </button>
                                    }
                                />

                                <PopoverPrimitive.Portal>
                                    <PopoverPrimitive.Positioner
                                        align="start"
                                        side="bottom"
                                        sideOffset={4}
                                        className="isolate z-50"
                                    >
                                        <PopoverPrimitive.Popup
                                            className="w-(--anchor-width) min-w-[200px] max-h-[300px] origin-(--transform-origin) animate-in fade-in-0 zoom-in-95 duration-100 outline-none overflow-hidden"
                                        >
                                            <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-slate-950 border border-slate-100 shadow-md">
                                                {/* Search header */}
                                                <div className="flex items-center border-b border-slate-100 px-3 py-1 bg-slate-50/10">
                                                    <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        className="flex h-9 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                        placeholder={searchPlaceholder}
                                                        value={search}
                                                        onChange={(e) => setSearch(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>

                                                {/* Options List */}
                                                <div className="max-h-[200px] overflow-y-auto overflow-x-hidden p-1 custom-scrollbar space-y-0.5">
                                                    {isLoading && (
                                                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                                                            <span>Memuat data...</span>
                                                        </div>
                                                    )}

                                                    {!isLoading && filteredOptions.length === 0 && (
                                                        <div className="py-4 text-center text-xs text-slate-400">
                                                            {emptyMessage}
                                                        </div>
                                                    )}

                                                    {!isLoading && (
                                                        <>
                                                            {/* All option if selectAllText / placeholder provided */}
                                                            {effectiveSelectAllText && !search.trim() && (
                                                                <div
                                                                    onClick={() => {
                                                                        onChange([]);
                                                                        if (propsOnChange) propsOnChange([]);
                                                                    }}
                                                                    className={cn(
                                                                        "relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-slate-50 hover:text-slate-900",
                                                                        isAllSelected && "bg-emerald-50/50 text-emerald-700 font-bold"
                                                                    )}
                                                                >
                                                                    {isAllSelected && <Check className="mr-2 h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                                                                    <div className={cn("min-w-0 flex-1 text-left font-medium", !isAllSelected && "pl-[22px]")}>
                                                                        {effectiveSelectAllText}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Individual options */}
                                                            {filteredOptions.map((opt, idx) => {
                                                                const isSelected = selectedValues.includes(opt.value);
                                                                const truncatedLabel =
                                                                    maxLabelLength && opt.label.length > maxLabelLength
                                                                        ? opt.label.substring(0, maxLabelLength) + "..."
                                                                        : opt.label;
                                                                return (
                                                                    <div
                                                                        key={`${opt.value}-${idx}`}
                                                                        onClick={() => handleToggleOption(opt.value)}
                                                                        className={cn(
                                                                            "relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-slate-50 hover:text-slate-900",
                                                                            isSelected && "bg-emerald-50/50 text-emerald-700 font-bold"
                                                                        )}
                                                                    >
                                                                        {isSelected && <Check className="mr-2 h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                                                                        <div className={cn("min-w-0 flex-1 text-left flex items-center justify-between gap-2", !isSelected && "pl-[22px]")}>
                                                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                                {opt.badge && (
                                                                                    <span className="text-[9px] bg-emerald-600 text-white font-mono px-1 rounded font-extrabold shrink-0">
                                                                                        {opt.badge}
                                                                                    </span>
                                                                                )}
                                                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                                    <span className="font-semibold text-slate-800 truncate block">{truncatedLabel}</span>
                                                                                    {opt.description && (
                                                                                        <span className="text-[10px] text-slate-400 font-normal truncate block">{opt.description}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {(opt.description === STORE_LABEL_HQ || opt.description === "Toko Pusat" || opt.badge === STORE_BADGE_HQ) && (
                                                                                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
                                                                                    {STORE_BADGE_HQ}
                                                                                </span>
                                                                            )}
                                                                            {opt.description === "Toko Cabang" && (
                                                                                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200 leading-none">
                                                                                    Cabang
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </PopoverPrimitive.Popup>
                                    </PopoverPrimitive.Positioner>
                                </PopoverPrimitive.Portal>
                            </PopoverPrimitive.Root>
                        </div>
                    );
                }}
            />
            {error && (
                <p className="text-[10px] text-rose-500 font-medium">
                    {error.message}
                </p>
            )}
        </div>
    );
}

