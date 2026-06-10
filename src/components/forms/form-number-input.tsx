/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Controller,
    useFormContext,
    type FieldPath,
    type FieldValues,
    type FieldError,
    type FieldErrors,
} from "react-hook-form";

interface FormNumberInputProps<T extends FieldValues> extends Omit<
    React.ComponentProps<typeof Input>,
    "name" | "value" | "onChange"
> {
    name: FieldPath<T>;
    label?: string;
    helperText?: React.ReactNode;
    allowNegative?: boolean;
}

export function FormNumberInput<T extends FieldValues>({
    name,
    label,
    helperText,
    allowNegative = false,
    className,
    disabled,
    ...props
}: FormNumberInputProps<T>) {
    const {
        control,
        watch,
        formState: { errors },
    } = useFormContext<T>();

    // Helper to resolve nested errors, e.g. "items.0.product_id" -> errors.items[0].product_id
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
    const value = watch(name);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    const [localValue, setLocalValue] = useState<string>("");

    // Format helper: converting JS number (or string) to Indonesian display (dot thousands, comma decimals)
    const formatNumber = (val: string | number | null | undefined): string => {
        if (val === null || val === undefined || val === "") return "";

        let str = String(val);
        const isNegative = allowNegative && str.startsWith("-");

        if (isNegative) {
            str = str.substring(1);
        }

        // Convert input JS number (e.g. 10900.85) to display string format with comma for decimal
        str = str.replace(/\./g, ",");

        const parts = str.split(",");
        const integerPart = parts[0].replace(/\D/g, "");
        const formattedInteger = integerPart ? new Intl.NumberFormat("id-ID").format(Number(integerPart)) : "";

        let formattedResult = formattedInteger;
        if (parts.length > 1) {
            const decimalPart = parts[1].replace(/\D/g, "");
            formattedResult = `${formattedInteger},${decimalPart}`;
        }

        return isNegative ? `-${formattedResult}` : formattedResult;
    };

    // Parse helper: converting Indonesian display value back to standard JavaScript float/int
    const parseNumber = (val: string): number | null => {
        if (!val) return null;

        const isNegative = allowNegative && val.startsWith("-");
        let clean = val;
        if (isNegative) {
            clean = clean.substring(1);
        }

        // Remove dot (thousands) and change comma to dot (decimals)
        clean = clean.replace(/\./g, "").replace(/,/g, ".");

        const parts = clean.split(".");
        const integerPart = parts[0].replace(/\D/g, "");
        let num: number;
        if (parts.length > 1) {
            const decimalPart = parts[1].replace(/\D/g, "");
            const combined = `${integerPart}.${decimalPart}`;
            num = parseFloat(combined);
        } else {
            num = parseInt(integerPart, 10);
        }

        if (isNaN(num)) return null;
        return isNegative ? -num : num;
    };

    // Sync local value with external changes in react-hook-form value
    useEffect(() => {
        const parsedLocal = parseNumber(localValue);
        const parsedVal = value !== null && value !== undefined && value !== "" ? Number(value) : null;
        if (parsedLocal !== parsedVal) {
            setLocalValue(formatNumber(value));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Restore cursor position after formatting state updates
    useLayoutEffect(() => {
        if (inputRef.current && cursorPosition !== null) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
            setCursorPosition(null);
        }
    }, [cursorPosition]);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, ref } }) => {
                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = e.target;
                    let rawValue = input.value;
                    const selectionStart = input.selectionStart || 0;

                    // If user cleared the input
                    if (rawValue === "") {
                        setLocalValue("");
                        onChange(null);
                        return;
                    }

                    // Strip any minus sign if allowNegative is false
                    if (!allowNegative) {
                        rawValue = rawValue.replace(/-/g, "");
                    } else {
                        // If allowNegative is true, only allow a single minus sign at the very beginning
                        if (rawValue.includes("-")) {
                            const startsWithMinus = rawValue.startsWith("-");
                            const rest = rawValue.replace(/-/g, "");
                            rawValue = startsWithMinus ? `-${rest}` : rest;
                        }
                    }

                    // Convert typed dot '.' into comma ',' for decimal parsing
                    if (selectionStart > 0 && rawValue[selectionStart - 1] === ".") {
                        rawValue = rawValue.substring(0, selectionStart - 1) + "," + rawValue.substring(selectionStart);
                    }

                    // Standardize digits and separator
                    const parsed = parseNumber(rawValue);

                    // Count "content characters" (digits, commas, and minus) before cursor to adjust cursor selection
                    const contentBeforeCursor = rawValue
                        .substring(0, selectionStart)
                        .replace(/[^0-9,-]/g, "").length;

                    // Generate new display value
                    const newFormatted = formatNumber(rawValue.replace(/\./g, ""));
                    setLocalValue(newFormatted);

                    // Call the RHF field onChange with the raw numeric parsed float/int
                    onChange(parsed);

                    // Recalculate new selection/cursor position
                    let newSelectionStart = 0;
                    let contentCount = 0;
                    for (let i = 0; i < newFormatted.length; i++) {
                        if (contentCount === contentBeforeCursor) {
                            break;
                        }
                        if (/[0-9,-]/.test(newFormatted[i])) {
                            contentCount++;
                        }
                        newSelectionStart = i + 1;
                    }

                    setCursorPosition(newSelectionStart);
                };

                return (
                    <div className="space-y-1.5">
                        {label && (
                            <label
                                htmlFor={name}
                                className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                            >
                                {label}
                            </label>
                        )}
                        <Input
                            id={name}
                            ref={(node) => {
                                ref(node);
                                inputRef.current = node;
                            }}
                            type="text"
                            value={localValue}
                            onChange={handleChange}
                            disabled={disabled}
                            className={cn(
                                "h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
                                error && "border-rose-400 focus-visible:ring-rose-500",
                                className,
                            )}
                            aria-invalid={!!error}
                            {...props}
                        />
                        {helperText && !error && (
                            <div className="mt-0.5">
                                {helperText}
                            </div>
                        )}
                        {error && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {error.message as string}
                            </p>
                        )}
                    </div>
                );
            }}
        />
    );
}
