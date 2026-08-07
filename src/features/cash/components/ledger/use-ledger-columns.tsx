"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
    IconCalendar,
    IconUser,
} from "@tabler/icons-react";

import { formatDate, formatToTime } from "@/lib/date-utils";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CashLedger } from "../../api/cash-api";
import { getCategoryMeta } from "../../utils/ledger-helpers";
import { LedgerReferenceCell } from "./ledger-reference-cell";

export function useLedgerColumns(): ColumnDef<CashLedger>[] {
    return useMemo(() => [
        {
            id: "created_at",
            header: "Waktu & User",
            accessorKey: "created_at",
            size: 150,
            meta: {
                headerClassName: "w-[150px] min-w-[150px]",
                cellClassName: "w-[150px] min-w-[150px]",
            },
            cell: ({ row }) => {
                const movement = row.original;
                const value = movement.created_at;
                const userObj = movement.user;
                const userName = userObj?.nama || userObj?.name || null;

                return (
                    <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <IconCalendar size={13} className="text-slate-400 shrink-0" />
                            {formatDate(value, "dd MMM yyyy")}
                            <span className="text-[11px] font-mono text-slate-500 font-medium">
                                {formatToTime(value)}
                            </span>
                        </div>
                        {userName ? (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium bg-slate-100/80 px-1.5 py-0.5 rounded w-fit">
                                <IconUser size={11} className="text-slate-400 shrink-0" />
                                <span className="truncate max-w-[90px]">{userName}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] text-slate-400 italic block">Oleh: Sistem</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "cash_account",
            header: "Akun Kas",
            size: 130,
            meta: {
                headerClassName: "w-[130px] min-w-[130px]",
                cellClassName: "w-[130px] min-w-[130px]",
            },
            cell: ({ row }) => {
                const movement = row.original;
                const accountObj = movement.cashAccount || movement.cash_account;
                const accountName = accountObj?.nama || "Akun Kas";
                const accountTipe = accountObj?.tipe || "cash";

                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{accountName}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded w-fit">
                            {accountTipe}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "kategori",
            header: "Kategori",
            size: 130,
            meta: {
                headerClassName: "w-[130px] min-w-[130px]",
                cellClassName: "w-[130px] min-w-[130px]",
            },
            cell: ({ row }) => {
                const movement = row.original;
                const meta = getCategoryMeta(movement);
                const IconComp = meta.icon;

                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${meta.colorClass}`}>
                            <IconComp size={12} />
                            {meta.label}
                        </span>
                        {meta.subLabel && (
                            <span className="text-[9px] text-slate-400 ml-1 font-medium truncate max-w-[110px]">
                                {meta.subLabel}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "reference",
            header: "Deskripsi & Referensi",
            size: 300,
            meta: {
                headerClassName: "min-w-[260px]",
                cellClassName: "min-w-[260px]",
            },
            cell: ({ row }) => {
                return (
                    <div className="text-xs font-medium py-0.5">
                        <LedgerReferenceCell movement={row.original} />
                    </div>
                );
            },
        },
        {
            id: "amount",
            header: "Nominal",
            size: 160,
            meta: {
                headerClassName: "text-right w-[160px] min-w-[160px]",
                cellClassName: "text-right w-[160px] min-w-[160px]",
            },
            cell: ({ row }) => {
                const movement = row.original;
                const isPositive = movement.amount >= 0;
                const displayValue = Math.abs(movement.amount);

                return (
                    <div className="flex flex-col items-end">
                        <span className={`text-sm font-black tabular-nums tracking-tight ${
                            isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}>
                            {isPositive ? "+" : "-"} {formatRupiah(displayValue)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                            ID: {movement.uid.slice(0, 8)}
                        </span>
                    </div>
                );
            },
        },
    ], []);
}
