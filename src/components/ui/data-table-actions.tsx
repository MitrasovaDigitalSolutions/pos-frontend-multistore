"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type DataTableActionVariant =
    | "emerald"
    | "amber"
    | "rose"
    | "sky"
    | "indigo"
    | "slate"
    | "solidEmerald"
    | "solidRose";

const ACTION_VARIANT_CLASSES: Record<DataTableActionVariant, string> = {
    emerald:
        "text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:shadow-emerald-500/20",
    solidEmerald:
        "text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 shadow-2xs hover:shadow-emerald-500/20 font-bold",
    amber:
        "text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-500 hover:border-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-amber-500/20",
    rose:
        "text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-600 hover:border-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white hover:shadow-rose-500/20",
    solidRose:
        "text-white bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700 shadow-2xs hover:shadow-rose-500/20 font-bold",
    sky:
        "text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 border-sky-200/80 dark:border-sky-900/60 hover:bg-sky-600 hover:border-sky-600 hover:text-white dark:hover:bg-sky-600 dark:hover:text-white hover:shadow-sky-500/20",
    indigo:
        "text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white hover:shadow-indigo-500/20",
    slate:
        "text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-700 hover:border-slate-700 hover:text-white dark:hover:bg-slate-700 dark:hover:text-white hover:shadow-slate-500/20",
};

export interface DataTableActionButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: DataTableActionVariant;
    tooltip?: React.ReactNode;
    children: React.ReactNode;
}

export const DataTableActionButton = React.forwardRef<
    HTMLButtonElement,
    DataTableActionButtonProps
>(({ variant = "slate", tooltip, className, disabled, children, onClick, ...props }, ref) => {
    const btn = (
        <button
            ref={ref}
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "p-1.5 border rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center shrink-0",
                ACTION_VARIANT_CLASSES[variant],
                disabled && "opacity-40 cursor-not-allowed hover:bg-white dark:hover:bg-slate-900 hover:text-current active:scale-100 hover:shadow-2xs",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );

    if (tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        );
    }

    return btn;
});

DataTableActionButton.displayName = "DataTableActionButton";

export interface DataTableTextActionButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: DataTableActionVariant;
    tooltip?: React.ReactNode;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const DataTableTextActionButton = React.forwardRef<
    HTMLButtonElement,
    DataTableTextActionButtonProps
>(
    (
        { variant = "slate", tooltip, icon, className, disabled, children, onClick, ...props },
        ref
    ) => {
        const btn = (
            <button
                ref={ref}
                type="button"
                disabled={disabled}
                onClick={onClick}
                className={cn(
                    "px-2.5 py-1 border rounded-xl text-[11px] font-extrabold transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 inline-flex",
                    ACTION_VARIANT_CLASSES[variant],
                    disabled &&
                        "opacity-40 cursor-not-allowed hover:bg-white dark:hover:bg-slate-900 hover:text-current active:scale-100 hover:shadow-2xs",
                    className
                )}
                {...props}
            >
                {icon}
                <span>{children}</span>
            </button>
        );

        if (tooltip) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
            );
        }

        return btn;
    }
);

DataTableTextActionButton.displayName = "DataTableTextActionButton";
