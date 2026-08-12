"use client";

import { useCallback } from "react";
import {
    useFormContext,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps<T extends FieldValues> extends Omit<
    React.ComponentProps<typeof Input>,
    "name"
> {
    name: FieldPath<T>;
    label?: string;
    inputRef?: React.Ref<HTMLInputElement>;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
    if (typeof ref === "function") {
        ref(value);
    } else if (ref && typeof ref === "object" && "current" in ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
    }
}

export function FormInput<T extends FieldValues>({
    name,
    label,
    className,
    required,
    inputRef,
    ...props
}: FormInputProps<T>) {
    const {
        register,
        formState: { errors },
    } = useFormContext<T>();

    const error = errors[name];
    const { ref: registerRef, ...registerProps } = register(name);

    const handleRef = useCallback(
        (node: HTMLInputElement | null) => {
            registerRef(node);
            setRef(inputRef, node);
        },
        [registerRef, inputRef]
    );

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={name}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                    {label}
                    {required && <span className="text-rose-500"> *</span>}
                </label>
            )}
            <Input
                id={name}
                ref={handleRef}
                {...registerProps}
                className={cn(
                    "h-10 text-xs bg-white border-slate-200 focus-visible:ring-emerald-600 rounded-xl",
                    error && "border-rose-400 focus-visible:ring-rose-500",
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
