"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
        return (
            <label
                className={cn(
                    "relative inline-flex items-center justify-center h-4 w-4 shrink-0 rounded border cursor-pointer select-none transition-all duration-150",
                    checked
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400",
                    disabled && "opacity-40 cursor-not-allowed",
                    className
                )}
            >
                <input
                    type="checkbox"
                    ref={ref}
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    className="sr-only"
                    {...props}
                />
                {checked && <Check className="h-3 w-3 stroke-[3]" />}
            </label>
        );
    }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
