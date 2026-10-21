"use client";

import React, { type ReactNode, type ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsTabCardProps {
    icon: ComponentType<{ size?: number; className?: string }>;
    iconBgClassName?: string;
    iconColorClassName?: string;
    title: string;
    subtitle: string;
    badge?: ReactNode;
    headerAction?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

export function SettingsTabCard({
    icon: Icon,
    iconBgClassName = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    title,
    subtitle,
    badge,
    headerAction,
    children,
    className,
    contentClassName,
}: SettingsTabCardProps) {
    return (
        <Card
            className={cn(
                "border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col w-full transition-all duration-200",
                className
            )}
        >
            {/* Header (compact & clean) */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30 dark:bg-slate-900/40">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-colors",
                            iconBgClassName
                        )}
                    >
                        <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider truncate">
                                {title}
                            </h3>
                            {badge}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {headerAction && (
                    <div className="shrink-0 flex items-center gap-2">
                        {headerAction}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <CardContent className={cn("p-4 sm:p-5", contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
}
