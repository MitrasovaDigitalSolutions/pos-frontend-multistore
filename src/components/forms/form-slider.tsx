"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FormSliderProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: React.ReactNode;
    min?: number;
    max?: number;
    step?: number;
    ticks?: number[];
    className?: string;
    disabled?: boolean;
}

export function FormSlider<T extends FieldValues>({
    name,
    label,
    min = 0,
    max = 100,
    step = 1,
    ticks,
    className,
    disabled,
}: FormSliderProps<T>) {
    const { control } = useFormContext<T>();

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    {label}
                </div>
            )}
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <div className="space-y-1">
                        <Slider
                            value={typeof field.value === "number" ? field.value : min}
                            onValueChange={field.onChange}
                            min={min}
                            max={max}
                            step={step}
                            disabled={disabled}
                        />
                        {ticks && ticks.length > 0 && (
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                {ticks.map((t) => (
                                    <span key={t}>{t}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    );
}
