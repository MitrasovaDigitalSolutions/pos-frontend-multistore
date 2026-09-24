"use client";

import * as React from "react";
import {
    Calendar as CalendarIcon,
    ChevronDown as ChevronDownIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    X as XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface YearPickerProps {
    value?: number | string | null;
    onChange?: (year: number | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
    wrapperClassName?: string;
    error?: string;
    label?: string;
    clearable?: boolean;
    size?: "sm" | "md" | "lg";
    minYear?: number;
    maxYear?: number;
    showQuickCurrent?: boolean;
}

export const YearPicker = React.forwardRef<HTMLButtonElement, YearPickerProps>(
    (
        {
            value,
            onChange,
            placeholder = "Pilih Tahun...",
            disabled = false,
            className,
            buttonClassName,
            wrapperClassName,
            error,
            label,
            clearable = true,
            size = "sm",
            minYear = 2000,
            maxYear = 2040,
            showQuickCurrent = true,
            ...props
        },
        ref,
    ) => {
        const [open, setOpen] = React.useState(false);
        const currentYear = new Date().getFullYear();

        // Parse numerical year from value
        const selectedYear = React.useMemo(() => {
            if (value === undefined || value === null || value === "" || value === "all") {
                return null;
            }
            const num = Number(value);
            return Number.isInteger(num) && num > 0 ? num : null;
        }, [value]);

        // Base decade start year for the 12-year grid (e.g. 2024 -> 2020)
        const initialDecadeStart = selectedYear
            ? Math.floor(selectedYear / 12) * 12
            : Math.floor(currentYear / 12) * 12;

        const [decadeStart, setDecadeStart] = React.useState<number>(initialDecadeStart);

        // Reset decade view when popover opens or selectedYear changes
        React.useEffect(() => {
            if (open) {
                const target = selectedYear || currentYear;
                setDecadeStart(Math.floor(target / 12) * 12);
            }
        }, [open, selectedYear, currentYear]);

        const sizeClasses = {
            sm: "h-8 text-xs px-2.5",
            md: "h-9 text-xs px-3",
            lg: "h-10 text-sm px-3.5",
        }[size];

        const years = React.useMemo(() => {
            const list: number[] = [];
            for (let i = 0; i < 12; i++) {
                list.push(decadeStart + i);
            }
            return list;
        }, [decadeStart]);

        const handleSelectYear = (yr: number) => {
            onChange?.(yr);
            setOpen(false);
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange?.(null);
        };

        const handlePrevDecade = (e: React.MouseEvent) => {
            e.stopPropagation();
            setDecadeStart((prev) => Math.max(minYear - 11, prev - 12));
        };

        const handleNextDecade = (e: React.MouseEvent) => {
            e.stopPropagation();
            setDecadeStart((prev) => Math.min(maxYear, prev + 12));
        };

        return (
            <div className={cn("space-y-1.5 w-full", wrapperClassName || className)}>
                {label && (
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {label}
                    </label>
                )}

                <div className="relative w-full">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger
                            render={
                                <Button
                                    ref={ref}
                                    type="button"
                                    variant="outline"
                                    disabled={disabled}
                                    className={cn(
                                        "w-full justify-between font-normal border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg shadow-2xs transition-colors select-none",
                                        sizeClasses,
                                        !selectedYear && "text-muted-foreground",
                                        error && "border-destructive text-destructive",
                                        buttonClassName,
                                    )}
                                    {...props}
                                >
                                    <span className="flex items-center gap-1.5 truncate">
                                        <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                        <span className="truncate">
                                            {selectedYear ? `Tahun ${selectedYear}` : placeholder}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1 shrink-0 ml-1">
                                        {clearable && selectedYear && !disabled ? (
                                            <span
                                                role="button"
                                                tabIndex={0}
                                                onClick={handleClear}
                                                className="p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                                title="Hapus filter tahun"
                                            >
                                                <XIcon className="size-3" />
                                            </span>
                                        ) : (
                                            <ChevronDownIcon className="size-3 text-muted-foreground/60" />
                                        )}
                                    </span>
                                </Button>
                            }
                        />

                        <PopoverContent
                            className="w-52 p-2 rounded-xl shadow-md border-border bg-popover text-popover-foreground z-[100]"
                            align="start"
                        >
                            {/* Decade Navigation Header */}
                            <div className="flex items-center justify-between px-1 pb-1 mb-1 border-b border-border/60">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={handlePrevDecade}
                                    className="size-6 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                                    aria-label="Dekade Sebelumnya"
                                >
                                    <ChevronLeftIcon className="size-3.5" />
                                </Button>
                                <span className="text-xs font-semibold text-foreground tracking-tight select-none">
                                    {decadeStart} – {decadeStart + 11}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={handleNextDecade}
                                    className="size-6 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                                    aria-label="Dekade Berikutnya"
                                >
                                    <ChevronRightIcon className="size-3.5" />
                                </Button>
                            </div>

                            {/* 12-Year Grid (3 cols x 4 rows) */}
                            <div className="grid grid-cols-3 gap-1 py-0.5">
                                {years.map((yr) => {
                                    const isSelected = selectedYear === yr;
                                    const isCurrent = currentYear === yr;
                                    const isOutOfRange = yr < minYear || yr > maxYear;

                                    return (
                                        <Button
                                            key={yr}
                                            type="button"
                                            variant={isSelected ? "default" : "ghost"}
                                            size="sm"
                                            disabled={isOutOfRange}
                                            onClick={() => handleSelectYear(yr)}
                                            className={cn(
                                                "h-7 text-xs font-medium rounded-md px-1 transition-all select-none",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90"
                                                    : isCurrent
                                                      ? "border border-primary/50 text-primary font-semibold hover:bg-accent"
                                                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                                                isOutOfRange && "opacity-30 pointer-events-none",
                                            )}
                                        >
                                            {yr}
                                        </Button>
                                    );
                                })}
                            </div>

                            {/* Quick Action Footer */}
                            <div className="mt-1.5 pt-1 border-t border-border/60 flex items-center justify-between text-[11px] px-1">
                                {showQuickCurrent && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelectYear(currentYear)}
                                        className="text-[11px] font-medium text-primary hover:underline cursor-pointer select-none"
                                    >
                                        Tahun Ini ({currentYear})
                                    </button>
                                )}
                                {selectedYear && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange?.(null);
                                            setOpen(false);
                                        }}
                                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground hover:underline cursor-pointer select-none ml-auto"
                                    >
                                        Semua
                                    </button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {error && (
                    <p className="text-[10px] text-destructive font-medium">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

YearPicker.displayName = "YearPicker";
