"use client";

import { IconTrash, IconUser } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate, formatToReadableDate } from "@/lib/date-utils";
import type { MemberPayment } from "@/features/master/members/api/members-api";

interface MemberPaymentCardProps {
    payment: MemberPayment;
    canManageMembers: boolean;
    onDelete: (payment: MemberPayment) => void;
}

export function MemberPaymentCard({
    payment: p,
    canManageMembers,
    onDelete,
}: MemberPaymentCardProps) {
    const status = p.status?.toLowerCase();
    const isVoid =
        status === "void" ||
        status === "voided" ||
        status === "batal" ||
        status === "cancelled";
    const isCash = p.metode_pembayaran === "cash";
    const member = p.member;
    const account = p.cash_account;
    const rawDate = p.tanggal_bayar;
    const shortDate = rawDate ? formatDate(rawDate, "dd MMM yyyy") : "-";
    const fullDate = rawDate ? formatToReadableDate(rawDate) : "-";
    const canDelete = canManageMembers && !isVoid;

    return (
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs space-y-0 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            {/* Header: No. Pembayaran + Status + Delete Action */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800/80 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {p.nomor_pembayaran}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center gap-1 ${
                            isVoid
                                ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                        }`}
                    >
                        {isVoid ? "Void" : "Sukses"}
                    </span>
                    {canDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(p)}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Batalkan Pembayaran (Void)"
                        >
                            <IconTrash size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2.5 text-xs">
                {/* Member + Date Row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Member
                        </span>
                        <div className="flex items-baseline gap-1.5 truncate">
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {member?.nama || "-"}
                            </span>
                            {member?.kode && (
                                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                    ({member.kode})
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Tgl Bayar
                        </span>
                        <span className="font-medium text-slate-600 dark:text-slate-400" title={fullDate}>
                            {shortDate}
                        </span>
                    </div>
                </div>

                {/* Amount & Mutation Box */}
                <div className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Jumlah Bayar
                        </span>
                        <span
                            className={`text-sm font-extrabold ${
                                isVoid
                                    ? "text-rose-500 line-through"
                                    : "text-emerald-600 dark:text-emerald-400"
                            }`}
                        >
                            {formatRupiah(p.jumlah_bayar)}
                        </span>
                    </div>

                    <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Sisa Hutang
                        </span>
                        <div
                            className={`flex items-center gap-1 font-mono text-[11px] font-bold ${
                                isVoid
                                    ? "line-through opacity-60 text-slate-400"
                                    : "text-slate-700 dark:text-slate-300"
                            }`}
                        >
                            <span className="text-[10px] text-slate-400 font-normal">
                                {formatRupiah(p.hutang_sebelum || 0)}
                            </span>
                            <span className="text-slate-400 font-normal">&rarr;</span>
                            <span>{formatRupiah(p.hutang_sesudah || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Account & Cashier Row */}
                <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px]">
                    <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Kas / Bank
                        </span>
                        <div className="flex items-center gap-1 truncate text-slate-700 dark:text-slate-300">
                            <span className="truncate font-medium">{account?.nama || "-"}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase shrink-0">
                                {isCash ? "Tunai" : "EDC"}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Kasir
                        </span>
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 truncate">
                            <IconUser size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{p.user?.name || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* Notes if any */}
                {(p.catatan || p.catatan_void) && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                        {p.catatan && (
                            <div className="flex items-start gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="font-bold text-[10px] text-slate-400 shrink-0">Catatan:</span>
                                <span className="italic truncate">{p.catatan}</span>
                            </div>
                        )}
                        {p.catatan_void && (
                            <div className="flex items-start gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                                <span className="font-bold text-[10px] shrink-0">Alasan Void:</span>
                                <span className="italic truncate">{p.catatan_void}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
