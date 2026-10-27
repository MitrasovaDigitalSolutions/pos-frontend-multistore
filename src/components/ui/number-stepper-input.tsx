"use client";

import * as React from "react";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { NumberInput } from "@/components/ui/number-input";
import { cn } from "@/lib/utils";

export interface NumberStepperInputProps {
    value: number | null | undefined;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    allowDecimal?: boolean;
    allowNegative?: boolean;
    disabled?: boolean;
    className?: string;
    inputClassName?: string;
    buttonClassName?: string;
    size?: "sm" | "md" | "lg";
    id?: string;
    name?: string;
    placeholder?: string;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    "aria-label"?: string;
}

export const NumberStepperInput = React.forwardRef<HTMLInputElement, NumberStepperInputProps>(
    (
        {
            value,
            onChange,
            min = 0,
            max,
            step = 1,
            allowDecimal = true,
            allowNegative = false,
            disabled = false,
            className,
            inputClassName,
            buttonClassName,
            size = "sm",
            id,
            name,
            placeholder,
            onBlur,
            onKeyDown,
            "aria-label": ariaLabel,
        },
        ref
    ) => {
        const numericValue = value === null || value === undefined ? (min ?? 0) : Number(value);

        const handleIncrement = () => {
            if (disabled) return;
            const current = Number.isNaN(numericValue) ? (min ?? 0) : numericValue;
            let next = allowDecimal
                ? Number((current + step).toFixed(4))
                : current + step;

            if (max !== undefined && next > max) {
                next = max;
            }
            if (next === numericValue) return;
            onChange(next);
        };

        const handleDecrement = () => {
            if (disabled) return;
            const current = Number.isNaN(numericValue) ? (min ?? 0) : numericValue;
            let next = allowDecimal
                ? Number((current - step).toFixed(4))
                : current - step;

            if (min !== undefined && next < min) {
                next = min;
            }
            if (next === numericValue) return;
            onChange(next);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                handleIncrement();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                handleDecrement();
            }
            onKeyDown?.(e);
        };

        const isMinusDisabled = disabled || (min !== undefined && numericValue <= min);
        const isPlusDisabled = disabled || (max !== undefined && numericValue >= max);

        // Sizing styles
        const sizeConfig = {
            sm: {
                container: "h-7",
                button: "w-7 h-7",
                icon: 13,
                input: "w-14 h-7 text-xs px-1",
            },
            md: {
                container: "h-8",
                button: "w-8 h-8",
                icon: 14,
                input: "w-16 h-8 text-xs sm:text-sm px-1.5",
            },
            lg: {
                container: "h-9.5",
                button: "w-9.5 h-9.5",
                icon: 16,
                input: "w-20 h-9.5 text-sm sm:text-base px-2",
            },
        }[size];

        return (
            <div
                className={cn(
                    "inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-2xs transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 select-none",
                    sizeConfig.container,
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
            >
                {/* Minus Button */}
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={isMinusDisabled}
                    title="Kurangi kuantitas"
                    className={cn(
                        "flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 border-none bg-transparent outline-none",
                        sizeConfig.button,
                        buttonClassName
                    )}
                >
                    <IconMinus size={sizeConfig.icon} />
                </button>

                {/* Base Reusable NumberInput */}
                <NumberInput
                    ref={ref}
                    id={id}
                    name={name}
                    value={value === null || value === undefined ? null : Number(value)}
                    onChange={(val) => {
                        onChange(val ?? (min ?? 0));
                    }}
                    min={min}
                    max={max}
                    allowDecimal={allowDecimal}
                    allowNegative={allowNegative}
                    disabled={disabled}
                    onBlur={onBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    className={cn(
                        "rounded-none border-y-0 border-x border-slate-200 dark:border-slate-700 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200 dark:focus-visible:border-slate-700 text-center font-bold font-mono bg-transparent",
                        sizeConfig.input,
                        inputClassName
                    )}
                />

                {/* Plus Button */}
                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={isPlusDisabled}
                    title="Tambah kuantitas"
                    className={cn(
                        "flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 border-none bg-transparent outline-none",
                        sizeConfig.button,
                        buttonClassName
                    )}
                >
                    <IconPlus size={sizeConfig.icon} />
                </button>
            </div>
        );
    }
);

NumberStepperInput.displayName = "NumberStepperInput";
