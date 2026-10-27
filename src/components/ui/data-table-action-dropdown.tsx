"use client";

import * as React from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface DataTableActionDropdownItem {
    id?: string;
    label: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    danger?: boolean;
    hidden?: boolean;
    separatorAfter?: boolean;
    className?: string;
}

export interface DataTableActionDropdownProps {
    items?: DataTableActionDropdownItem[];
    label?: string;
    tooltip?: React.ReactNode;
    triggerIcon?: React.ReactNode;
    triggerClassName?: string;
    contentClassName?: string;
    align?: "start" | "center" | "end";
    sideOffset?: number;
    disabled?: boolean;
    children?: React.ReactNode;
}

export function DataTableActionDropdown({
    items,
    label,
    tooltip = "Aksi Lainnya",
    triggerIcon,
    triggerClassName,
    contentClassName,
    align = "end",
    sideOffset = 4,
    disabled = false,
    children,
}: DataTableActionDropdownProps) {
    const triggerBtn = (
        <button
            type="button"
            disabled={disabled}
            className={cn(
                "p-1.5 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center shrink-0",
                disabled && "opacity-40 cursor-not-allowed active:scale-100 hover:bg-white dark:hover:bg-slate-900",
                triggerClassName
            )}
            title={typeof tooltip === "string" ? tooltip : "Aksi Lainnya"}
            data-action="more-actions"
        >
            {triggerIcon || <IconDotsVertical size={16} />}
        </button>
    );

    const activeItems = (items || []).filter((item) => !item.hidden);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {tooltip && !disabled ? (
                    <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>{triggerBtn}</TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            {tooltip}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    triggerBtn
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    "min-w-48 max-w-64 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-1 z-50",
                    contentClassName
                )}
            >
                {label && (
                    <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        {label}
                    </DropdownMenuLabel>
                )}

                {activeItems.map((item, index) => {
                    const isDanger = item.danger;

                    return (
                        <React.Fragment key={item.id || `dropdown-item-${index}`}>
                            <DropdownMenuItem
                                disabled={item.disabled}
                                onClick={item.onClick}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs font-semibold transition-colors outline-none",
                                    isDanger
                                        ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700"
                                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                                    item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                                    item.className
                                )}
                            >
                                {item.icon && (
                                    <div
                                        className={cn(
                                            "p-1 rounded-md shrink-0 flex items-center justify-center",
                                            isDanger
                                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                        )}
                                    >
                                        {item.icon}
                                    </div>
                                )}
                                <div className="flex flex-col text-left min-w-0 flex-1">
                                    <span className="font-semibold leading-tight truncate">
                                        {item.label}
                                    </span>
                                    {item.description && (
                                        <span className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5 truncate">
                                            {item.description}
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuItem>

                            {item.separatorAfter && index < activeItems.length - 1 && (
                                <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />
                            )}
                        </React.Fragment>
                    );
                })}

                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
