"use client";

import React from "react";
import type { CashLedger } from "../../api/cash-api";

interface LedgerReferenceCellProps {
    movement: CashLedger;
}

export function LedgerReferenceCell({ movement }: LedgerReferenceCellProps) {
    const sale = movement.sale;
    const supplierPayment = movement.supplierPayment || movement.supplier_payment;
    const purchaseReturnSettlement = movement.purchaseReturnSettlement || movement.purchase_return_settlement;
    const expense = movement.expense;
    const drawerMovement = movement.cashDrawerMovement || movement.cash_drawer_movement;
    const drawerSession = movement.cashDrawerSession || movement.cash_drawer_session;
    const sessionUid = movement.cash_drawer_session_uid || drawerSession?.uid || drawerMovement?.cash_drawer_session_uid;
    const stockReceiving = movement.stockReceiving || movement.stock_receiving;
    const memberPayment = movement.memberPayment || movement.member_payment;
    const coa = movement.chartOfAccount || movement.chart_of_account;
    const kat = (movement.kategori || "").toLowerCase();

    if (expense) {
        return (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs">
                        {expense.nama || "Pengeluaran Operasional"}
                    </span>
                    {expense.nomor_pengeluaran && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded border border-slate-200">
                            #{expense.nomor_pengeluaran}
                        </span>
                    )}
                    {expense.status && (
                        <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${
                            expense.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                        }`}>
                            {expense.status}
                        </span>
                    )}
                </div>
                {expense.category && (
                    <span className="text-[10px] text-slate-500 font-medium">
                        Kategori: <strong className="text-slate-700">{expense.category.nama}</strong>
                    </span>
                )}
                {expense.catatan && (
                    <span className="text-[10px] italic text-slate-400 max-w-xs truncate">
                        &quot;{expense.catatan}&quot;
                    </span>
                )}
            </div>
        );
    }

    if (sale) {
        return (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">Penjualan Kasir</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-1.5 py-0.2 rounded border border-emerald-200/60 font-semibold">
                        #{sale.nomor_transaksi}
                    </span>
                </div>
                {sale.catatan && (
                    <span className="text-[10px] italic text-slate-400 truncate max-w-xs">{sale.catatan}</span>
                )}
            </div>
        );
    }

    if (supplierPayment) {
        return (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">Pembayaran Supplier</span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-mono px-1.5 py-0.2 rounded border border-amber-200/60 font-semibold">
                        #{supplierPayment.nomor_pembayaran}
                    </span>
                </div>
                {supplierPayment.supplier?.nama && (
                    <span className="text-[10px] text-slate-500 font-medium">
                        Supplier: <strong className="text-slate-700">{supplierPayment.supplier.nama}</strong>
                    </span>
                )}
                {supplierPayment.catatan && (
                    <span className="text-[10px] italic text-slate-400 max-w-xs truncate">{supplierPayment.catatan}</span>
                )}
            </div>
        );
    }

    if (purchaseReturnSettlement) {
        const pr = purchaseReturnSettlement.purchaseReturn || purchaseReturnSettlement.purchase_return;
        return (
            <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-900 text-xs">Settlement Retur Pembelian</span>
                {pr?.nomor_transaksi && (
                    <span className="text-[10px] bg-teal-50 text-teal-700 font-mono px-1.5 py-0.2 rounded border border-teal-200/60 w-fit">
                        Retur: #{pr.nomor_transaksi}
                    </span>
                )}
            </div>
        );
    }

    if (drawerMovement || drawerSession || kat.includes("drawer") || kat.includes("laci")) {
        let title = "Mutasi Laci Kas";
        let badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200/60";

        if (kat === "cash_drawer_open" || kat.includes("open")) {
            title = "Buka Laci Kas (Opening Shift)";
            badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200/60";
        } else if (kat === "cash_drawer_close" || kat.includes("close")) {
            title = "Tutup Laci Kas (Closing Shift)";
            badgeColor = "bg-purple-50 text-purple-700 border-purple-200/60";
        } else if (kat === "cash_in") {
            title = "Setoran Laci Kas (Cash In)";
            badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
        } else if (kat === "cash_out") {
            title = "Penarikan Laci Kas (Cash Out)";
            badgeColor = "bg-rose-50 text-rose-700 border-rose-200/60";
        }

        const note = drawerMovement?.note || drawerSession?.opening_note || drawerSession?.closing_note;

        return (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs">{title}</span>
                    {sessionUid && (
                        <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${badgeColor}`}
                            title={`Session UID: ${sessionUid}`}
                        >
                            Session: #{sessionUid.slice(0, 8)}...
                        </span>
                    )}
                </div>
                {note && (
                    <span className="text-[10px] text-slate-500 italic max-w-xs truncate">&quot;{note}&quot;</span>
                )}
            </div>
        );
    }

    if (stockReceiving) {
        return (
            <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-900 text-xs">Penerimaan Stok / Goods Receiving</span>
                {stockReceiving.nomor_penerimaan && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-1.5 py-0.2 rounded border border-blue-200/60 w-fit">
                        #{stockReceiving.nomor_penerimaan}
                    </span>
                )}
            </div>
        );
    }

    if (memberPayment) {
        return (
            <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-900 text-xs">Pembayaran Member</span>
                {memberPayment.nomor_pembayaran && (
                    <span className="text-[10px] bg-purple-50 text-purple-700 font-mono px-1.5 py-0.2 rounded border border-purple-200/60 w-fit">
                        #{memberPayment.nomor_pembayaran}
                    </span>
                )}
            </div>
        );
    }

    if (coa) {
        return (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs">
                        {movement.kategori ? movement.kategori.replace(/_/g, " ") : "Penyesuaian Kas"}
                    </span>
                    <span className="text-[10px] bg-sky-50 text-sky-700 font-mono px-1.5 py-0.2 rounded border border-sky-200/60 font-semibold">
                        {coa.kode_akun ? `${coa.kode_akun} - ` : ""}{coa.nama_akun || "Akun CoA"}
                    </span>
                </div>
                {movement.catatan && (
                    <span className="text-[10px] italic text-slate-400 max-w-xs truncate">
                        &quot;{movement.catatan}&quot;
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                {movement.kategori ? movement.kategori.replace(/_/g, " ") : "Mutasi Kas"}
            </span>
            {movement.catatan && (
                <span className="text-[10px] italic text-slate-400 max-w-xs truncate">
                    &quot;{movement.catatan}&quot;
                </span>
            )}
        </div>
    );
}
