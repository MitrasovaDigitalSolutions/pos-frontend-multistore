"use client";

import {
    useFormContext,
    type FieldPath,
    type FieldValues,
    Controller,
    type FieldError,
    type FieldErrors,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useLayoutEffect, useRef, useState } from "react";

interface FormNominalInputProps<T extends FieldValues> extends Omit<
    React.ComponentProps<typeof Input>,
    "name" | "value" | "onChange"
> {
    name: FieldPath<T>;
    label?: string;
    onValueChange?: (val: number | null) => void;
}

export function FormNominalInput<T extends FieldValues>({
    name,
    label,
    className,
    disabled,
    onValueChange,
    ...props
}: FormNominalInputProps<T>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    // Helper to resolve nested errors, e.g. "items.0.product_uid" -> errors.items[0].product_uid
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
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);

    // Format number with Indonesian separator (dot)
    const formatNumber = (val: string | number | null | undefined): string => {
        if (val === null || val === undefined || val === "") return "";
        // Clean everything except digits
        const numStr = String(val).replace(/\D/g, "");
        if (!numStr) return "";
        return new Intl.NumberFormat("id-ID").format(Number(numStr));
    };

    // Keep track and restore cursor position after formatting state updates
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
            render={({ field: { onChange, value, ref } }) => {
                const displayValue = formatNumber(value);

                const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = e.target;
                    const rawValue = input.value;

                    // Allow deleting/clearing
                    if (rawValue === "") {
                        onChange(null);
                        onValueChange?.(null);
                        return;
                    }

                    const cleanValue = rawValue.replace(/\D/g, "");

                    // Capture cursor position details
                    const selectionStart = input.selectionStart || 0;
                    const digitsBeforeCursor = rawValue
                        .substring(0, selectionStart)
                        .replace(/\D/g, "").length;

                    // Compute what the formatted value will be to determine new cursor position
                    const newFormatted = formatNumber(cleanValue);

                    let newSelectionStart = 0;
                    let digitsCount = 0;
                    for (let i = 0; i < newFormatted.length; i++) {
                        if (digitsCount === digitsBeforeCursor) {
                            break;
                        }
                        if (/\d/.test(newFormatted[i])) {
                            digitsCount++;
                        }
                        newSelectionStart = i + 1;
                    }

                    const parsed = cleanValue === "" ? null : Number(cleanValue);
                    onChange(parsed);
                    onValueChange?.(parsed);

                    // Schedule cursor positioning
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
                            value={displayValue}
                            onChange={handleChange}
                            disabled={disabled}
                            className={cn(
                                "h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl",
                                error && "border-rose-400 focus-visible:ring-rose-500",
                                className,
                            )}
                            aria-invalid={!!error}
                            {...props}
                        />
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
