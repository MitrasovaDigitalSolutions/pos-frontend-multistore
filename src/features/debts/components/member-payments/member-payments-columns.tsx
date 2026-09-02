"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { IconCalendar, IconCash, IconCreditCard, IconUser } from "@tabler/icons-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate, formatToReadableDate } from "@/lib/date-utils";
import type { MemberPayment } from "@/features/master/members/api/members-api";

export function getMemberPaymentsColumns(): ColumnDef<MemberPayment>[] {
    return [
        {
            accessorKey: "tanggal_bayar",
            header: "Tanggal Bayar",
            size: 130,
            cell: ({ row }) => {
                const rawDate = row.original.tanggal_bayar;
                const shortDate = rawDate ? formatDate(rawDate, "dd MMM yyyy") : "-";
                const fullDate = rawDate ? formatToReadableDate(rawDate) : "-";
                return (
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 whitespace-nowrap cursor-default">
                                    <IconCalendar size={13} className="text-slate-400 shrink-0" />
                                    <span className="font-medium text-slate-600 dark:text-slate-400 text-xs truncate">
                                        {shortDate}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs font-medium">
                                {fullDate}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "nomor_pembayaran",
            header: "No. Pembayaran",
            size: 150,
            cell: ({ row }) => {
                const no = row.original.nomor_pembayaran;
                return (
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs truncate block max-w-[140px] cursor-default">
                                    {no}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs font-mono font-medium">
                                {no}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            id: "member",
            header: "Member",
            size: 170,
            cell: ({ row }) => {
                const member = row.original.member;
                if (!member) return <span className="text-slate-400 text-xs">-</span>;
                return (
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col min-w-0 max-w-[160px] cursor-default">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight truncate text-xs">
                                        {member.nama}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                        {member.kode}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs font-medium">
                                <div className="font-bold">{member.nama}</div>
                                <div className="text-[10px] text-slate-300 font-mono">Kode: {member.kode}</div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "cash_account",
            header: "Kas & Bank",
            size: 150,
            cell: ({ row }) => {
                const account = row.original.cash_account;
                if (!account) return <span className="text-slate-400 text-xs">-</span>;
                return (
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col min-w-0 max-w-[140px] cursor-default">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 leading-tight truncate text-xs">
                                        {account.nama}
                                    </span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                                        {account.tipe}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs font-medium">
                                <div className="font-bold">{account.nama}</div>
                                <div className="text-[10px] text-slate-300 uppercase">Tipe: {account.tipe}</div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "metode_pembayaran",
            header: "Metode",
            size: 110,
            cell: ({ row }) => {
                const isCash = row.original.metode_pembayaran === "cash";
                return (
                    <span
                        className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap ${
                            isCash
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800"
                        }`}
                    >
                        {isCash ? (
                            <>
                                <IconCash size={10} /> Tunai
                            </>
                        ) : (
                            <>
                                <IconCreditCard size={10} /> Kartu/EDC
                            </>
                        )}
                    </span>
                );
            },
        },
        {
            accessorKey: "jumlah_bayar",
            header: "Jumlah Bayar",
            size: 130,
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-extrabold tabular-nums text-xs whitespace-nowrap",
            },
            cell: ({ row }) => {
                const status = row.original.status?.toLowerCase();
                const isVoid =
                    status === "void" ||
                    status === "voided" ||
                    status === "batal" ||
                    status === "cancelled";
                return (
                    <span
                        className={
                            isVoid
                                ? "text-rose-500/80 line-through"
                                : "text-emerald-600 dark:text-emerald-400"
                        }
                    >
                        {formatRupiah(row.original.jumlah_bayar)}
                    </span>
                );
            },
        },
        {
            id: "mutasi_hutang",
            header: "Mutasi Hutang",
            size: 140,
            meta: {
                headerClassName: "text-right",
                cellClassName:
                    "text-right font-semibold text-slate-500 tabular-nums text-[11px] whitespace-nowrap",
            },
            cell: ({ row }) => {
                const sebelum = row.original.hutang_sebelum || 0;
                const sesudah = row.original.hutang_sesudah || 0;
                const status = row.original.status?.toLowerCase();
                const isVoid =
                    status === "void" ||
                    status === "voided" ||
                    status === "batal" ||
                    status === "cancelled";
                return (
                    <div
                        className={`flex flex-col items-end ${
                            isVoid ? "line-through opacity-60" : ""
                        }`}
                    >
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <span>{formatRupiah(sebelum)}</span>
                            <span>&rarr;</span>
                        </div>
                        <span
                            className={`font-extrabold ${
                                isVoid
                                    ? "text-slate-500"
                                    : "text-slate-700 dark:text-slate-300"
                            }`}
                        >
                            {formatRupiah(sesudah)}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "user",
            header: "Kasir",
            size: 120,
            cell: ({ row }) => {
                const name = row.original.user?.name || "-";
                return (
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium text-xs max-w-[110px] cursor-default">
                                    <IconUser size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{name}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs font-medium">
                                {name}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            size: 90,
            cell: ({ row }) => {
                const status = row.original.status?.toLowerCase();
                const isVoid =
                    status === "void" ||
                    status === "voided" ||
                    status === "batal" ||
                    status === "cancelled";
                return (
                    <span
                        className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap ${
                            isVoid
                                ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                        }`}
                    >
                        {isVoid ? "Void" : "Sukses"}
                    </span>
                );
            },
        },
        {
            accessorKey: "catatan",
            header: "Catatan",
            size: 140,
            cell: ({ row }) => {
                const catatan = row.original.catatan;
                if (!catatan) {
                    return (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                    );
                }
                return (
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-slate-500 font-medium text-xs block max-w-[130px] truncate cursor-default">
                                    {catatan}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs font-medium">
                                {catatan}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "catatan_void",
            header: "Alasan Pembatalan",
            size: 150,
            cell: ({ row }) => {
                const alasan = row.original.catatan_void;
                if (!alasan) {
                    return (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                    );
                }
                return (
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-rose-600 dark:text-rose-400 font-medium text-xs block max-w-[140px] truncate cursor-default">
                                    {alasan}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs font-medium text-rose-600">
                                {alasan}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
    ];
}
