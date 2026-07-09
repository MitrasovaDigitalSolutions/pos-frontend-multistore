"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FormSwitchProps<T extends FieldValues> {
    name: FieldPath<T>;
    label: string;
    description?: string;
    className?: string;
    disabled?: boolean;
}

export function FormSwitch<T extends FieldValues>({
    name,
    label,
    description,
    className,
    disabled,
}: FormSwitchProps<T>) {
    const { control } = useFormContext<T>();

    return (
        <div className={cn(
            "flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100",
            className
        )}>
            <div className="space-y-0.5 pr-4">
                <label
                    htmlFor={`switch-${name}`}
                    className="text-xs font-bold text-slate-800 cursor-pointer select-none block"
                >
                    {label}
                </label>
                {description && (
                    <p className="text-[10px] text-slate-400 leading-snug">
                        {description}
                    </p>
                )}
            </div>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                        id={`switch-${name}`}
                    />
                )}
            />
        </div>
    );
}
