"use client";

import { useState, useRef, useEffect } from "react";
import { Controller, type FieldPath, type FieldValues, useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scrollable } from "@/components/ui/scrollable";

export interface MultiSelectOption {
    value: string;
    label: string;
    description?: string;
    badge?: string;
}

export interface FormMultiSelectProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string;
    options: MultiSelectOption[];
    placeholder?: string;
    className?: string;
    wrapperClassName?: string;
    disabled?: boolean;
    selectAllText?: string;
}

export function FormMultiSelect<T extends FieldValues>({
    name,
    label,
    options,
    // placeholder = "Pilih opsi...",
    className,
    wrapperClassName,
    disabled = false,
    selectAllText = "Semua Cabang Toko",
}: FormMultiSelectProps<T>) {
    const { control } = useFormContext<T>();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={containerRef} className={cn("space-y-1.5 w-full", wrapperClassName)}>
            {label && (
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {label}
                </label>
            )}

            <Controller
                control={control}
                name={name}
                render={({ field: { value, onChange }, fieldState: { error } }) => {
                    const selectedValues: string[] = Array.isArray(value) ? value : [];
                    const isAllSelected = selectedValues.length === 0;

                    const handleToggleOption = (val: string) => {
                        if (selectedValues.includes(val)) {
                            const updated = selectedValues.filter((v) => v !== val);
                            onChange(updated);
                        } else {
                            onChange([...selectedValues, val]);
                        }
                    };

                    const handleClearAll = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        onChange([]);
                    };

                    const getDisplayLabel = () => {
                        if (isAllSelected) return selectAllText;
                        if (selectedValues.length === 1) {
                            const match = options.find((o) => o.value === selectedValues[0]);
                            return match?.label || selectedValues[0];
                        }
                        return `${selectedValues.length} Cabang Dipilih`;
                    };

                    return (
                        <div className="relative">
                            {/* Trigger Button - Pixel-identical to FormSelect & FormDatePicker */}
                            <div
                                onClick={() => !disabled && setIsOpen(!isOpen)}
                                className={cn(
                                    "flex items-center justify-between h-9 w-full px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer text-xs font-semibold text-slate-900 shadow-2xs",
                                    isOpen && "border-slate-800 ring-2 ring-slate-800/10",
                                    error && "border-rose-400 focus:border-rose-400 focus:ring-rose-500/20",
                                    disabled && "opacity-50 cursor-not-allowed bg-slate-100",
                                    className
                                )}
                            >
                                <span className={cn("truncate font-semibold text-xs", isAllSelected ? "text-slate-500" : "text-slate-900")}>
                                    {getDisplayLabel()}
                                </span>

                                <div className="flex items-center gap-1 shrink-0 ml-1">
                                    {!isAllSelected && (
                                        <button
                                            type="button"
                                            onClick={handleClearAll}
                                            className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                                            title="Reset Opsi"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                    <ChevronsUpDown size={14} className="text-slate-400" />
                                </div>
                            </div>

                            {/* Dropdown Popover */}
                            {isOpen && (
                                <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-slate-200 shadow-xl p-2 space-y-2 animate-in fade-in-50 zoom-in-95">
                                    {/* Search input */}
                                    <input
                                        type="text"
                                        placeholder="Cari..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                    />

                                    {/* Options List */}
                                    <Scrollable className="max-h-48">
                                        <div className="space-y-0.5">
                                            {/* All option */}
                                            <div
                                                onClick={() => {
                                                    onChange([]);
                                                }}
                                                className={cn(
                                                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors",
                                                    isAllSelected
                                                        ? "bg-slate-900 text-white font-bold"
                                                        : "hover:bg-slate-100 text-slate-700 font-medium"
                                                )}
                                            >
                                                <span className="truncate">{selectAllText}</span>
                                                {isAllSelected && <Check size={14} className="shrink-0" />}
                                            </div>

                                            {/* Individual options */}
                                            {filteredOptions.map((opt) => {
                                                const isSelected = selectedValues.includes(opt.value);
                                                return (
                                                    <div
                                                        key={opt.value}
                                                        onClick={() => handleToggleOption(opt.value)}
                                                        className={cn(
                                                            "flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors",
                                                            isSelected
                                                                ? "bg-slate-900 text-white font-bold"
                                                                : "hover:bg-slate-100 text-slate-700 font-medium"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            {opt.badge && (
                                                                <span className="text-[9px] bg-emerald-600 text-white font-mono px-1 rounded font-extrabold shrink-0">
                                                                    {opt.badge}
                                                                </span>
                                                            )}
                                                            <span className="truncate">{opt.label}</span>
                                                        </div>
                                                        {isSelected && (
                                                            <Check size={14} className="shrink-0" />
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {filteredOptions.length === 0 && (
                                                <div className="py-3 text-center text-slate-400 text-xs font-medium">
                                                    Tidak ada data.
                                                </div>
                                            )}
                                        </div>
                                    </Scrollable>
                                </div>
                            )}

                            {error && (
                                <p className="text-[10px] text-rose-500 font-medium mt-1">
                                    {error.message}
                                </p>
                            )}
                        </div>
                    );
                }}
            />
        </div>
    );
}
