"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues, type FieldError, type FieldErrors } from "react-hook-form";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

interface FormMultiSelectProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string;
    options: MultiSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    isLoading?: boolean;
    onChange?: (value: string[]) => void;
    className?: string;
    wrapperClassName?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
}

export function FormMultiSelect<T extends FieldValues>({
    name,
    label,
    options,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    isLoading,
    onChange,
    className,
    wrapperClassName,
    disabled,
    size = 'md',
}: FormMultiSelectProps<T>) {
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
        <div className={cn("space-y-1.5", wrapperClassName)}>
            {label && (
                <label
                    htmlFor={name}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                    {label}
                </label>
            )}
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <MultiSelect
                        options={options}
                        value={Array.isArray(field.value) ? field.value : []}
                        onChange={(val) => {
                            field.onChange(val);
                            if (onChange) {
                                onChange(val);
                            }
                        }}
                        placeholder={placeholder}
                        searchPlaceholder={searchPlaceholder}
                        emptyMessage={emptyMessage}
                        isLoading={isLoading}
                        className={cn(
                            error && "border-rose-400 focus:border-rose-400 focus:ring-rose-500/20",
                            className
                        )}
                        disabled={disabled}
                        size={size}
                    />
                )}
            />
            {error && (
                <p className="text-[10px] text-rose-500 font-medium">
                    {error.message}
                </p>
            )}
        </div>
    );
}
