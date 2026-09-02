"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BalanceSheetDetailCategory, ChartOfAccount } from "@/features/accounting/types";
import { useDeviceResponsive } from "@/hooks/use-device";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import {
    IconBuildingBank,
    IconChevronDown,
    IconCoin,
    IconListDetails,
    IconReceipt,
    IconReportMoney,
    IconSearch,
    IconWallet,
} from "@tabler/icons-react";
import { Fragment, useMemo, useState } from "react";

// Reusable Helper to map account icons
const getAccountIcon = (nama: string) => {
    const lowerName = nama.toLowerCase();
    if (lowerName.includes("kas") || lowerName.includes("tunai") || lowerName.includes("cash")) {
        return <IconWallet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
    if (lowerName.includes("bank") || lowerName.includes("giro")) {
        return <IconBuildingBank className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
    if (lowerName.includes("piutang") || lowerName.includes("receivable")) {
        return <IconReceipt className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
    }
    if (lowerName.includes("persediaan") || lowerName.includes("stok") || lowerName.includes("inventory")) {
        return <IconReportMoney className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
    }
    if (lowerName.includes("utang") || lowerName.includes("hutang") || lowerName.includes("payable")) {
        return <IconCoin className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
    return <IconReportMoney className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
};

interface BalanceSheetItemDetailTableProps {
    detail: BalanceSheetDetailCategory[];
    parentAmount: number;
    parentName: string;
    showDebitCredit?: boolean;
}

function BalanceSheetItemDetailTable({
    detail,
    parentAmount,
    parentName,
    showDebitCredit = false,
}: BalanceSheetItemDetailTableProps) {
    const { isMobile } = useDeviceResponsive();
    const [search, setSearch] = useState("");

    const filteredDetail = useMemo(() => {
        if (!search.trim()) return detail;
        const q = search.toLowerCase();
        return detail.filter((d) => (d.kategori || "").toLowerCase().includes(q));
    }, [detail, search]);

    const detailTotalAmount = useMemo(() => {
        return detail.reduce((sum, d) => sum + (d.amount || 0), 0);
    }, [detail]);

    const detailTotalDebit = useMemo(() => {
        return detail.reduce((sum, d) => sum + (d.debit || 0), 0);
    }, [detail]);

    const detailTotalCredit = useMemo(() => {
        return detail.reduce((sum, d) => sum + (d.credit || 0), 0);
    }, [detail]);

    return (
        <div className="bg-slate-50/90 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 p-2 sm:p-2.5 space-y-1.5 my-1 shadow-xs">
            {/* Header info & Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                    <div className="p-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <IconListDetails className="w-3 h-3" />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            Rincian: {parentName}
                        </h5>
                        <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 block">
                            {detail.length} kategori
                        </span>
                    </div>
                </div>

                {detail.length > 4 && (
                    <div className="relative w-full sm:w-40">
                        <IconSearch className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kategori..."
                            className="w-full text-[10px] pl-6 pr-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                        />
                    </div>
                )}
            </div>

            {/* Mobile: Card list — Desktop: Table */}
            {isMobile ? (
                <div className="space-y-1 max-h-52 overflow-y-auto">
                    {filteredDetail.length === 0 ? (
                        <p className="py-2 text-center text-slate-400 dark:text-slate-500 italic text-[10px]">
                            Tidak ada kategori yang cocok.
                        </p>
                    ) : (
                        filteredDetail.map((d, dIdx) => {
                            const absParent = Math.abs(parentAmount) || 1;
                            const portion = Math.min(100, Math.max(0, (Math.abs(d.amount) / absParent) * 100));
                            const formattedPortion =
                                portion > 0 && portion < 0.1
                                    ? "< 0.1%"
                                    : `${portion.toFixed(portion % 1 === 0 ? 0 : 1)}%`;
                            return (
                                <div
                                    key={`${d.kategori}-${dIdx}`}
                                    className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60"
                                >
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 block truncate">
                                            {d.kategori || "Tanpa Kategori"}
                                        </span>
                                        {showDebitCredit && (
                                            <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                                                <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                    D: {d.debit ? formatRupiah(d.debit) : "0"}
                                                </span>
                                                <span className="text-rose-600 dark:text-rose-400 tabular-nums">
                                                    K: {d.credit ? formatRupiah(d.credit) : "0"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100 tabular-nums block">
                                            {formatRupiah(d.amount)}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500">
                                            {formattedPortion}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {/* Mobile total */}
                    <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Total ({detail.length})
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
                            {formatRupiah(detailTotalAmount)}
                        </span>
                    </div>
                </div>
            ) : (
                /* Desktop: Table */
                <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-xs">
                    <table className="w-full text-left text-[10px] border-collapse">
                        <thead className="sticky top-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-xs text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none z-10">
                            <tr>
                                <th className="py-1 px-2.5">Kategori</th>
                                {showDebitCredit && (
                                    <>
                                        <th className="py-1 px-2.5 text-right">Debit</th>
                                        <th className="py-1 px-2.5 text-right">Kredit</th>
                                    </>
                                )}
                                <th className="py-1 px-2.5 text-right">Saldo Bersih</th>
                                <th className="py-1 px-2.5 text-right w-16">Porsi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-medium">
                            {filteredDetail.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={showDebitCredit ? 5 : 3}
                                        className="py-2.5 text-center text-slate-400 dark:text-slate-500 italic text-[10px]"
                                    >
                                        Tidak ada kategori yang cocok.
                                    </td>
                                </tr>
                            ) : (
                                filteredDetail.map((d, dIdx) => {
                                    const absParent = Math.abs(parentAmount) || 1;
                                    const portion = Math.min(100, Math.max(0, (Math.abs(d.amount) / absParent) * 100));
                                    const formattedPortion =
                                        portion > 0 && portion < 0.1
                                            ? "< 0.1%"
                                            : `${portion.toFixed(portion % 1 === 0 ? 0 : 1)}%`;

                                    return (
                                        <tr
                                            key={`${d.kategori}-${dIdx}`}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors"
                                        >
                                            <td className="py-1 px-2.5 text-slate-700 dark:text-slate-200 font-semibold">
                                                {d.kategori || "Tanpa Kategori"}
                                            </td>
                                            {showDebitCredit && (
                                                <>
                                                    <td className="py-1 px-2.5 text-right text-emerald-600 dark:text-emerald-400 tabular-nums text-[9px]">
                                                        {d.debit ? formatRupiah(d.debit) : "Rp 0"}
                                                    </td>
                                                    <td className="py-1 px-2.5 text-right text-rose-600 dark:text-rose-400 tabular-nums text-[9px]">
                                                        {d.credit ? formatRupiah(d.credit) : "Rp 0"}
                                                    </td>
                                                </>
                                            )}
                                            <td className="py-1 px-2.5 text-right font-bold text-slate-800 dark:text-slate-100 tabular-nums text-[10px]">
                                                {formatRupiah(d.amount)}
                                            </td>
                                            <td className="py-1 px-2.5 text-right tabular-nums">
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                                    {formattedPortion}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-900 font-bold border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-10 text-[9px]">
                            <tr>
                                <td className="py-1 px-2.5 uppercase text-slate-500 dark:text-slate-400">
                                    Total ({detail.length})
                                </td>
                                {showDebitCredit && (
                                    <>
                                        <td className="py-1 px-2.5 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            {formatRupiah(detailTotalDebit)}
                                        </td>
                                        <td className="py-1 px-2.5 text-right text-rose-600 dark:text-rose-400 tabular-nums">
                                            {formatRupiah(detailTotalCredit)}
                                        </td>
                                    </>
                                )}
                                <td className="py-1 px-2.5 text-right text-slate-800 dark:text-slate-100 tabular-nums font-bold">
                                    {formatRupiah(detailTotalAmount)}
                                </td>
                                <td className="py-1 px-2.5 text-right text-slate-400">
                                    100%
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}

interface BalanceSheetSectionCardProps {
    title: string;
    description?: string;
    items: {
        uid?: string;
        kode: string | null;
        nama: string;
        amount: number;
        debit?: number;
        credit?: number;
        detail?: BalanceSheetDetailCategory[];
    }[];
    total: number;
    accentColor: "emerald" | "amber" | "indigo";
    totalLabel: string;
    icon: React.ReactNode;
    showDebitCredit?: boolean;
    isEditing?: boolean;
    compact?: boolean;
    sectionKey?: "assets" | "liabilities" | "equity" | "revenue" | "expense";
    coaList?: ChartOfAccount[];
}

export function BalanceSheetSectionCard({
    title,
    items = [],
    total,
    accentColor,
    totalLabel,
    icon,
    showDebitCredit = true,
}: BalanceSheetSectionCardProps) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleRow = (key: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const borderColors = {
        emerald: "border-t-emerald-500",
        amber: "border-t-amber-500",
        indigo: "border-t-indigo-500",
    };

    const bgTotals = {
        emerald:
            "bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30",
        amber: "bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-100 dark:border-amber-900/30",
        indigo: "bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30",
    };

    // If there are no CoA items in items array, DO NOT display this card!
    if (items.length === 0) {
        return null;
    }

    const totalDebit = items.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = items.reduce((sum, item) => sum + (item.credit || 0), 0);

    const fmtLedger = (n: number) => (n ? formatRupiah(n) : "Rp 0");

    return (
        <Card
            className={cn(
                "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden border-t-2",
                borderColors[accentColor]
            )}
        >
            {/* Ultra-Compact Card Header */}
            <div className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-slate-50/60 dark:bg-slate-950/30">
                <div className="flex items-center gap-1.5 min-w-0">
                    {icon}
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider truncate">
                        {title}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.2 rounded-full shrink-0">
                        {items.length}
                    </span>
                </div>
                {!showDebitCredit && (
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums shrink-0">
                        {formatRupiah(total)}
                    </span>
                )}
            </div>

            <CardContent className="p-0">
                {/* MOBILE LAYOUT */}
                <div className="block md:hidden p-2 space-y-1">
                    {items.map((item, idx) => {
                        const percentVal = total > 0 ? (item.amount / total) * 100 : 0;
                        const formattedPercent =
                            percentVal > 0 && percentVal < 0.1
                                ? "< 0.1%"
                                : `${percentVal.toFixed(percentVal % 1 === 0 ? 0 : 1)}%`;

                        const itemKey = `${item.uid || item.kode || item.nama}-${idx}`;
                        const isExpanded = !!expandedRows[itemKey];
                        const hasDetail = Array.isArray(item.detail) && item.detail.length > 0;

                        return (
                            <Fragment key={itemKey}>
                                <div className="rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-950/30 overflow-hidden">
                                    <div className="px-2 pt-1.5 pb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.2 rounded shrink-0">
                                                {item.kode ?? "-"}
                                            </span>
                                            {getAccountIcon(item.nama)}
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
                                                {item.nama}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-2 pb-1.5 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            {hasDetail && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleRow(itemKey)}
                                                    className={cn(
                                                        "h-4.5 px-1.5 text-[9px] font-bold rounded-md flex items-center gap-0.5 shrink-0 border transition-all cursor-pointer select-none",
                                                        isExpanded
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                                            : "bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40"
                                                    )}
                                                >
                                                    <span>
                                                        {isExpanded ? "Tutup" : `Detail (${item.detail!.length})`}
                                                    </span>
                                                    <IconChevronDown
                                                        className={cn(
                                                            "w-2.5 h-2.5 transition-transform duration-200",
                                                            isExpanded && "rotate-180"
                                                        )}
                                                    />
                                                </Button>
                                            )}
                                            {showDebitCredit && (
                                                <div className="flex items-center gap-1.5 text-[9px]">
                                                    <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                        D: {fmtLedger(item.debit || 0)}
                                                    </span>
                                                    <span className="text-rose-600 dark:text-rose-400 tabular-nums">
                                                        K: {fmtLedger(item.credit || 0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 tabular-nums block">
                                                {formatRupiah(item.amount)}
                                            </span>
                                            {!showDebitCredit && percentVal > 0 && (
                                                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold">
                                                    {formattedPercent}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded detail (mobile) */}
                                {isExpanded && hasDetail && (
                                    <div className="pl-1">
                                        <BalanceSheetItemDetailTable
                                            detail={item.detail!}
                                            parentAmount={item.amount}
                                            parentName={item.nama}
                                            showDebitCredit={showDebitCredit}
                                        />
                                    </div>
                                )}
                            </Fragment>
                        );
                    })}

                    {/* Mobile total footer */}
                    <div
                        className={cn(
                            "rounded-lg px-2 py-1.5 border font-extrabold text-[10px] flex items-center justify-between select-none",
                            bgTotals[accentColor]
                        )}
                    >
                        <span className="text-[8px] font-extrabold uppercase tracking-wider">
                            {totalLabel}
                        </span>
                        <span className="tabular-nums font-mono font-bold">{formatRupiah(total)}</span>
                    </div>
                </div>

                {/* DESKTOP TABLE LAYOUT */}
                <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[9px] font-bold uppercase tracking-wider text-slate-400 select-none bg-slate-50/40 dark:bg-slate-950/20">
                                <th className="py-1.5 px-3 sm:px-3.5 w-[100px] text-left">Kode Akun</th>
                                <th className="py-1.5 px-3 sm:px-3.5 text-left">Nama Akun</th>
                                {showDebitCredit && (
                                    <>
                                        <th className="py-1.5 px-3 text-right w-[120px]">Debit</th>
                                        <th className="py-1.5 px-3 text-right w-[120px]">Kredit</th>
                                    </>
                                )}
                                <th className="py-1.5 px-3 sm:px-3.5 text-right w-[135px]">Saldo Bersih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40">
                            {items.map((item, idx) => {
                                const percentVal = total > 0 ? (item.amount / total) * 100 : 0;
                                const formattedPercent =
                                    percentVal > 0 && percentVal < 0.1
                                        ? "< 0.1%"
                                        : `${percentVal.toFixed(percentVal % 1 === 0 ? 0 : 1)}%`;

                                const itemKey = `${item.uid || item.kode || item.nama}-${idx}`;
                                const isExpanded = !!expandedRows[itemKey];
                                const hasDetail = Array.isArray(item.detail) && item.detail.length > 0;

                                return (
                                    <Fragment key={itemKey}>
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                            <td className="py-1.5 px-3 sm:px-3.5 text-left">
                                                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/60 shrink-0 inline-block">
                                                    {item.kode ?? "-"}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-3 sm:px-3.5 text-left">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        {getAccountIcon(item.nama)}
                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                                            {item.nama}
                                                        </span>
                                                    </div>

                                                    {hasDetail && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRow(itemKey)}
                                                            className={cn(
                                                                "h-4.5 px-1.5 text-[9px] font-bold rounded-md flex items-center gap-0.5 shrink-0 border transition-all cursor-pointer select-none",
                                                                isExpanded
                                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                                                    : "bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40"
                                                            )}
                                                        >
                                                            <span>
                                                                {isExpanded
                                                                    ? "Tutup"
                                                                    : `Detail (${item.detail!.length})`}
                                                            </span>
                                                            <IconChevronDown
                                                                className={cn(
                                                                    "w-2.5 h-2.5 transition-transform duration-200",
                                                                    isExpanded && "rotate-180"
                                                                )}
                                                            />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>

                                            {showDebitCredit && (
                                                <>
                                                    <td className="py-1.5 px-3 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                        {fmtLedger(item.debit || 0)}
                                                    </td>
                                                    <td className="py-1.5 px-3 text-right text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                                                        {fmtLedger(item.credit || 0)}
                                                    </td>
                                                </>
                                            )}
                                            <td className="py-1.5 px-3 sm:px-3.5 text-right text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span>{formatRupiah(item.amount)}</span>
                                                    {!showDebitCredit && percentVal > 0 && (
                                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">
                                                            ({formattedPercent})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {isExpanded && hasDetail && (
                                            <tr className="bg-transparent">
                                                <td
                                                    colSpan={showDebitCredit ? 5 : 3}
                                                    className="p-1 sm:px-3.5 sm:py-1.5"
                                                >
                                                    <BalanceSheetItemDetailTable
                                                        detail={item.detail!}
                                                        parentAmount={item.amount}
                                                        parentName={item.nama}
                                                        showDebitCredit={showDebitCredit}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr
                                className={cn(
                                    "border-t font-extrabold text-xs select-none",
                                    bgTotals[accentColor]
                                )}
                            >
                                <td colSpan={2} className="py-2 px-3 sm:px-3.5 text-left text-[9px] font-extrabold uppercase tracking-wider">
                                    {totalLabel}
                                </td>
                                {showDebitCredit && (
                                    <>
                                        <td className="py-2 px-3 text-right text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            {fmtLedger(totalDebit)}
                                        </td>
                                        <td className="py-2 px-3 text-right text-xs font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                                            {fmtLedger(totalCredit)}
                                        </td>
                                    </>
                                )}
                                <td className="py-2 px-3 sm:px-3.5 text-right text-xs font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
                                    {formatRupiah(total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
