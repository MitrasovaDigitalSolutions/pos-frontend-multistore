"use client";

import { IconKey, IconLoader, IconCheck } from "@tabler/icons-react";
import { Switch } from "@/components/ui/switch";
import { Permission } from "../types";

interface HighlightTextProps {
    text: string;
    highlight: string;
}

export function HighlightText({ text, highlight }: HighlightTextProps) {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 rounded-[2px] px-0.5 font-semibold">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    );
}

interface RolePermissionItemProps {
    permission: Permission;
    label: string;
    desc: string;
    isAssigned: boolean;
    isPending: boolean;
    isDisabled: boolean;
    searchQuery: string;
    onToggle: () => void;
}

export function RolePermissionItem({
    permission,
    label,
    desc,
    isAssigned,
    isPending,
    isDisabled,
    searchQuery,
    onToggle,
}: RolePermissionItemProps) {
    return (
        <div
            className={`flex items-center justify-between py-3.5 pl-10 sm:pl-12 pr-2 transition-colors duration-200 ${isAssigned
                ? "bg-emerald-50/10 dark:bg-emerald-950/5"
                : "bg-transparent"
                }`}
        >
            <div className="flex gap-3 items-start pr-4">
                <div
                    className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${isAssigned
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                        : "bg-slate-50 text-slate-400 border border-slate-100 dark:bg-slate-900 dark:text-slate-500"
                        }`}
                >
                    <IconKey size={14} />
                </div>
                <div className="space-y-0.5">
                    <h5 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                        <HighlightText text={label} highlight={searchQuery} />
                        {isAssigned && (
                            <span className="text-[8px] bg-emerald-100/70 text-emerald-800 px-1 py-px rounded font-mono flex items-center gap-0.5">
                                <IconCheck size={8} strokeWidth={3} /> aktif
                            </span>
                        )}
                    </h5>
                    <div className="text-[9px] text-slate-400 font-mono">
                        Sistem ID: <HighlightText text={permission.name} highlight={searchQuery} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                        <HighlightText text={desc} highlight={searchQuery} />
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {isPending && (
                    <IconLoader
                        size={14}
                        className="text-emerald-500 animate-spin"
                    />
                )}
                <Switch
                    checked={isAssigned}
                    onCheckedChange={onToggle}
                    disabled={isDisabled}
                />
            </div>
        </div>
    );
}
