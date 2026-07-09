"use client";

import { NumberInput } from "@/components/ui/number-input";
import { cn } from "@/lib/utils";
import React from "react";
import {
    Controller,
    useFormContext,
    type FieldPath,
    type FieldValues,
    type FieldError,
    type FieldErrors,
} from "react-hook-form";

interface FormNumberInputProps<T extends FieldValues> extends Omit<
    React.ComponentProps<typeof NumberInput>,
    "name" | "value" | "onChange"
> {
    name: FieldPath<T>;
    label?: React.ReactNode;
    helperText?: React.ReactNode;
    onValueChange?: (val: number | null) => void;
}

export function FormNumberInput<T extends FieldValues>({
    name,
    label,
    helperText,
    className,
    disabled,
    onValueChange,
    onBlur,
    ...props
}: FormNumberInputProps<T>) {
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

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value, ref } }) => {
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
                        <NumberInput
                            id={name}
                            ref={ref}
                            value={value}
                            onChange={(val) => {
                                onChange(val);
                                onValueChange?.(val);
                            }}
                            onBlur={onBlur}
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
