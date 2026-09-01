"use client";

import { Controller, useFormContext } from "react-hook-form";
import { CoaPickerTrigger } from "./coa-picker-trigger";
import { useFlatChartOfAccounts } from "../../api/coa-api";
import type { ChartOfAccount, ChartOfAccountType } from "../../types";
import { cn } from "@/lib/utils";

export interface FormCoaPickerProps {
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    dialogTitle?: string;
    allowedTypes?: ChartOfAccountType[];
    excludeUid?: string | null;
    accounts?: ChartOfAccount[];
    disabled?: boolean;
    allowClear?: boolean;
    required?: boolean;
    size?: "sm" | "md";
    className?: string;
    wrapperClassName?: string;
}

export function FormCoaPicker({
    name,
    label,
    description,
    placeholder = "Pilih Akun (CoA)...",
    dialogTitle,
    allowedTypes,
    excludeUid,
    accounts: passedAccounts,
    disabled = false,
    allowClear = true,
    required = false,
    size = "sm",
    className,
    wrapperClassName,
}: FormCoaPickerProps) {
    const { control } = useFormContext();
    const { data: fetchedAccounts = [], isLoading } = useFlatChartOfAccounts();

    const accounts = passedAccounts || fetchedAccounts;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <div className={cn("space-y-1.5", wrapperClassName)}>
                    {label && (
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                            <span>
                                {label} {required && <span className="text-rose-500">*</span>}
                            </span>
                        </label>
                    )}

                    <CoaPickerTrigger
                        value={field.value || ""}
                        onChange={(val) => field.onChange(val || null)}
                        accounts={accounts}
                        allowedTypes={allowedTypes}
                        excludeUid={excludeUid}
                        placeholder={isLoading ? "Memuat akun..." : placeholder}
                        dialogTitle={dialogTitle || label || "Pilih Akun CoA"}
                        disabled={disabled || isLoading}
                        allowClear={allowClear}
                        size={size}
                        className={cn(error && "border-rose-500 focus:ring-rose-500", className)}
                    />

                    {description && !error && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    )}

                    {error && (
                        <p className="text-[11px] font-medium text-rose-500">
                            {error.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
}
