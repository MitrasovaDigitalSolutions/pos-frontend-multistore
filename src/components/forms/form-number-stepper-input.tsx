"use client";

import React from "react";
import {
    Controller,
    useFormContext,
    type FieldPath,
    type FieldValues,
    type FieldError,
    type FieldErrors,
} from "react-hook-form";
import { NumberStepperInput, type NumberStepperInputProps } from "@/components/ui/number-stepper-input";
import { cn } from "@/lib/utils";

export interface FormNumberStepperInputProps<T extends FieldValues>
    extends Omit<NumberStepperInputProps, "value" | "onChange" | "name" | "id"> {
    name: FieldPath<T>;
    label?: React.ReactNode;
    helperText?: React.ReactNode;
    onValueChange?: (val: number | null) => void;
}

export function FormNumberStepperInput<T extends FieldValues>({
    name,
    label,
    helperText,
    className,
    disabled,
    onValueChange,
    onBlur,
    ...props
}: FormNumberStepperInputProps<T>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    // Helper to resolve nested errors, e.g. "ingredients.0.kuantitas" -> errors.ingredients[0].kuantitas
    const getNestedValue = (
        obj: FieldErrors<T>,
        path: string
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
                const numericValue = typeof value === "number" ? value : Number(value) || 0;

                return (
                    <div className="space-y-1">
                        {label && (
                            <label
                                htmlFor={name}
                                className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                            >
                                {label}
                            </label>
                        )}
                        <NumberStepperInput
                            ref={ref}
                            id={name}
                            name={name}
                            value={numericValue}
                            onChange={(val) => {
                                onChange(val);
                                onValueChange?.(val);
                            }}
                            onBlur={onBlur}
                            disabled={disabled}
                            className={cn(
                                error && "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/20",
                                className
                            )}
                            {...props}
                        />
                        {helperText && !error && (
                            <div className="mt-0.5">{helperText}</div>
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
