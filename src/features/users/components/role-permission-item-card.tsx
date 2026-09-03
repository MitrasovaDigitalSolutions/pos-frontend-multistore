"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { IconCheck, IconLoader } from "@tabler/icons-react";
import type { Permission } from "../types";
import type { PermissionActionType } from "./role-permission-types";

interface HighlightTextProps {
    text: string;
    highlight: string;
}

export function HighlightText({ text, highlight }: HighlightTextProps) {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark
                        key={i}
                        className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 rounded-[2px] px-0.5 font-semibold"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    );
}

interface RolePermissionItemCardProps {
    permission: Permission;
    label: string;
    desc: string;
    actionType: PermissionActionType;
    isAssigned: boolean;
    isPending: boolean;
    isDisabled: boolean;
    searchQuery: string;
    onToggle: () => void;
}

export function RolePermissionItemCard({
    permission,
    label,
    desc,
    actionType,
    isAssigned,
    isPending,
    isDisabled,
    searchQuery,
    onToggle,
}: RolePermissionItemCardProps) {
    const actionBadgeConfig = {
        view: {
            text: "LIHAT",
            className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
        },
        manage: {
            text: "KELOLA",
            className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30",
        },
        auth: {
            text: "AKSI KASIR",
            className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30",
        },
    }[actionType];

    return (
        <div
            className={cn(
                "p-3 rounded-xl border transition-all duration-150 flex items-start justify-between gap-2.5",
                isAssigned
                    ? "bg-white dark:bg-slate-900 border-emerald-300/80 shadow-2xs dark:border-emerald-800/60"
                    : "bg-white/70 dark:bg-slate-900/50 border-slate-200/70 hover:border-slate-300 dark:border-slate-800/80"
            )}
        >
            <div className="space-y-1 min-w-0 flex-1 pr-1">
                {/* Header: Action Badge + Code + Status */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                        className={cn(
                            "text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider",
                            actionBadgeConfig.className
                        )}
                    >
                        {actionBadgeConfig.text}
                    </span>

                    <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-200/50 dark:border-slate-700/50">
                        <HighlightText text={permission.name} highlight={searchQuery} />
                    </span>

                    {isAssigned && (
                        <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 ml-auto sm:ml-0">
                            <IconCheck size={10} strokeWidth={3} />
                            <span>Aktif</span>
                        </span>
                    )}
                </div>

                {/* Title */}
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    <HighlightText text={label} highlight={searchQuery} />
                </h5>

                {/* Description */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    <HighlightText text={desc} highlight={searchQuery} />
                </p>
            </div>

            {/* Switch & Spinner */}
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                {isPending && (
                    <IconLoader
                        size={14}
                        className="text-emerald-500 animate-spin"
                    />
                )}
                <Switch
                    checked={isAssigned}
                    onCheckedChange={onToggle}
                    disabled={isDisabled || isPending}
                    className="cursor-pointer"
                />
            </div>
        </div>
    );
}
