"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues, type FieldError, type FieldErrors } from "react-hook-form";
import { RadioChips, type RadioChipOption, type RadioChipsProps } from "@/components/ui/radio-chips";
import { cn } from "@/lib/utils";

export interface FormRadioChipsProps<T extends FieldValues>
    extends Omit<RadioChipsProps, "value" | "onChange"> {
    name: FieldPath<T>;
    onChange?: (value: string) => void;
}

export function FormRadioChips<T extends FieldValues>({
    name,
    label,
    options,
    onChange,
    variant = "segmented",
    size = "sm",
    className,
    wrapperClassName,
    disabled,
    columns,
}: FormRadioChipsProps<T>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    const getNestedError = (
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

    const error = getNestedError(errors, name);

    return (
        <div className={cn("space-y-1.5 w-full", wrapperClassName)}>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <RadioChips
                        options={options}
                        value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                        onChange={(val) => {
                            field.onChange(val);
                            if (onChange) {
                                onChange(val);
                            }
                        }}
                        label={label}
                        disabled={disabled}
                        variant={variant}
                        size={size}
                        columns={columns}
                        className={className}
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
export type { RadioChipOption };
