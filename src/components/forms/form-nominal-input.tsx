"use client";

import {
    useFormContext,
    type FieldPath,
    type FieldValues,
    Controller,
    type FieldError,
    type FieldErrors,
} from "react-hook-form";
import { NominalInput } from "@/components/ui/nominal-input";
import React from "react";

interface FormNominalInputProps<T extends FieldValues>
    extends Omit<
        React.ComponentProps<typeof NominalInput>,
        "name" | "value" | "onChange" | "isError"
    > {
    name: FieldPath<T>;
    label?: string;
    onValueChange?: (val: number | null) => void;
    inputRef?: React.Ref<HTMLInputElement>;
}

export function FormNominalInput<T extends FieldValues>({
    name,
    label,
    className,
    disabled,
    onValueChange,
    inputRef,
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

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <div className="space-y-1.5">
                    {label && (
                        <label
                            htmlFor={name}
                            className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                        >
                            {label}
                        </label>
                    )}
                    <NominalInput
                        id={name}
                        name={name}
                        value={value}
                        inputRef={inputRef}
                        onValueChange={(val) => {
                            onChange(val);
                            onValueChange?.(val);
                        }}
                        disabled={disabled}
                        isError={!!error}
                        className={className}
                        {...props}
                    />
                    {error && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {error.message as string}
                        </p>
                    )}
                </div>
            )}
        />
    );
}
