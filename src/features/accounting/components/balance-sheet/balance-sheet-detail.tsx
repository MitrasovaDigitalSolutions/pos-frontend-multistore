"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { ManualJournal, ManualJournalLine } from "@/features/accounting/types/manual-journal";
import { cn } from "@/lib/utils";
import {
    IconArrowLeft,
    IconCoin,
    IconEdit,
    IconTrendingUp,
    IconWallet,
} from "@tabler/icons-react";

import { BalanceSheetJournalInfo } from "./balance-sheet-journal-info";
import { BalanceSheetSectionCard } from "./balance-sheet-section-card";

interface BalanceSheetDetailItem {
    uid: string;
    kode: string | null;
    nama: string;
    debit: number;
    credit: number;
    amount: number;
}

interface BalanceSheetDetailProps {
    journal: ManualJournal;
    flatAccounts: ChartOfAccount[];
}

export function BalanceSheetDetail({ journal, flatAccounts }: BalanceSheetDetailProps) {
    const router = useRouter();
    const [showDebitCredit, setShowDebitCredit] = useState<boolean>(true);

    const sectionsData = useMemo(() => {
        const assets: BalanceSheetDetailItem[] = [];
        const liabilities: BalanceSheetDetailItem[] = [];
        const equity: BalanceSheetDetailItem[] = [];
        const revenue: BalanceSheetDetailItem[] = [];
        const expense: BalanceSheetDetailItem[] = [];

        let sumDebit = 0;
        let sumCredit = 0;

        (journal.lines || []).forEach((line: ManualJournalLine) => {
            const debitVal = Number(line.debit) || 0;
            const creditVal = Number(line.credit) || 0;

            sumDebit += debitVal;
            sumCredit += creditVal;

            const matchedCoa = flatAccounts.find(
                (coa) => coa.uid === line.chart_of_account_uid || coa.kode === line.account?.kode
            );
            if (!matchedCoa) return;

            const tipe = matchedCoa.tipe;

            let amount = 0;
            if (tipe === "asset" || tipe === "expense") {
                amount = debitVal - creditVal;
            } else {
                amount = creditVal - debitVal;
            }

            const item: BalanceSheetDetailItem = {
                uid: matchedCoa.uid,
                kode: matchedCoa.kode,
                nama: matchedCoa.nama,
                debit: debitVal,
                credit: creditVal,
                amount,
            };

            if (tipe === "asset") assets.push(item);
            else if (tipe === "liability") liabilities.push(item);
            else if (tipe === "equity") equity.push(item);
            else if (tipe === "revenue") revenue.push(item);
            else if (tipe === "expense") expense.push(item);
        });

        const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
        const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
        const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);
        const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
        const totalExpense = expense.reduce((sum, item) => sum + item.amount, 0);

        return {
            assets,
            liabilities,
            equity,
            revenue,
            expense,
            totalAssets,
            totalLiabilities,
            totalEquity,
            totalRevenue,
            totalExpense,
            totalDebit: sumDebit,
            totalCredit: sumCredit,
        };
    }, [journal, flatAccounts]);

    const {
        assets,
        liabilities,
        equity,
        revenue,
        expense,
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalRevenue,
        totalExpense,
        totalDebit,
        totalCredit,
    } = sectionsData;

    const { isBalanced, difference } = useMemo(() => {
        const diff = Math.abs(totalDebit - totalCredit);
        return {
            isBalanced: diff < 0.01 && totalDebit > 0,
            difference: diff,
        };
    }, [totalDebit, totalCredit]);

    return (
        <div className="space-y-2.5">
            {/* Top Bar: Title, Reference Number, Status Badge, Detail D/K Toggle, and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/admin/accounting/journals")}
                        className="h-8 w-8 p-0 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="Kembali"
                    >
                        <IconArrowLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                            Detail Jurnal Penyesuaian
                        </h2>
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-900/60">
                            {journal.reference_number || "-"}
                        </span>
                        <Badge
                            className={cn(
                                "px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider",
                                journal.status === "draft" &&
                                    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
                                journal.status === "posted" &&
                                    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
                                journal.status === "voided" &&
                                    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                            )}
                            variant="outline"
                        >
                            {journal.status === "draft" && "Draft"}
                            {journal.status === "posted" && "Posted"}
                            {journal.status === "voided" && "Voided"}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
                        <span className="text-[11px] font-semibold hidden sm:inline">Detail D/K</span>
                        <Switch
                            size="sm"
                            checked={showDebitCredit}
                            onCheckedChange={setShowDebitCredit}
                        />
                    </label>

                    {journal.status === "draft" && (
                        <Button
                            size="sm"
                            onClick={() =>
                                router.push(`/admin/accounting/manual-journal?action=edit&uid=${journal.uid}`)
                            }
                            className="h-8 px-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                            <IconEdit className="w-3.5 h-3.5" />
                            <span>Edit Jurnal</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Ultra-Compact Unified Header Strip (Metadata + Live Balance Status + Debit/Credit Totals) */}
            <BalanceSheetJournalInfo
                journal={journal}
                showDebitCredit={showDebitCredit}
                onShowDebitCreditChange={setShowDebitCredit}
                totalDebit={totalDebit}
                totalCredit={totalCredit}
                isBalanced={isBalanced}
                difference={difference}
            />

            {/* Two-Column / Full-Width Section Cards Grid */}
            <div className={cn("grid gap-2.5 sm:gap-3", showDebitCredit ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                <div className="space-y-2.5 sm:space-y-3">
                    {assets.length > 0 && (
                        <BalanceSheetSectionCard
                            title="Aset"
                            items={assets}
                            total={totalAssets}
                            accentColor="emerald"
                            totalLabel="Total Aset"
                            icon={<IconWallet className="w-3.5 h-3.5 text-emerald-500" />}
                            isEditing={false}
                            showDebitCredit={showDebitCredit}
                            sectionKey="assets"
                            coaList={flatAccounts}
                        />
                    )}

                    {revenue.length > 0 && (
                        <BalanceSheetSectionCard
                            title="Pendapatan (Revenues)"
                            items={revenue}
                            total={totalRevenue}
                            accentColor="indigo"
                            totalLabel="Total Pendapatan"
                            icon={<IconCoin className="w-3.5 h-3.5 text-indigo-500" />}
                            isEditing={false}
                            showDebitCredit={showDebitCredit}
                            sectionKey="revenue"
                            coaList={flatAccounts}
                        />
                    )}
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                    {liabilities.length > 0 && (
                        <BalanceSheetSectionCard
                            title="Kewajiban (Liabilitas)"
                            items={liabilities}
                            total={totalLiabilities}
                            accentColor="amber"
                            totalLabel="Total Kewajiban"
                            icon={<IconCoin className="w-3.5 h-3.5 text-amber-500" />}
                            isEditing={false}
                            showDebitCredit={showDebitCredit}
                            sectionKey="liabilities"
                            coaList={flatAccounts}
                        />
                    )}

                    {equity.length > 0 && (
                        <BalanceSheetSectionCard
                            title="Ekuitas"
                            items={equity}
                            total={totalEquity}
                            accentColor="indigo"
                            totalLabel="Total Ekuitas"
                            icon={<IconTrendingUp className="w-3.5 h-3.5 text-indigo-500" />}
                            isEditing={false}
                            showDebitCredit={showDebitCredit}
                            sectionKey="equity"
                            coaList={flatAccounts}
                        />
                    )}

                    {expense.length > 0 && (
                        <BalanceSheetSectionCard
                            title="Beban (Expenses)"
                            items={expense}
                            total={totalExpense}
                            accentColor="amber"
                            totalLabel="Total Beban"
                            icon={<IconTrendingUp className="w-3.5 h-3.5 text-amber-500" />}
                            isEditing={false}
                            showDebitCredit={showDebitCredit}
                            sectionKey="expense"
                            coaList={flatAccounts}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
