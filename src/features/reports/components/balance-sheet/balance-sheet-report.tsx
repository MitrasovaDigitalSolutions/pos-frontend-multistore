'use client'

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { useCreateManualJournal, useUpdateManualJournal, useManualJournalDetail } from "@/features/accounting/api/manual-journal-api";
import { useBalanceSheet } from "@/features/reports/api/reports-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { getThisMonthRange, formatUTC, todayStr } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useBalanceSheetStore } from "@/stores/balance-sheet-store";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
    IconBook,
    IconCheck,
    IconCoin,
    IconDeviceFloppy,
    IconEdit,
    IconLoader2,
    IconTrendingUp,
    IconWallet,
    IconX
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { BalanceSheetHeaderFilters } from "./balance-sheet-header-filters";
import { BalanceSheetSectionCard } from "./balance-sheet-section-card";
import { BalanceSheetSkeleton } from "./balance-sheet-skeleton";
import { BalanceSheetStatusCard } from "./balance-sheet-status-card";

interface ManualJournalDraftMeta {
    description: string;
    transaction_date: string;
}

export function BalanceSheetReport() {
    const [asOfDate, setAsOfDate] = useState<string>(() => getThisMonthRange().to);
    const searchParams = useSearchParams();
    const router = useRouter();
    const action = searchParams.get("action");
    const journalUid = searchParams.get("uid");

    const { data, isLoading, isError, refetch } = useBalanceSheet(asOfDate);
    const { data: flatAccounts } = useFlatChartOfAccounts();

    const { data: journal, isLoading: isJournalLoading } = useManualJournalDetail(
        (action === "edit" || action === "detail") && journalUid ? journalUid : null
    );

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
        reset: resetStore
    } = useBalanceSheetStore();

    const [hasInitializedJournal, setHasInitializedJournal] = useState(false);
    const [hasInitializedNew, setHasInitializedNew] = useState(false);

    const methods = useForm<ManualJournalDraftMeta>({
        defaultValues: {
            description: "Penyesuaian Neraca Keuangan",
            transaction_date: todayStr(),
        },
    });

    // Synchronize react-hook-form values to Zustand store
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

    const createJournalMutation = useCreateManualJournal();
    const updateJournalMutation = useUpdateManualJournal();

    // Initialize edit mode manually
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
            toast.info("Melanjutkan draf penyesuaian neraca yang disimpan.");
        }

        setEditing(true);
    };

    const hasDraft = !!editedData;
    const showDraft = isEditing || hasDraft;

    // Calculate metrics based on state (Edit vs View Mode or Draft Mode)
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalExpense = 0;
    let totalRevenue = 0;
    let totalLiabilitiesAndEquity = 0;
    let difference = 0;
    let isBalanced = false;

    if (showDraft && editedData) {
        totalAssets = editedData.assets.reduce((sum, item) => sum + (item.amount || 0), 0);
        totalLiabilities = editedData.liabilities.reduce((sum, item) => sum + (item.amount || 0), 0);
        totalEquity = editedData.equity.reduce((sum, item) => sum + (item.amount || 0), 0);
        totalExpense = editedData.expense.reduce((sum, item) => sum + (item.amount || 0), 0);
        totalRevenue = editedData.revenue.reduce((sum, item) => sum + (item.amount || 0), 0);

        const totalDebits = totalAssets + totalExpense;
        const totalCredits = totalLiabilities + totalEquity + totalRevenue;

        difference = Math.abs(totalDebits - totalCredits);
        isBalanced = difference === 0;
    } else if (data) {
        totalAssets = data.assets?.total_assets ?? 0;
        totalLiabilities = data.liabilities?.total_liabilities ?? 0;
        totalEquity = data.equity?.total_equity ?? 0;
        totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
        difference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
        isBalanced = data.is_balanced ?? false;
    }

    // Submit journal penyesuaian manual
    const handleSaveJournal = async (status: "draft" | "posted") => {
        if (!editedData) return;

        const journalDesc = description || "Penyesuaian Neraca Keuangan";
        const lines: { chart_of_account_uid: string; description: string; debit: number; credit: number }[] = [];

        const isEditingExisting = action === "edit" && !!journalUid;

        if (isEditingExisting) {
            // Replacing an existing journal: post the full edited sheet.
            const pushSection = (items: typeof editedData.assets, debitNormal: boolean) => {
                items.forEach((item) => {
                    if (item.amount !== 0) {
                        lines.push({
                            chart_of_account_uid: item.uid,
                            description: `${journalDesc} - ${item.nama}`,
                            debit: debitNormal ? Math.max(item.amount, 0) : Math.max(-item.amount, 0),
                            credit: debitNormal ? Math.max(-item.amount, 0) : Math.max(item.amount, 0),
                        });
                    }
                });
            };
            pushSection(editedData.assets, true);
            pushSection(editedData.expense, true);
            pushSection(editedData.liabilities, false);
            pushSection(editedData.equity, false);
            pushSection(editedData.revenue, false);
        } else {
            // New adjustment from the balance sheet: post ONLY the per-CoA delta vs the
            // originally fetched sheet. BalanceSheetService UNIONs manual_journal_lines with
            // general_ledger, so posting the full sheet would double-count every balance.
            const originalByKode: Record<string, number> = {};
            const record = (items?: { kode: string | null; amount?: number }[]) => {
                (items || []).forEach((it) => {
                    const key = it.kode ?? "__null__";
                    originalByKode[key] = (originalByKode[key] ?? 0) + (it.amount ?? 0);
                });
            };
            record(data?.assets?.items);
            record(data?.liabilities?.items);
            record(data?.equity?.items);

            const sections: Array<"assets" | "liabilities" | "equity" | "revenue" | "expense"> = [
                "assets", "liabilities", "equity", "revenue", "expense",
            ];
            for (const section of sections) {
                const items = editedData[section];
                const debitNormal = section === "assets" || section === "expense";
                for (const item of items) {
                    // Synthetic lines (e.g. Laba Rugi Berjalan, kode null) are derived, not adjustable.
                    if (item.kode === null) continue;
                    const original = originalByKode[item.kode] ?? 0;
                    const delta = (item.amount ?? 0) - original;
                    if (delta === 0) continue;
                    lines.push({
                        chart_of_account_uid: item.uid,
                        description: `${journalDesc} - ${item.nama}`,
                        debit: debitNormal ? Math.max(delta, 0) : Math.max(-delta, 0),
                        credit: debitNormal ? Math.max(-delta, 0) : Math.max(delta, 0),
                    });
                }
            }
        }

        if (lines.length === 0) {
            toast.error("Minimal harus ada satu akun dengan nominal bukan nol untuk diposting.");
            return;
        }

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
                toast.success(status === "posted" ? "Jurnal penyesuaian berhasil diposting!" : "Draf jurnal berhasil diperbarui!");
            } else {
                await createJournalMutation.mutateAsync({
                    transaction_date: formatUTC(transactionDate),
                    description: journalDesc,
                    status,
                    lines,
                });
                toast.success(status === "posted" ? "Jurnal penyesuaian berhasil diposting!" : "Draf jurnal berhasil disimpan!");
            }
            resetStore();
            refetch();
            if (action) {
                router.push("/admin/accounting/journals");
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal memposting jurnal.";
            toast.error(msg);
        }
    };

    if ((action === "edit" || action === "detail") && isJournalLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                <IconLoader2 className="animate-spin text-indigo-600" size={40} />
                <span className="text-sm font-semibold">Memuat Data Jurnal...</span>
            </div>
        );
    }

    if (action === "detail" && !journal) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                <p className="text-sm font-bold text-slate-800">Detail Jurnal Tidak Ditemukan</p>
                <Button onClick={() => router.push("/admin/accounting/journals")} size="sm" className="cursor-pointer">
                    Kembali ke Daftar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Filter Section */}
            {action === "detail" && journal ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <IconBook className="w-5 h-5 text-indigo-600" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                                Detail Jurnal Manual: {journal.reference_number}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Menampilkan pratinjau neraca keuangan dari entri jurnal ini.
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
                            className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                            Kembali ke Daftar
                        </Button>
                        {journal.status === "draft" && (
                            <Button
                                size="sm"
                                onClick={() => router.push(`/admin/accounting/balance-sheet?action=edit&uid=${journal.uid}`)}
                                className="h-9 px-4 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            >
                                <IconEdit className="w-3.5 h-3.5" />
                                Edit Jurnal
                            </Button>
                        )}
                    </div>
                </div>
            ) : !isEditing ? (
                <BalanceSheetHeaderFilters
                    asOfDate={asOfDate}
                    onAsOfDateChange={setAsOfDate}
                    extraAction={
                        data && flatAccounts && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleStartEditing}
                                className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                            >
                                <IconEdit className="w-3.5 h-3.5" />
                                Edit Neraca
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                        <IconBook className="w-5 h-5 text-indigo-600" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                                {action === "edit" ? "Edit Jurnal Manual" : "Mode Edit: Jurnal Penyesuaian"}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Sesuaikan nilai CoA di bawah. Perubahan Debit dan Kredit harus seimbang.
                            </p>
                        </div>
                    </div>

                    <Card className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <FormProvider {...methods}>
                            <div className="flex flex-col sm:flex-row items-end gap-4">
                                <div className="flex-1 w-full">
                                    <FormInput<ManualJournalDraftMeta>
                                        name="description"
                                        label="Deskripsi Jurnal *"
                                        placeholder="Deskripsi penyesuaian..."
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

            {isLoading && <BalanceSheetSkeleton />}

            {isError && (
                <div className="text-center p-12 text-destructive bg-rose-50/50 border border-rose-100 rounded-2xl">
                    <p className="font-bold">Gagal memuat data neraca.</p>
                    <p className="text-xs mt-1 text-rose-600/80">Pastikan koneksi internet stabil dan coba segarkan halaman.</p>
                </div>
            )}

            {action === "detail" && journal && (
                <Card className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <IconBook className="w-4 h-4 text-indigo-500" />
                            Informasi Jurnal Penyesuaian
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                        <div>
                            <span className="text-slate-400 font-medium block mb-0.5">No. Referensi</span>
                            <span className="font-mono font-bold text-slate-800">{journal.reference_number}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Tanggal Transaksi</span>
                            <span className="font-semibold text-slate-700">
                                {format(new Date(journal.transaction_date), "dd MMMM yyyy", { locale: localeId })}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Pembuat</span>
                            <span className="font-semibold text-slate-700">
                                {journal.creator?.name || journal.creator?.username || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Status</span>
                            <Badge className={cn("px-2 py-0.5 border text-[10px] font-semibold", 
                                journal.status === "draft" && "bg-slate-100 text-slate-700 border-slate-200",
                                journal.status === "posted" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                journal.status === "voided" && "bg-rose-50 text-rose-700 border-rose-200"
                            )} variant="outline">
                                {journal.status === "draft" && "Draft"}
                                {journal.status === "posted" && "Posted"}
                                {journal.status === "voided" && "Voided (Batal)"}
                            </Badge>
                        </div>
                    </div>
                    {journal.description && (
                        <div className="pt-3 border-t border-slate-50 text-xs">
                            <span className="text-slate-400 font-medium block mb-1">Keterangan Utama</span>
                            <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                                {journal.description}
                            </p>
                        </div>
                    )}
                </Card>
            )}

            {((data && !isLoading) || (showDraft && editedData)) && (
                <>
                    {/* Draft Warning Banner */}
                    {!isEditing && hasDraft && action !== "detail" && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 mb-6 animate-fade-in">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                <span>
                                    <strong>Mode Pratinjau Draf:</strong> Laporan di bawah menampilkan draf penyesuaian neraca yang belum diposting.
                                </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        resetStore();
                                        if (action) {
                                            router.push("/admin/accounting/journals");
                                        }
                                    }}
                                    className="h-8 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
                                >
                                    Buang Draf
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="h-8 px-3 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer"
                                >
                                    Edit Draf
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Status Card (Balances debits vs credits) */}
                    <BalanceSheetStatusCard
                        isBalanced={isBalanced}
                        totalAssets={showDraft ? (totalAssets + totalExpense) : totalAssets}
                        totalLiabilitiesAndEquity={showDraft ? (totalLiabilities + totalEquity + totalRevenue) : totalLiabilitiesAndEquity}
                        difference={difference}
                        leftLabel={showDraft ? "Total Debet (Aset + Beban)" : "Total Aset (A)"}
                        rightLabel={showDraft ? "Total Kredit (Liabilitas + Ekuitas + Pendapatan)" : "Kewajiban + Ekuitas (K + E)"}
                        leftLegend={showDraft ? "Debet" : "Aset"}
                        rightLegend={showDraft ? "Kredit" : "Kewajiban & Ekuitas"}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Side: Assets & Expenses (Debit Column) */}
                        <div className="space-y-6">
                            <BalanceSheetSectionCard
                                title="Aset"
                                description="Seluruh harta kekayaan, hak paten, persediaan barang, serta piutang dagang yang dikuasai oleh bisnis Anda."
                                items={showDraft && editedData ? editedData.assets : (data?.assets?.items || [])}
                                total={totalAssets}
                                accentColor="emerald"
                                totalLabel="Total Aset"
                                icon={<IconWallet className="w-4 text-emerald-500" />}
                                isEditing={isEditing}
                                sectionKey="assets"
                                coaList={flatAccounts || []}
                            />

                            {/* Expense section - visible in Edit Mode or when Draft is active */}
                            {showDraft && editedData && (
                                <BalanceSheetSectionCard
                                    title="Beban (Beban Operasional & Lain-lain)"
                                    description="Pengeluaran operasional, beban gaji, sewa, listrik, air, dan beban penyusutan lainnya dalam tahun berjalan."
                                    items={editedData.expense}
                                    total={totalExpense}
                                    accentColor="amber"
                                    totalLabel="Total Beban"
                                    icon={<IconTrendingUp className="w-4 text-amber-500" />}
                                    isEditing={isEditing}
                                    sectionKey="expense"
                                    coaList={flatAccounts || []}
                                />
                            )}
                        </div>

                        {/* Right Side: Liabilities, Equity & Revenues (Credit Column) */}
                        <div className="space-y-6">
                            <BalanceSheetSectionCard
                                title="Kewajiban (Liabilitas)"
                                description="Kewajiban finansial berupa utang usaha, pinjaman bank, atau kewajiban pembayaran lainnya kepada pihak luar."
                                items={showDraft && editedData ? editedData.liabilities : (data?.liabilities?.items || [])}
                                total={totalLiabilities}
                                accentColor="amber"
                                totalLabel="Total Kewajiban"
                                icon={<IconCoin className="w-4 text-amber-500" />}
                                isEditing={isEditing}
                                sectionKey="liabilities"
                                coaList={flatAccounts || []}
                            />

                            <BalanceSheetSectionCard
                                title="Ekuitas"
                                description="Modal bersih yang diinvestasikan oleh pemilik bisnis dan laba ditahan setelah dikurangi seluruh kewajiban."
                                items={showDraft && editedData ? editedData.equity : (data?.equity?.items || [])}
                                total={totalEquity}
                                accentColor="indigo"
                                totalLabel="Total Ekuitas"
                                icon={<IconTrendingUp className="w-4 text-indigo-500" />}
                                isEditing={isEditing}
                                sectionKey="equity"
                                coaList={flatAccounts || []}
                            />

                            {/* Revenue section - visible in Edit Mode or when Draft is active */}
                            {showDraft && editedData && (
                                <BalanceSheetSectionCard
                                    title="Pendapatan (Omset & Operasional)"
                                    description="Hasil penjualan produk, jasa, omset kotor, serta pendapatan non-operasional lainnya dalam tahun berjalan."
                                    items={editedData.revenue}
                                    total={totalRevenue}
                                    accentColor="indigo"
                                    totalLabel="Total Pendapatan"
                                    icon={<IconCoin className="w-4 text-indigo-500" />}
                                    isEditing={isEditing}
                                    sectionKey="revenue"
                                    coaList={flatAccounts || []}
                                />
                            )}
                        </div>
                    </div>

                    {/* Floating Sticky Action Bar */}
                    {isEditing && editedData && (
                        <div className="sticky bottom-4 z-50 w-full mt-6">
                            <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] rounded-2xl px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-5 transition-all duration-300">
                                {/* Left Side: Balance & Totals Status */}
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs w-full lg:w-auto">
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold uppercase tracking-wider text-[10px]",
                                        isBalanced
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-rose-50 text-rose-700 border-rose-100"
                                    )}>
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            isBalanced ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                                        )} />
                                        {isBalanced ? (
                                            "Seimbang (Balanced)"
                                        ) : (
                                            `Selisih: ${formatRupiah(difference)} (${(totalAssets + totalExpense) > (totalLiabilities + totalEquity + totalRevenue) ? "Kredit Kurang" : "Debet Kurang"})`
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 flex-wrap text-slate-600 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span>Total Debet:</span>
                                            <span className="font-bold text-slate-800 font-mono">
                                                {formatRupiah(totalAssets + totalExpense)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span>Total Kredit:</span>
                                            <span className="font-bold text-slate-800 font-mono">
                                                {formatRupiah(totalLiabilities + totalEquity + totalRevenue)}
                                            </span>
                                        </div>

                                        <div className="h-4 w-[1px] bg-slate-100 hidden sm:block" />
                                    </div>
                                </div>

                                {/* Right Side: Action Buttons */}
                                <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            resetStore();
                                            if (action) {
                                                router.push("/admin/accounting/journals");
                                            }
                                        }}
                                        className="h-10 px-4 text-xs font-bold rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                                        title="Batalkan semua perubahan dan buang draf"
                                    >
                                        <IconX className="w-3.5 h-3.5 text-slate-400" />
                                        Batal
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={createJournalMutation.isPending || updateJournalMutation.isPending}
                                        onClick={() => {
                                            if (action === "edit" || action === "new") {
                                                handleSaveJournal("draft");
                                            } else {
                                                setEditing(false);
                                                toast.success("Draf neraca berhasil disimpan di lokal.");
                                            }
                                        }}
                                        className="h-10 px-4 text-xs font-bold rounded-xl border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-indigo-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {(createJournalMutation.isPending || updateJournalMutation.isPending) ? (
                                            <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <IconDeviceFloppy className="w-3.5 h-3.5 text-indigo-500" />
                                        )}
                                        Simpan Draft
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={!isBalanced || !description || !transactionDate || createJournalMutation.isPending || updateJournalMutation.isPending}
                                        onClick={() => handleSaveJournal("posted")}
                                        className="h-10 px-5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer"
                                    >
                                        {(createJournalMutation.isPending || updateJournalMutation.isPending) ? (
                                            <>
                                                <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            <>
                                                <IconCheck className="w-3.5 h-3.5" />
                                                Posting Jurnal
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}




