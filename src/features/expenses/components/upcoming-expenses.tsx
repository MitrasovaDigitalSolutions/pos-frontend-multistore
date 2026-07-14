"use client";

import { useState, useEffect } from "react";
import { useUpcomingExpenses } from "../api/expenses-api";
import {
    IconHourglass,
    IconAlertTriangle,
    IconCheck,
    IconCoins,
    IconMinus,
    IconCalendar,
    IconBell
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface UpcomingExpensesProps {
    onPayCategory: (categoryUid: string, categoryName: string) => void;
}

export function UpcomingExpenses({ onPayCategory }: UpcomingExpensesProps) {
    const { data: upcoming = [], isLoading } = useUpcomingExpenses();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageExpenses =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_expenses");

    const [isMinimized, setIsMinimized] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const saved = localStorage.getItem("upcoming-expenses-minimized");
        if (saved !== null) {
            setIsMinimized(JSON.parse(saved));
        }
    }, []);

    // Auto-minimize if loaded and no bills left
    useEffect(() => {
        if (!isLoading && upcoming.length === 0) {
            const saved = localStorage.getItem("upcoming-expenses-minimized");
            if (saved === null) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsMinimized(true);
            }
        }
    }, [upcoming.length, isLoading]);

    const toggleMinimize = () => {
        const nextState = !isMinimized;
        setIsMinimized(nextState);
        localStorage.setItem("upcoming-expenses-minimized", JSON.stringify(nextState));
    };

    if (!mounted) {
        return null;
    }

    const unpaidCount = upcoming.length;
    const overdueCount = upcoming.filter((due) => due.status === "overdue").length;
    const hasUnpaid = unpaidCount > 0;
    const hasOverdue = overdueCount > 0;

    if (isLoading) {
        return (
            <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-48px)] sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl p-6">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <IconHourglass size={14} className="text-slate-400 animate-spin" />
                    <span>Jadwal Pengeluaran Rutin</span>
                </h4>
                <div className="animate-pulse space-y-2 mt-4">
                    <div className="h-10 bg-slate-50 rounded-xl" />
                    <div className="h-10 bg-slate-50 rounded-xl" />
                </div>
            </div>
        );
    }

    if (isMinimized) {
        return (
            <button
                onClick={toggleMinimize}
                className="fixed bottom-6 right-6 z-40 bg-white border border-slate-200/80 shadow-xl hover:shadow-2xl px-4 py-3 rounded-full flex items-center gap-2.5 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
                <div className={`p-1.5 rounded-full ${hasOverdue ? 'bg-rose-50 text-rose-600' : hasUnpaid ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    {hasOverdue ? (
                        <IconAlertTriangle size={16} className="animate-bounce" />
                    ) : (
                        <IconCalendar size={16} />
                    )}
                </div>
                <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pengeluaran Rutin</span>
                    <span className="text-xs font-extrabold text-slate-800">
                        {hasOverdue ? "Ada Tunggakan!" : "Lihat Tagihan"}
                    </span>
                </div>

                {hasUnpaid && (
                    <span className="relative flex h-5 w-5 ml-1">
                        {hasOverdue && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-5 w-5 text-[10px] font-extrabold text-white items-center justify-center ${hasOverdue ? 'bg-rose-600' : 'bg-amber-500'}`}>
                            {unpaidCount}
                        </span>
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-48px)] sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50/80 backdrop-blur-sm px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <IconHourglass size={14} className={hasOverdue ? "text-rose-500 animate-pulse" : hasUnpaid ? "text-amber-500" : "text-emerald-500"} />
                    <span className="text-xs font-extrabold text-slate-900">
                        Jadwal Pengeluaran Rutin
                    </span>
                </div>
                <button
                    onClick={toggleMinimize}
                    className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Sembunyikan"
                >
                    <IconMinus size={14} />
                </button>
            </div>

            {/* Warning Alert Banner */}
            {hasOverdue ? (
                <div className="bg-rose-50/90 border-b border-rose-100/50 px-4 py-2.5 flex items-start gap-2.5 text-rose-800 text-[11px] font-medium">
                    <IconAlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                        <span className="font-bold">Tagihan Perlu Dibayar!</span> Ada <span className="font-bold text-rose-700">{overdueCount}</span> tagihan yang melewati jatuh tempo. Harap segera dicatat.
                    </div>
                </div>
            ) : hasUnpaid ? (
                <div className="bg-amber-50/90 border-b border-amber-100/50 px-4 py-2.5 flex items-start gap-2.5 text-amber-800 text-[11px] font-medium">
                    <IconBell size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">Tagihan Bulan Ini:</span> Terdapat <span className="font-bold text-amber-700">{unpaidCount}</span> pengeluaran rutin yang belum dicatat.
                    </div>
                </div>
            ) : null}

            {/* List Content */}
            <div className="p-4 space-y-4">
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    Daftar kategori pengeluaran bulanan yang belum dicatat untuk bulan berjalan.
                </p>

                {upcoming.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100/60 border-dashed">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                            <IconCheck size={16} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-700">Semua Tagihan Lunas</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Seluruh pengeluaran rutin bulan ini telah dicatat.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                        {upcoming.map((due) => {
                            const isOverdue = due.status === "overdue";
                            const dueDate = new Date(due.tanggal_jatuh_tempo);
                            const formattedDueDate = format(dueDate, "dd MMM yyyy", { locale: id });

                            return (
                                <div
                                    key={due.expense_category_uid}
                                    className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isOverdue
                                        ? "bg-rose-50/30 border-rose-100 hover:bg-rose-50/50"
                                        : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="min-w-0 mr-2">
                                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            {isOverdue && (
                                                <IconAlertTriangle size={12} className="text-rose-500 shrink-0" />
                                            )}
                                            <span className="truncate">{due.category_name}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                            Jatuh tempo: <span className={isOverdue ? "text-rose-600 font-bold" : "text-slate-600"}>{formattedDueDate}</span>
                                            {isOverdue ? (
                                                <span className="text-rose-600 font-bold ml-1">
                                                    (Terlambat {Math.abs(due.days_left)} hari)
                                                </span>
                                            ) : due.days_left === 0 ? (
                                                <span className="text-amber-600 font-bold ml-1">(Hari Ini)</span>
                                            ) : (
                                                <span className="text-slate-500 font-medium ml-1">
                                                    ({due.days_left} hari lagi)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {hasManageExpenses && (
                                        <button
                                            onClick={() => onPayCategory(due.expense_category_uid, due.category_name)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all border-none shrink-0 ${isOverdue
                                                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                                }`}
                                        >
                                            <IconCoins size={10} />
                                            <span>Catat Bayar</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

