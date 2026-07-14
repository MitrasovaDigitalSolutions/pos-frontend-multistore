"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { useBalanceSheetStore } from "@/stores/balance-sheet-store";
import { useCreateManualJournal, useUpdateManualJournal } from "@/features/accounting/api/manual-journal-api";
import { formatUTC, todayStr } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { ManualJournal } from "@/features/accounting/types/manual-journal";
import type { BalanceSheetData, BalanceSheetItem } from "@/features/reports/types";
import {
    IconBook,
    IconEdit,
    IconWallet,
    IconTrendingUp,
    IconCoin,
} from "@tabler/icons-react";

import { BalanceSheetHeaderFilters } from "./balance-sheet-header-filters";
import { BalanceSheetStatusCard } from "./balance-sheet-status-card";
import { BalanceSheetSectionCard } from "./balance-sheet-section-card";
import { BalanceSheetDraftBanner } from "./balance-sheet-draft-banner";
import { BalanceSheetFooterActions } from "./balance-sheet-footer-actions";
import { BalanceSheetJournalInfo } from "./balance-sheet-journal-info";

interface ManualJournalDraftMeta {
    description: string;
    transaction_date: string;
}

interface BalanceSheetDashboardProps {
    asOfDate: string;
    onAsOfDateChange: (val: string) => void;
    data: BalanceSheetData | undefined;
    flatAccounts: ChartOfAccount[] | undefined;
    journal: ManualJournal | undefined;
    action: string | null;
    journalUid: string | null;
    refetch: () => void;
}

export function BalanceSheetDashboard({
    asOfDate,
    onAsOfDateChange,
    data,
    flatAccounts,
    journal,
    action,
    journalUid,
    refetch,
}: BalanceSheetDashboardProps) {
    const router = useRouter();
    const createJournalMutation = useCreateManualJournal();
    const updateJournalMutation = useUpdateManualJournal();

    // State for interactive features
    const [viewType, setViewType] = useState<"standard" | "equation">("standard");
    const [showDebitCredit, setShowDebitCredit] = useState<boolean>(false);

    // Zustand store editor state
    const {
        isEditing,
        editedData,
        description,
        transactionDate,
        setEditing,
        initializeData,
        initializeFromJournal,
        setDescription,
        setTransactionDate,
        reset: resetStore,
    } = useBalanceSheetStore();

    const [hasInitializedJournal, setHasInitializedJournal] = useState(false);
    const [hasInitializedNew, setHasInitializedNew] = useState(false);

    const methods = useForm<ManualJournalDraftMeta>({
        defaultValues: {
            description: "Penyesuaian Neraca Keuangan",
            transaction_date: todayStr(),
        },
    });

    // Synchronize form description and transaction date to Zustand store
    useEffect(() => {
        // eslint-disable-next-line react-hooks/incompatible-library
        const subscription = methods.watch((value) => {
            if (value.description !== undefined) {
                setDescription(value.description || "");
            }
            if (value.transaction_date !== undefined) {
                setTransactionDate(value.transaction_date || "");
            }
        });
        return () => subscription.unsubscribe();
    }, [methods, setDescription, setTransactionDate]);

    // Reset initialization guard when journal or action changes
    useEffect(() => {
        setHasInitializedJournal(false);
        setHasInitializedNew(false);
    }, [journalUid, action]);

    // Initialize edit mode for NEW adjustments
    useEffect(() => {
        if (action === "new" && data && flatAccounts && !hasInitializedNew) {
            initializeData(data, flatAccounts);
            methods.reset({
                description: "Penyesuaian Neraca Keuangan",
                transaction_date: asOfDate,
            });
            setEditing(true);
            setHasInitializedNew(true);
        }
    }, [action, data, flatAccounts, hasInitializedNew, initializeData, methods, asOfDate, setEditing]);

    // Initialize edit/detail/view modes for EXISTING manual journal
    useEffect(() => {
        if ((action === "edit" || action === "detail") && journal && flatAccounts && !hasInitializedJournal) {
            initializeFromJournal(journal, flatAccounts);
            methods.reset({
                description: journal.description || "Penyesuaian Neraca Keuangan",
                transaction_date: journal.transaction_date ? journal.transaction_date.substring(0, 10) : todayStr(),
            });
            setHasInitializedJournal(true);

            if (action === "detail") {
                setEditing(false);
            }
        }
    }, [action, journal, flatAccounts, hasInitializedJournal, initializeFromJournal, methods, setEditing]);

    // Reset editing state and store if action is not edit or new
    useEffect(() => {
        if (action !== "new" && action !== "edit") {
            setEditing(false);
            if (action !== "detail") {
                resetStore();
            }
        }
    }, [action, setEditing, resetStore]);

    const handleStartEditing = () => {
        if (!data || !flatAccounts) return;

        if (!editedData) {
            initializeData(data, flatAccounts);
            methods.reset({
                description: "Penyesuaian Neraca Keuangan",
                transaction_date: asOfDate,
            });
        } else {
            methods.reset({
                description: description || "Penyesuaian Neraca Keuangan",
                transaction_date: transactionDate || asOfDate,
            });
            toast.info("Melanjutkan draf penyesuaian neraca.");
        }

        setEditing(true);
    };

    const hasDraft = !!editedData;
    const showDraft = isEditing || hasDraft;

    // 1. Calculate section values (Assets, Liabilities, Equity, Revenue, Expense)
    const sectionsData = useMemo(() => {
        if (showDraft && editedData) {
            return {
                assets: editedData.assets,
                liabilities: editedData.liabilities,
                equity: editedData.equity,
                revenue: editedData.revenue,
                expense: editedData.expense,
                totalAssets: editedData.assets.reduce((sum, item) => sum + (item.amount || 0), 0),
                totalLiabilities: editedData.liabilities.reduce((sum, item) => sum + (item.amount || 0), 0),
                totalEquity: editedData.equity.reduce((sum, item) => sum + (item.amount || 0), 0),
                totalRevenue: editedData.revenue.reduce((sum, item) => sum + (item.amount || 0), 0),
                totalExpense: editedData.expense.reduce((sum, item) => sum + (item.amount || 0), 0),
                totalDebitVal: [...editedData.assets, ...editedData.expense].reduce((sum, item) => sum + (item.debit || 0), 0),
                totalCreditVal: [...editedData.liabilities, ...editedData.equity, ...editedData.revenue].reduce((sum, item) => sum + (item.credit || 0), 0),
            };
        }

        const fallback = {
            assets: data?.assets?.items || [],
            liabilities: data?.liabilities?.items || [],
            equity: data?.equity?.items || [],
            revenue: data?.revenue?.items || [],
            expense: data?.expense?.items || [],
            totalAssets: data?.assets?.total_assets || 0,
            totalLiabilities: data?.liabilities?.total_liabilities || 0,
            totalEquity: data?.equity?.total_equity || 0,
            totalRevenue: data?.revenue?.total_revenue || 0,
            totalExpense: data?.expense?.total_expense || 0,
            totalDebitVal: 0,
            totalCreditVal: 0,
        };

        // For original data view, sum up debit and credit properties for auditing format
        const itemsListDebit = [...fallback.assets, ...fallback.expense];
        const itemsListCredit = [...fallback.liabilities, ...fallback.equity, ...fallback.revenue];

        fallback.totalDebitVal = itemsListDebit.reduce((sum, item) => sum + (item.debit || 0), 0);
        fallback.totalCreditVal = itemsListCredit.reduce((sum, item) => sum + (item.credit || 0), 0);

        return fallback;
    }, [showDraft, editedData, data]);

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
        totalDebitVal,
        totalCreditVal,
    } = sectionsData;

    // 2. Compute Net Income (Laba Rugi Tahun Berjalan)
    const netIncome = useMemo(() => {
        return totalRevenue - totalExpense;
    }, [totalRevenue, totalExpense]);

    // 3. Reorganize Equity in standard view to append Laba Tahun Berjalan
    const equityItems = useMemo(() => {
        if (viewType === "standard") {
            const netIncomeItem = {
                uid: "synthetic-net-income",
                kode: null,
                nama: "Laba (Rugi) Tahun Berjalan",
                amount: netIncome,
                debit: totalExpense,
                credit: totalRevenue,
            };
            return [...equity, netIncomeItem];
        }
        return equity;
    }, [equity, viewType, netIncome, totalExpense, totalRevenue]);

    const finalEquityTotal = viewType === "standard" ? totalEquity + netIncome : totalEquity;

    // 4. Compute balance metrics
    const { totalLeftVal, totalRightVal, isBalanced, difference } = useMemo(() => {
        if (viewType === "standard") {
            const leftVal = totalAssets;
            const rightVal = totalLiabilities + finalEquityTotal;
            const diff = Math.abs(leftVal - rightVal);
            return {
                totalLeftVal: leftVal,
                totalRightVal: rightVal,
                // Due to floats, check difference <= 0.01 for balance
                isBalanced: diff < 0.1,
                difference: diff,
            };
        } else {
            const leftVal = totalAssets + totalExpense;
            const rightVal = totalLiabilities + totalEquity + totalRevenue;
            const diff = Math.abs(leftVal - rightVal);
            return {
                totalLeftVal: leftVal,
                totalRightVal: rightVal,
                isBalanced: diff < 0.1,
                difference: diff,
            };
        }
    }, [viewType, totalAssets, totalLiabilities, finalEquityTotal, totalExpense, totalEquity, totalRevenue]);

    // Save adjustment journal line items
    const handleSaveJournal = async (status: "draft" | "posted") => {
        if (!editedData) return;

        const journalDesc = description || "Penyesuaian Neraca Keuangan";
        const lines: { chart_of_account_uid: string; description: string; debit: number; credit: number }[] = [];

        const isEditingExisting = action === "edit" && !!journalUid;

        if (isEditingExisting) {
            // Edit mode: post the full sheet values
            const pushSection = (items: typeof editedData.assets) => {
                items.forEach((item) => {
                    const debitVal = item.debit || 0;
                    const creditVal = item.credit || 0;
                    if (debitVal !== 0 || creditVal !== 0) {
                        lines.push({
                            chart_of_account_uid: item.uid,
                            description: `${journalDesc} - ${item.nama}`,
                            debit: debitVal,
                            credit: creditVal,
                        });
                    }
                });
            };
            pushSection(editedData.assets);
            pushSection(editedData.expense);
            pushSection(editedData.liabilities);
            pushSection(editedData.equity);
            pushSection(editedData.revenue);
        } else {
            // New adjustment: post delta values only vs original database values
            const originalByKode: Record<string, { debit: number; credit: number }> = {};
            const recordOriginals = (items?: BalanceSheetItem[]) => {
                (items || []).forEach((it) => {
                    const key = it.kode ?? "__null__";
                    originalByKode[key] = {
                        debit: it.debit || 0,
                        credit: it.credit || 0,
                    };
                });
            };

            recordOriginals(data?.assets?.items);
            recordOriginals(data?.liabilities?.items);
            recordOriginals(data?.equity?.items);
            recordOriginals(data?.revenue?.items);
            recordOriginals(data?.expense?.items);

            const sectionsKeys: Array<"assets" | "liabilities" | "equity" | "revenue" | "expense"> = [
                "assets", "liabilities", "equity", "revenue", "expense",
            ];

            for (const section of sectionsKeys) {
                const items = editedData[section];
                for (const item of items) {
                    if (item.kode === null) continue; // Skip synthetic Laba Rugi codes
                    const orig = originalByKode[item.kode] || { debit: 0, credit: 0 };
                    
                    const deltaDebit = (item.debit || 0) - orig.debit;
                    const deltaCredit = (item.credit || 0) - orig.credit;

                    if (deltaDebit === 0 && deltaCredit === 0) continue;

                    lines.push({
                        chart_of_account_uid: item.uid,
                        description: `${journalDesc} - ${item.nama}`,
                        debit: deltaDebit >= 0 ? deltaDebit : 0,
                        credit: deltaCredit >= 0 ? deltaCredit : 0,
                    });
                }
            }
        }

        if (lines.length === 0) {
            toast.error("Minimal harus ada satu akun dengan debit/kredit bukan nol untuk disimpan.");
            return;
        }

        const isSavingPending = createJournalMutation.isPending || updateJournalMutation.isPending;
        if (isSavingPending) return;

        try {
            if (action === "edit" && journalUid) {
                await updateJournalMutation.mutateAsync({
                    uid: journalUid,
                    data: {
                        transaction_date: formatUTC(transactionDate),
                        description: journalDesc,
                        status,
                        lines,
                    },
                });
                toast.success(status === "posted" ? "Jurnal penyesuaian diposting!" : "Draf jurnal diperbarui!");
            } else {
                await createJournalMutation.mutateAsync({
                    transaction_date: formatUTC(transactionDate),
                    description: journalDesc,
                    status,
                    lines,
                });
                toast.success(status === "posted" ? "Jurnal penyesuaian diposting!" : "Draf jurnal disimpan!");
            }
            resetStore();
            refetch();
            if (action) {
                router.push("/admin/accounting/journals");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal menyimpan jurnal.";
            toast.error(msg);
        }
    };

    const isPending = createJournalMutation.isPending || updateJournalMutation.isPending;

    return (
        <div className="space-y-6">
            {/* Header / Filtering Controls */}
            {action === "detail" && journal ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <IconBook className="w-5 h-5 text-indigo-500" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                Detail Jurnal Penyesuaian: {journal.reference_number}
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                Menampilkan tinjauan neraca keuangan untuk entri jurnal ini.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                resetStore();
                                router.push("/admin/accounting/journals");
                            }}
                            className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-850 dark:bg-slate-900 text-slate-700 dark:text-slate-350 cursor-pointer"
                        >
                            Kembali
                        </Button>
                        {journal.status === "draft" && (
                            <Button
                                size="sm"
                                onClick={() => router.push(`/admin/accounting/balance-sheet?action=edit&uid=${journal.uid}`)}
                                className="h-9 px-4 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                            >
                                <IconEdit className="w-3.5 h-3.5 mr-1" />
                                Edit Jurnal
                            </Button>
                        )}
                    </div>
                </div>
            ) : !isEditing ? (
                <BalanceSheetHeaderFilters
                    asOfDate={asOfDate}
                    onAsOfDateChange={onAsOfDateChange}
                    viewType={viewType}
                    onViewTypeChange={setViewType}
                    showDebitCredit={showDebitCredit}
                    onShowDebitCreditChange={setShowDebitCredit}
                    extraAction={
                        data && flatAccounts && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleStartEditing}
                                className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
                            >
                                <IconEdit className="w-3.5 h-3.5 mr-1" />
                                Edit Neraca
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
                        <IconBook className="w-5 h-5 text-indigo-500" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                {action === "edit" ? "Edit Jurnal Penyesuaian" : "Mode Edit: Jurnal Penyesuaian"}
                            </h2>
                            <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                                Masukkan nominal Debit dan Kredit untuk masing-masing akun. Nilai total selisih harus nol.
                            </p>
                        </div>
                    </div>

                    <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/85 rounded-2xl shadow-sm">
                        <FormProvider {...methods}>
                            <div className="flex flex-col sm:flex-row items-end gap-4">
                                <div className="flex-1 w-full">
                                    <FormInput<ManualJournalDraftMeta>
                                        name="description"
                                        label="Deskripsi Jurnal Penyesuaian *"
                                        placeholder="Deskripsi penyesuaian keuangan..."
                                    />
                                </div>
                                <div className="w-full sm:w-[200px]">
                                    <FormDatePicker<ManualJournalDraftMeta>
                                        name="transaction_date"
                                        label="Tanggal Jurnal *"
                                    />
                                </div>
                            </div>
                        </FormProvider>
                    </Card>
                </div>
            )}

            {/* Read-Only Journal Metadata Display */}
            {action === "detail" && journal && <BalanceSheetJournalInfo journal={journal} />}

            {/* Warning draft banner */}
            {!isEditing && hasDraft && action !== "detail" && (
                <BalanceSheetDraftBanner
                    onDiscard={() => {
                        resetStore();
                        if (action) {
                            router.push("/admin/accounting/journals");
                        }
                    }}
                    onEdit={() => setEditing(true)}
                />
            )}

            {/* Balance Status Visual Card */}
            <BalanceSheetStatusCard
                isBalanced={isBalanced}
                totalAssets={totalLeftVal}
                totalLiabilitiesAndEquity={totalRightVal}
                difference={difference}
                leftLabel={viewType === "standard" ? "Total Aset (A)" : "Total Aset + Beban (A + B)"}
                rightLabel={viewType === "standard" ? "Liabilitas + Ekuitas (L + E)" : "Liabilitas + Ekuitas + Pendapatan (L + E + P)"}
                leftLegend={viewType === "standard" ? "Aset" : "Aset & Beban"}
                rightLegend={viewType === "standard" ? "Kewajiban & Ekuitas" : "Liabilitas, Ekuitas & Pendapatan"}
            />

            {/* Two-Column Assets vs Liabilities and Equity Grid (collapses to 1-column on edit/detail mode for space) */}
            <div className={cn("grid gap-6", (showDebitCredit || isEditing) ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                {/* Left Side: Debit Column Assets & Expenses */}
                <div className="space-y-6">
                    {/* Aset Card */}
                    <BalanceSheetSectionCard
                        title="Aset"
                        description="Harta kekayaan perusahaan termasuk kas, rekening bank, piutang, dan stok persediaan barang dagang."
                        items={assets}
                        total={totalAssets}
                        accentColor="emerald"
                        totalLabel="Total Aset"
                        icon={<IconWallet className="w-4.5 h-4.5 text-emerald-500" />}
                        isEditing={isEditing}
                        showDebitCredit={showDebitCredit}
                        sectionKey="assets"
                        coaList={flatAccounts || []}
                    />

                    {/* Beban Card (Only displayed in equation view) */}
                    {viewType === "equation" && (
                        <BalanceSheetSectionCard
                            title="Beban (Expenses)"
                            description="Biaya-biaya operasional, pengeluaran administratif, beban pembelian, serta penyusutan aset."
                            items={expense}
                            total={totalExpense}
                            accentColor="amber"
                            totalLabel="Total Beban"
                            icon={<IconTrendingUp className="w-4.5 h-4.5 text-amber-500" />}
                            isEditing={isEditing}
                            showDebitCredit={showDebitCredit}
                            sectionKey="expense"
                            coaList={flatAccounts || []}
                        />
                    )}
                </div>

                {/* Right Side: Credit Column Liabilities, Equity & Revenues */}
                <div className="space-y-6">
                    {/* Kewajiban Card */}
                    <BalanceSheetSectionCard
                        title="Kewajiban (Liabilitas)"
                        description="Kewajiban finansial jangka pendek dan jangka panjang perusahaan kepada pihak lain."
                        items={liabilities}
                        total={totalLiabilities}
                        accentColor="amber"
                        totalLabel="Total Kewajiban"
                        icon={<IconCoin className="w-4.5 h-4.5 text-amber-500" />}
                        isEditing={isEditing}
                        showDebitCredit={showDebitCredit}
                        sectionKey="liabilities"
                        coaList={flatAccounts || []}
                    />

                    {/* Ekuitas Card */}
                    <BalanceSheetSectionCard
                        title="Ekuitas"
                        description="Modal pemilik perusahaan beserta laba ditahan dan laba berjalan hasil operasional."
                        items={equityItems}
                        total={finalEquityTotal}
                        accentColor="indigo"
                        totalLabel="Total Ekuitas"
                        icon={<IconTrendingUp className="w-4.5 h-4.5 text-indigo-500" />}
                        isEditing={isEditing}
                        showDebitCredit={showDebitCredit}
                        sectionKey="equity"
                        coaList={flatAccounts || []}
                    />

                    {/* Pendapatan Card (Only displayed in equation view) */}
                    {viewType === "equation" && (
                        <BalanceSheetSectionCard
                            title="Pendapatan (Revenues)"
                            description="Penerimaan dari omset hasil penjualan barang, pendapatan jasa, maupun penerimaan non-operasional."
                            items={revenue}
                            total={totalRevenue}
                            accentColor="indigo"
                            totalLabel="Total Pendapatan"
                            icon={<IconCoin className="w-4.5 h-4.5 text-indigo-500" />}
                            isEditing={isEditing}
                            showDebitCredit={showDebitCredit}
                            sectionKey="revenue"
                            coaList={flatAccounts || []}
                        />
                    )}
                </div>
            </div>

            {/* Sticky footer controls in edit mode */}
            {isEditing && editedData && (
                <BalanceSheetFooterActions
                    isBalanced={isBalanced}
                    difference={difference}
                    totalDebit={totalDebitVal}
                    totalCredit={totalCreditVal}
                    onCancel={() => {
                        resetStore();
                        if (action) {
                            router.push("/admin/accounting/journals");
                        }
                    }}
                    onSaveDraft={() => {
                        if (action === "edit" || action === "new") {
                            handleSaveJournal("draft");
                        } else {
                            setEditing(false);
                            toast.success("Draf neraca berhasil disimpan secara lokal.");
                        }
                    }}
                    onPost={() => handleSaveJournal("posted")}
                    isPending={isPending}
                    hasDescriptionAndDate={!!description && !!transactionDate}
                />
            )}
        </div>
    );
}
