"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues } from "react-hook-form";
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
    className?: string;
    wrapperClassName?: string;
    disabled?: boolean;
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
    className,
    wrapperClassName,
    disabled,
}: FormSelectProps<T>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    // Helper to resolve nested errors, e.g. "items.0.product_id" -> errors.items[0].product_id
    const getNestedValue = (obj: any, path: string) => {
        return path
            .split(/[.[\]]+/)
            .filter(Boolean)
            .reduce((prev, curr) => prev?.[curr], obj);
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
                    />
                )}
            />
            {error && (
                <p className="text-[10px] text-rose-500 font-medium">
                    {error.message as string}
                </p>
            )}
        </div>
    );
}
