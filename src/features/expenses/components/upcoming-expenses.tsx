"use client";

import { useUpcomingExpenses } from "../api/expenses-api";
import { IconHourglass, IconAlertTriangle, IconCheck, IconCoins } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface UpcomingExpensesProps {
    onPayCategory: (categoryId: number, categoryName: string) => void;
}

export function UpcomingExpenses({ onPayCategory }: UpcomingExpensesProps) {
    const { data: upcoming = [], isLoading } = useUpcomingExpenses();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageExpenses =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_expenses");

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Jadwal Pengeluaran Rutin</h4>
                <div className="animate-pulse space-y-2">
                    <div className="h-10 bg-slate-50 rounded-xl" />
                    <div className="h-10 bg-slate-50 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div>
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <IconHourglass size={14} className="text-amber-500" />
                    <span>Jadwal Pengeluaran Rutin Bulan Ini</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                    Daftar kategori pengeluaran bulanan yang belum dicatat untuk bulan berjalan.
                </p>
            </div>

            {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100/60 border-dashed">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <IconCheck size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-700">Semua Tagihan Lunas</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Seluruh pengeluaran rutin bulan ini telah dicatat.</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {upcoming.map((due) => {
                        const isOverdue = due.status === "overdue";
                        const dueDate = new Date(due.tanggal_jatuh_tempo);
                        const formattedDueDate = format(dueDate, "dd MMM yyyy", { locale: id });

                        return (
                            <div
                                key={due.expense_category_id}
                                className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                                    isOverdue
                                        ? "bg-rose-50/30 border-rose-100 hover:bg-rose-50/50"
                                        : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                                }`}
                            >
                                <div className="min-w-0">
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
                                        onClick={() => onPayCategory(due.expense_category_id, due.category_name)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all border-none ${
                                            isOverdue
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
    );
}
