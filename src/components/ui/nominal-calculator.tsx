"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import {
    IconCalculator,
    IconCheck,
    IconBackspace,
    IconX,
} from "@tabler/icons-react";

/**
 * Safely evaluates simple math expressions:
 * Supports +, -, *, /, x, X, parentheses, and Indonesian thousand separators.
 * Returns null if invalid or incomplete.
 */
export function safeEvaluateMathExpression(input: string): number | null {
    if (!input || !input.trim()) return null;

    let sanitized = input
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/[xX]/g, "*")
        .replace(/\s+/g, "");

    // Strip thousand separator dots (e.g. 1.000 or 1.000.000)
    sanitized = sanitized.replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2");
    sanitized = sanitized.replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2");

    // Replace comma with dot for decimals (e.g. 1,5 -> 1.5)
    sanitized = sanitized.replace(/,/g, ".");

    // Strict whitelist: only digits, +, -, *, /, (, ), and dot
    if (!/^[\d+\-*/().]+$/.test(sanitized)) {
        return null;
    }

    try {
        // Evaluate strictly validated math string
        const result = new Function(`"use strict"; return (${sanitized});`)();
        if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
            return Math.round(result * 100) / 100;
        }
        return null;
    } catch {
        return null;
    }
}

export interface NominalCalculatorProps {
    value?: number | null;
    onApply: (val: number) => void;
    disabled?: boolean;
    className?: string;
    align?: "start" | "center" | "end";
    side?: "top" | "bottom" | "left" | "right";
}

export function NominalCalculator({
    value,
    onApply,
    disabled = false,
    className,
    align = "end",
    side = "bottom",
}: NominalCalculatorProps) {
    const [open, setOpen] = useState(false);
    const [expression, setExpression] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            setExpression(value ? String(value) : "");
        }
    };

    // Focus and select input on open
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Real-time evaluation
    const calculatedResult = useMemo(() => {
        return safeEvaluateMathExpression(expression);
    }, [expression]);

    const handleApply = () => {
        if (calculatedResult !== null) {
            onApply(calculatedResult);
            setOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleApply();
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
        }
    };

    const appendCharacter = (char: string) => {
        setExpression((prev) => prev + char);
        inputRef.current?.focus();
    };

    const handleBackspace = () => {
        setExpression((prev) => prev.slice(0, -1));
        inputRef.current?.focus();
    };

    const handleClear = () => {
        setExpression("");
        inputRef.current?.focus();
    };

    if (disabled) return null;

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
                type="button"
                tabIndex={-1}
                title="Buka Kalkulator Hitung Cepat"
                className={cn(
                    "flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg p-1 transition-colors cursor-pointer shrink-0",
                    open && "text-emerald-600 bg-emerald-50",
                    className
                )}
            >
                <IconCalculator size={15} />
            </PopoverTrigger>

            <PopoverContent
                align={align}
                side={side}
                className="w-72 sm:w-80 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xl space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                            <IconCalculator size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                            Kalkulator Cepat
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                        <IconX size={14} />
                    </button>
                </div>

                {/* Expression Input & Live Result Display */}
                <div className="space-y-1.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <input
                        ref={inputRef}
                        type="text"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik rumus: 1000000 + 500000..."
                        className="w-full bg-transparent text-xs font-mono font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none border-b border-slate-200 pb-1"
                    />

                    <div className="flex items-center justify-between pt-0.5 min-h-[22px]">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            Hasil:
                        </span>
                        <span
                            className={cn(
                                "font-mono font-extrabold text-xs transition-colors",
                                calculatedResult !== null
                                    ? "text-emerald-700 font-bold"
                                    : expression
                                        ? "text-slate-400"
                                        : "text-slate-300"
                            )}
                        >
                            {calculatedResult !== null
                                ? formatRupiah(calculatedResult)
                                : expression
                                    ? "Menghitung..."
                                    : "Rp 0"}
                        </span>
                    </div>
                </div>

                {/* Compact Keypad */}
                <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                    {/* Row 1 */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleClear}
                        className="h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center font-bold cursor-pointer"
                    >
                        C
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("(")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        (
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter(")")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        )
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter(" / ")}
                        className="h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center font-bold cursor-pointer"
                    >
                        ÷
                    </button>

                    {/* Row 2 */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("7")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        7
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("8")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        8
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("9")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        9
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter(" * ")}
                        className="h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center font-bold cursor-pointer"
                    >
                        ×
                    </button>

                    {/* Row 3 */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("4")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        4
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("5")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        5
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("6")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        6
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter(" - ")}
                        className="h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center font-bold cursor-pointer"
                    >
                        -
                    </button>

                    {/* Row 4 */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("1")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        1
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("2")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        2
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("3")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        3
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter(" + ")}
                        className="h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center font-bold cursor-pointer"
                    >
                        +
                    </button>

                    {/* Row 5 */}
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("0")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                        0
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter("000")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-mono text-[11px]"
                    >
                        000
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => appendCharacter(".")}
                        className="h-8 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer font-bold"
                    >
                        .
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleBackspace}
                        title="Hapus Karakter Terakhir"
                        className="h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                        <IconBackspace size={15} />
                    </button>
                </div>

                {/* Footer Apply Button */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="flex-1 h-8 text-xs rounded-xl cursor-pointer border-slate-200"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleApply}
                        disabled={calculatedResult === null}
                        className="flex-1 h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20"
                    >
                        <IconCheck size={14} />
                        <span>Terapkan</span>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
