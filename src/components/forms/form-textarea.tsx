"use client";

import {
    useFormContext,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormTextareaProps<T extends FieldValues> extends Omit<
    React.ComponentProps<"textarea">,
    "name"
> {
    name: FieldPath<T>;
    label?: string;
}

export function FormTextarea<T extends FieldValues>({
    name,
    label,
    className,
    ...props
}: FormTextareaProps<T>) {
    const {
        register,
        formState: { errors },
    } = useFormContext<T>();

    const error = errors[name];

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={name}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                    {label}
                </label>
            )}
            <textarea
                id={name}
                {...register(name)}
                className={cn(
                    "w-full min-h-20 p-3 border border-slate-200 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none",
                    error && "border-rose-400 focus:ring-rose-500",
                    className,
                )}
                aria-invalid={!!error}
                {...props}
            />
            {error && (
                <p className="text-[10px] text-rose-500 font-medium">
                    {error.message as string}
                </p>
            )}
        </div>
    );
}
