"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    IconCheck,
    IconRefresh,
    IconShield,
    IconShieldCheck,
    IconUsers,
} from "@tabler/icons-react";
import { ROLE_METADATA } from "../constants/role-permission-constants";
import type { RoleWithStats } from "./role-permission-types";

interface RoleListPanelProps {
    roles: RoleWithStats[];
    activeRoleName: string | null;
    onSelectRole: (roleName: string) => void;
}

const ROLE_SECURITY_TIPS: Record<string, { title: string; tip: string }> = {
    admin: {
        title: "Privilese Super Admin",
        tip: "Memiliki otoritas penuh atas seluruh cabang, modul, keuangan, dan pengaturan akun. Jaga kerahasiaan kredensial akun ini.",
    },
    manajer_toko: {
        title: "Operasional Cabang",
        tip: "Dapat mengawasi mutasi stok, penjualan cabang, serta pengadaan barang. Disarankan tidak diberi akses pengaturan sistem global.",
    },
    supervisor: {
        title: "Supervisi & Verifikasi",
        tip: "Berwenang memverifikasi penerimaan barang, stock opname fisik, serta audit shift kasir tanpa wewenang jurnal keuangan.",
    },
    kasir: {
        title: "Keamanan Terminal POS",
        tip: "Fokus utama pada layar checkout kasir dan laci kas. Batasi hak void penjualan dan kelola stok untuk mencegah anomali.",
    },
};

export function RoleListPanel({
    roles,
    activeRoleName,
    onSelectRole,
}: RoleListPanelProps) {
    const activeTip = activeRoleName
        ? ROLE_SECURITY_TIPS[activeRoleName] || {
              title: "Panduan Hak Akses",
              tip: "Atur hak akses sesuai dengan pembagian tugas staf untuk meminimalkan risiko operasional.",
          }
        : null;

    return (
        <div className="space-y-4">
            {/* Panel Card */}
            <Card className="border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs bg-white dark:bg-slate-900 overflow-hidden py-0">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <IconUsers size={16} />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                Daftar Peran (Roles)
                            </h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                Pilih peran untuk mengelola hak akses
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono">
                        {roles.length} Peran
                    </span>
                </div>

                {/* Role List */}
                <CardContent className="p-3 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                        {roles.map((role) => {
                            const meta = ROLE_METADATA[role.name] || {
                                label: role.name.replace("_", " "),
                                desc: "Hak akses operasional sistem.",
                                colorClass: "border-slate-200 text-slate-700",
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
                                        "group relative w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer outline-none overflow-hidden flex flex-col justify-between gap-2.5",
                                        isSelected
                                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/20"
                                            : "bg-white hover:bg-slate-50/70 border-slate-200/80 hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700"
                                    )}
                                >
                                    {/* Selected Left Accent Bar */}
                                    {isSelected && (
                                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-600 dark:bg-emerald-500" />
                                    )}

                                    {/* Role Identity Header */}
                                    <div className="flex items-start justify-between gap-2 pl-0.5">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
                                                    isSelected
                                                        ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
                                                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300"
                                                )}
                                            >
                                                <Icon size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize leading-tight">
                                                        {meta.label}
                                                    </h4>
                                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                                                        {role.guard_name}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                    {meta.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status / Selected Checkmark */}
                                        {isSelected ? (
                                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                                <IconCheck size={12} strokeWidth={3} />
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0">
                                                {percentage}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress & Stat Indicators */}
                                    <div className="space-y-1 pl-0.5">
                                        <div className="flex items-center justify-between text-[10.5px]">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                                                Akses Aktif
                                            </span>
                                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {assigned} / {total}{" "}
                                                <span className="text-[10px] font-normal text-slate-400">
                                                    ({percentage}%)
                                                </span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-300",
                                                    isSelected
                                                        ? "bg-emerald-500 dark:bg-emerald-400"
                                                        : percentage > 70
                                                          ? "bg-slate-500 dark:bg-slate-600"
                                                          : percentage > 30
                                                            ? "bg-slate-400 dark:bg-slate-700"
                                                            : "bg-slate-300 dark:bg-slate-800"
                                                )}
                                                style={{
                                                    width: `${Math.min(100, Math.max(2, percentage))}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Contextual Security Tip & Auto-Save Note */}
            {activeTip && (
                <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/40 p-3.5 space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                        <IconShieldCheck size={16} className="shrink-0" />
                        <span className="text-xs font-bold">{activeTip.title}</span>
                    </div>
                    <p className="text-[11px] text-blue-900/80 dark:text-blue-200/70 leading-relaxed">
                        {activeTip.tip}
                    </p>
                    <div className="pt-1 border-t border-blue-200/50 dark:border-blue-900/30 flex items-center gap-1.5 text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                        <IconRefresh size={12} className="animate-spin text-blue-600" />
                        <span>Perubahan hak akses disimpan otomatis secara realtime</span>
                    </div>
                </div>
            )}
        </div>
    );
}
