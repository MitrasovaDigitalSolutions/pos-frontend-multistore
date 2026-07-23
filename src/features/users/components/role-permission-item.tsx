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
            className={`flex items-center justify-between py-3.5 pl-6 sm:pl-12 pr-4 sm:pr-6 transition-colors duration-200 ${isAssigned
                ? "bg-emerald-50/20 dark:bg-emerald-950/10"
                : "bg-transparent hover:bg-slate-50/40"
                }`}
        >
            <div className="flex gap-3 items-start pr-4 min-w-0 flex-1">
                <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isAssigned
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30"
                        : "bg-slate-100 text-slate-400 border border-slate-200/60 dark:bg-slate-900 dark:text-slate-500"
                        }`}
                >
                    <IconKey size={14} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <HighlightText text={label} highlight={searchQuery} />
                        </h5>
                        <span className="text-[9.5px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200/50">
                            <HighlightText text={permission.name} highlight={searchQuery} />
                        </span>
                        {isAssigned && (
                            <span className="text-[9px] bg-emerald-100/90 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md font-mono flex items-center gap-0.5 border border-emerald-200/60">
                                <IconCheck size={10} strokeWidth={3} /> AKTIF
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                        <HighlightText text={desc} highlight={searchQuery} />
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-3">
                {isPending && (
                    <IconLoader
                        size={15}
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
