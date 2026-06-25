"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues, type FieldError, type FieldErrors } from "react-hook-form";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { cn } from "@/lib/utils";

interface FormSelectProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string;
    options: CommandOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    isLoading?: boolean;
    onSearchChange?: (search: string) => void;
    onChange?: (value: string) => void;
    className?: string;
    wrapperClassName?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    maxLabelLength?: number;
}

export function FormSelect<T extends FieldValues>({
    name,
    label,
    options,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    isLoading,
    onSearchChange,
    onChange,
    className,
    wrapperClassName,
    disabled,
    size = 'md',
    maxLabelLength,
}: FormSelectProps<T>) {
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
                    <CommandSelect
                        options={options}
                        value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                        onChange={(val) => {
                            const originalValue = field.value;
                            if (typeof originalValue === "number") {
                                field.onChange(val === "" ? "" : Number(val));
                            } else {
                                field.onChange(val);
                            }
                            if (onChange) {
                                onChange(val);
                            }
                        }}
                        placeholder={placeholder}
                        searchPlaceholder={searchPlaceholder}
                        emptyMessage={emptyMessage}
                        isLoading={isLoading}
                        onSearchChange={onSearchChange}
                        className={cn(
                            error && "border-rose-400 focus:border-rose-400 focus:ring-rose-500/20",
                            className
                        )}
                        disabled={disabled}
                        size={size}
                        maxLabelLength={maxLabelLength}
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
