"use client";

import { cn } from "@/lib/utils";
import { IconCheck, IconShield } from "@tabler/icons-react";
import { ROLE_METADATA } from "../constants/role-permission-constants";
import type { RoleWithStats } from "./role-permission-types";

interface RoleSelectorBarProps {
    roles: RoleWithStats[];
    activeRoleName: string | null;
    onSelectRole: (roleName: string) => void;
}

export function RoleSelectorBar({
    roles,
    activeRoleName,
    onSelectRole,
}: RoleSelectorBarProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Pilih Peran Pengguna (Role)
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                    {roles.length} Peran Tersedia
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {roles.map((role) => {
                    const meta = ROLE_METADATA[role.name] || {
                        label: role.name.replace("_", " "),
                        desc: "Hak akses peran sistem.",
                        colorClass: "from-slate-500/10 via-slate-500/5 to-transparent border-slate-200 text-slate-700",
                        icon: IconShield,
                    };
                    const Icon = meta.icon;
                    const isSelected = activeRoleName === role.name;
                    const { assigned, total, percentage } = role.stats;

                    return (
                        <button
                            key={role.id}
                            type="button"
                            onClick={() => onSelectRole(role.name)}
                            className={cn(
                                "group relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden outline-none flex flex-col justify-between gap-2.5",
                                isSelected
                                    ? "bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/15 dark:bg-slate-900 dark:border-emerald-600"
                                    : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700"
                            )}
                        >
                            {/* Selected Indicator Accent */}
                            {isSelected && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                            )}

                            {/* Role Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                            isSelected
                                                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20"
                                                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300"
                                        )}
                                    >
                                        <Icon size={17} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate capitalize leading-tight">
                                            {meta.label}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 font-mono block">
                                            {role.guard_name}
                                        </span>
                                    </div>
                                </div>

                                {isSelected ? (
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                        <IconCheck size={12} strokeWidth={3} />
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0">
                                        {percentage}%
                                    </span>
                                )}
                            </div>

                            {/* Mini Progress Bar & Stats */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                    <span>Akses Aktif</span>
                                    <span className="font-bold font-mono">
                                        {assigned} / {total}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-300",
                                            isSelected
                                                ? "bg-emerald-500"
                                                : percentage > 50
                                                    ? "bg-slate-400"
                                                    : "bg-slate-300 dark:bg-slate-700"
                                        )}
                                        style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
