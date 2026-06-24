"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues, type FieldError, type FieldErrors } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";

interface FormDatePickerProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    clearable?: boolean;
    size?: "sm" | "md" | "lg";
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
    startMonth?: Date;
    endMonth?: Date;
    reverseYears?: boolean;
}

export function FormDatePicker<T extends FieldValues>({
    name,
    label,
    placeholder,
    disabled = false,
    className,
    clearable = true,
    size = "md",
    captionLayout,
    startMonth,
    endMonth,
    reverseYears,
}: FormDatePickerProps<T>) {
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
                <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={className}
                    error={error?.message}
                    label={label}
                    clearable={clearable}
                    size={size}
                    captionLayout={captionLayout}
                    startMonth={startMonth}
                    endMonth={endMonth}
                    reverseYears={reverseYears}
                />
            )}
        />
    );
}
