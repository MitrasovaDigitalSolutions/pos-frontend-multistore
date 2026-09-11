"use client";

import React from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import {
    IconHelp,
    IconArrowRight,
    IconSparkles,
    IconClock,
    IconInfoCircle,
} from "@tabler/icons-react";

export interface FeatureTutorialItem {
    id: string;
    title: string;
    description: string;
    category?: string;
    stepCount?: number;
    badge?: string;
    isAvailable?: boolean;
    icon?: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
}

export interface FeatureTutorialDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    subtitle?: string;
    items: FeatureTutorialItem[];
    onSelectTutorial: (id: string) => void;
    infoNote?: string;
    className?: string;
}

export function FeatureTutorialDialog({
    open,
    onOpenChange,
    title,
    subtitle,
    items,
    onSelectTutorial,
    infoNote = "Tutorial simulasi interaktif ini tidak memengaruhi data transaksi riil Anda.",
    className = "",
}: FeatureTutorialDialogProps) {
    const handleSelect = (id: string, isAvailable = true) => {
        if (!isAvailable) return;
        onSelectTutorial(id);
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 shrink-0">
                        <IconHelp size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            }
            className={`sm:max-w-xl ${className}`}
        >
            <div className="py-1 space-y-3">
                {/* 2-Column Compact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {items.map((item) => {
                        const isAvailable = item.isAvailable !== false;
                        const IconProp = item.icon;

                        return (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item.id, isAvailable)}
                                onKeyDown={(e) => {
                                    if (isAvailable && (e.key === "Enter" || e.key === " ")) {
                                        handleSelect(item.id, isAvailable);
                                    }
                                }}
                                role={isAvailable ? "button" : "presentation"}
                                tabIndex={isAvailable ? 0 : -1}
                                className={`group relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-150 select-none text-left ${
                                    isAvailable
                                        ? "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 hover:shadow-md hover:shadow-emerald-500/5 cursor-pointer"
                                        : "border-slate-100 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-900/20 opacity-55 cursor-not-allowed"
                                }`}
                            >
                                <div>
                                    {/* Top Row: Icon + Badge */}
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                isAvailable
                                                    ? "bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/80 text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                                            }`}
                                        >
                                            {React.isValidElement(IconProp) ? (
                                                IconProp
                                            ) : typeof IconProp === "function" ? (
                                                <IconProp size={18} />
                                            ) : (
                                                <IconHelp size={18} />
                                            )}
                                        </div>

                                        {item.badge && (
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                    isAvailable
                                                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60"
                                                }`}
                                            >
                                                {isAvailable ? <IconSparkles size={10} /> : <IconClock size={10} />}
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title & Description */}
                                    <h4
                                        className={`text-xs font-bold leading-tight line-clamp-1 transition-colors ${
                                            isAvailable
                                                ? "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                                                : "text-slate-500 dark:text-slate-400"
                                        }`}
                                    >
                                        {item.title}
                                    </h4>

                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Bottom Row: Step Count & Action */}
                                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-medium text-slate-400">
                                    <span>
                                        {isAvailable && item.stepCount
                                            ? `${item.stepCount} Langkah`
                                            : "Segera Hadir"}
                                    </span>

                                    {isAvailable && (
                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform text-[11px]">
                                            Mulai Demo
                                            <IconArrowRight size={13} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Compact Info Footer Notice */}
                {infoNote && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <IconInfoCircle size={15} className="text-slate-400 shrink-0" />
                        <p className="line-clamp-1">
                            {infoNote}
                        </p>
                    </div>
                )}
            </div>
        </BaseDialog>
    );
}
