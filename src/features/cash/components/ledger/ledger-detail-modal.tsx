"use client";

import React from "react";
import { IconScale, IconUser } from "@tabler/icons-react";

import { BaseDialog } from "@/components/ui/base-dialog";
import { formatDate, formatToTime } from "@/lib/date-utils";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CashLedger } from "../../api/cash-api";

interface LedgerDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movement: CashLedger | null;
}

export function LedgerDetailModal({ open, onOpenChange, movement }: LedgerDetailModalProps) {
    if (!movement) return null;

    const isPositive = movement.amount >= 0;
    const isTransfer = (movement.tipe || "").toLowerCase() === "transfer";
    const displayAmt = Math.abs(movement.amount);
    const accountObj = movement.cashAccount || movement.cash_account;
    const drawerMovement = movement.cashDrawerMovement || movement.cash_drawer_movement;
    const drawerSession = movement.cashDrawerSession || movement.cash_drawer_session;
    const sessionUid = movement.cash_drawer_session_uid || drawerSession?.uid || drawerMovement?.cash_drawer_session_uid;
    const note = movement.expense?.catatan || movement.supplier_payment?.catatan || drawerMovement?.note || drawerSession?.opening_note || drawerSession?.closing_note;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <span className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <IconScale className="text-emerald-600" size={18} />
                    Rincian Mutasi Arus Kas
                </span>
            }
            className="max-w-lg"
        >
            <div className="space-y-4 pt-1 pb-2">
                {/* Amount Banner */}
                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${
                    isPositive
                        ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
                        : "bg-rose-50/70 border-rose-200/80 text-rose-950"
                }`}>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                        Nominal Transaksi
                    </span>
                    <div className="text-2xl font-black tabular-nums tracking-tight">
                        {isPositive ? "+" : "-"}{formatRupiah(displayAmt)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            isPositive
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-rose-600 text-white border-rose-600"
                        }`}>
                            {isTransfer
                                ? (isPositive ? "Transfer (Masuk)" : "Transfer (Keluar)")
                                : (isPositive ? "Debit" : "Kredit")}
                        </span>
                        {accountObj?.nama && (
                            <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                                {accountObj.nama}
                            </span>
                        )}
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            UID Ledger
                        </span>
                        <span className="font-mono font-bold text-slate-800 break-all text-[11px]">
                            {movement.uid}
                        </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Waktu Dibuat
                        </span>
                        <span className="font-bold text-slate-800 text-[11px]">
                            {formatDate(movement.created_at, "dd MMMM yyyy")} ({formatToTime(movement.created_at)})
                        </span>
                    </div>

                    {movement.expense && (
                        <>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                    No. Pengeluaran
                                </span>
                                <span className="font-mono font-bold text-slate-800 text-[11px]">
                                    {movement.expense.nomor_pengeluaran || "-"}
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                    Kategori Pengeluaran
                                </span>
                                <span className="font-bold text-slate-800 text-[11px]">
                                    {movement.expense.category?.nama || "-"}
                                </span>
                            </div>
                        </>
                    )}

                    {movement.sale && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                No. Transaksi POS
                            </span>
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                                #{movement.sale.nomor_transaksi}
                            </span>
                        </div>
                    )}

                    {movement.supplier_payment && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                No. Pembayaran Supplier
                            </span>
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                                #{movement.supplier_payment.nomor_pembayaran}
                            </span>
                        </div>
                    )}

                    {sessionUid && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                    UID Drawer Session
                                </span>
                                {drawerSession?.status && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                        drawerSession.status === "open"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : "bg-purple-50 text-purple-700 border border-purple-200"
                                    }`}>
                                        Status: {drawerSession.status}
                                    </span>
                                )}
                            </div>
                            <span className="font-mono font-bold text-slate-800 text-[11px] break-all block">
                                {sessionUid}
                            </span>
                        </div>
                    )}

                    {movement.user && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                Operator / Pembuat
                            </span>
                            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                                <IconUser size={13} className="text-slate-400" />
                                {movement.user.nama || movement.user.name} ({movement.user.email || "No Email"})
                            </span>
                        </div>
                    )}
                </div>

                {/* Catatan / Notes */}
                {note && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                            Catatan Transaksi
                        </span>
                        <p className="text-amber-900 italic">
                            {note}
                        </p>
                    </div>
                )}
            </div>
        </BaseDialog>
    );
}
