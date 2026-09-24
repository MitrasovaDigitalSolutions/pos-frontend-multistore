"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues, type FieldError, type FieldErrors } from "react-hook-form";
import { YearPicker } from "@/components/ui/year-picker";

export interface FormYearPickerProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
    wrapperClassName?: string;
    clearable?: boolean;
    size?: "sm" | "md" | "lg";
    minYear?: number;
    maxYear?: number;
    showQuickCurrent?: boolean;
    onChange?: (year: number | null) => void;
}

export function FormYearPicker<T extends FieldValues>({
    name,
    label,
    placeholder = "Semua Tahun",
    disabled = false,
    className,
    buttonClassName,
    wrapperClassName,
    clearable = true,
    size = "sm",
    minYear,
    maxYear,
    showQuickCurrent = true,
    onChange: customOnChange,
}: FormYearPickerProps<T>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

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
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <YearPicker
                    value={field.value}
                    onChange={(val) => {
                        field.onChange(val);
                        customOnChange?.(val);
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={className}
                    buttonClassName={buttonClassName}
                    wrapperClassName={wrapperClassName}
                    error={error?.message}
                    label={label}
                    clearable={clearable}
                    size={size}
                    minYear={minYear}
                    maxYear={maxYear}
                    showQuickCurrent={showQuickCurrent}
                />
            )}
        />
    );
}
