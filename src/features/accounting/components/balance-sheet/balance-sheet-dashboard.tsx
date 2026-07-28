"use client";

import { Button } from "@/components/ui/button";
import type { BalanceSheetData, ChartOfAccount } from "@/features/accounting/types";
import { cn } from "@/lib/utils";
import { useBalanceSheetStore } from "@/stores/balance-sheet-store";
import {
    IconCoin,
    IconEdit,
    IconPrinter,
    IconTrendingUp,
    IconWallet
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormSwitch } from "@/components/forms/form-switch";
import { PrintConfirmDialog } from "@/features/reports/components/print-confirm-dialog";

import { BalanceSheetDraftBanner } from "./balance-sheet-draft-banner";
import { BalanceSheetHeaderFilters } from "./balance-sheet-header-filters";
import { BalanceSheetSectionCard } from "./balance-sheet-section-card";
import { BalanceSheetStatusCard } from "./balance-sheet-status-card";

interface BalanceSheetPrintFilterValues {
    paperSize: string;
    orientation: string;
    asOfDate: string;
    startDate?: string;
    endDate?: string;
    detailRevenue: boolean;
    detailExpense: boolean;
    detailHpp: boolean;
}

interface BalanceSheetDashboardProps {
    asOfDate: string;
    onAsOfDateChange: (val: string) => void;
    data: BalanceSheetData | undefined;
    flatAccounts: ChartOfAccount[] | undefined;
}

export function BalanceSheetDashboard({
    asOfDate,
    onAsOfDateChange,
    data,
    flatAccounts,
}: BalanceSheetDashboardProps) {
    const router = useRouter();

    const [viewType, setViewType] = useState<"standard" | "equation">("standard");
    const [showDebitCredit, setShowDebitCredit] = useState<boolean>(false);
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState<boolean>(false);

    const handlePrintConfirm = (formData: BalanceSheetPrintFilterValues) => {
        const params = new URLSearchParams();
        if (formData.asOfDate) params.append("as_of_date", formData.asOfDate);
        if (formData.startDate) params.append("start_date", formData.startDate);
        if (formData.endDate) params.append("end_date", formData.endDate);
        if (formData.paperSize) params.append("paper_size", formData.paperSize);
        if (formData.orientation) params.append("orientation", formData.orientation);

        params.append("detail_revenue", formData.detailRevenue ? "1" : "0");
        params.append("detail_expense", formData.detailExpense ? "1" : "0");
        params.append("detail_hpp", formData.detailHpp ? "1" : "0");

        const url = `/api/proxy/v1/reports/print/balance-sheet?${params.toString()}`;
        window.open(url, "_blank");
    };

    const {
        editedData,
        initializeData,
        reset: resetStore,
    } = useBalanceSheetStore();

    const hasDraft = !!editedData;

    const handleStartEditing = () => {
        if (!data || !flatAccounts) return;

        if (!editedData) {
            initializeData(data, flatAccounts);
        }
        router.push("/admin/accounting/balance-sheet?action=new");
    };

    // 1. Calculate section values (Assets, Liabilities, Equity, Revenue, Expense)
    const sectionsData = useMemo(() => {
        if (hasDraft && editedData) {
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
        };

        return fallback;
    }, [hasDraft, editedData, data]);

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
    } = sectionsData;

    // 2. Compute Net Income / SHU
    const shuData = data?.shu;
    const netIncome = useMemo(() => {
        if (shuData?.berjalan !== undefined) {
            return shuData.berjalan;
        }
        return totalRevenue - totalExpense;
    }, [shuData, totalRevenue, totalExpense]);

    const shuLalu = shuData?.lalu || 0;
    const shuLaluLabel = shuData?.lalu_label ? `SHU (${shuData.lalu_label})` : "SHU Tahun Lalu / Sebelumnya";
    const totalSHU = shuData?.total !== undefined ? shuData.total : (netIncome + shuLalu);

    // 3. Reorganize Equity in standard view to append SHU
    const equityItems = useMemo(() => {
        if (viewType === "standard") {
            const items = [...equity];
            if (shuData) {
                if (shuData.lalu !== 0) {
                    items.push({
                        uid: "synthetic-shu-lalu",
                        kode: null,
                        nama: shuLaluLabel,
                        amount: shuData.lalu,
                        debit: 0,
                        credit: shuData.lalu,
                    });
                }
                items.push({
                    uid: "synthetic-shu-berjalan",
                    kode: null,
                    nama: "SHU Tahun Berjalan",
                    amount: shuData.berjalan,
                    debit: totalExpense,
                    credit: totalRevenue,
                });
            } else {
                items.push({
                    uid: "synthetic-net-income",
                    kode: null,
                    nama: "SHU Tahun Berjalan",
                    amount: netIncome,
                    debit: totalExpense,
                    credit: totalRevenue,
                });
            }
            return items;
        }
        return equity;
    }, [equity, viewType, shuData, shuLaluLabel, netIncome, totalExpense, totalRevenue]);

    const finalEquityTotal = viewType === "standard" ? totalEquity + totalSHU : totalEquity;

    // 4. Compute balance metrics
    const { totalLeftVal, totalRightVal, isBalanced, difference } = useMemo(() => {
        if (viewType === "standard") {
            const leftVal = totalAssets;
            const rightVal = totalLiabilities + finalEquityTotal;
            const diff = Math.abs(leftVal - rightVal);
            return {
                totalLeftVal: leftVal,
                totalRightVal: rightVal,
                isBalanced: data?.is_balanced ?? (diff < 0.1),
                difference: diff,
            };
        } else {
            const leftVal = totalAssets + totalExpense;
            const rightVal = totalLiabilities + totalEquity + totalRevenue;
            const diff = Math.abs(leftVal - rightVal);
            return {
                totalLeftVal: leftVal,
                totalRightVal: rightVal,
                isBalanced: data?.is_balanced ?? (diff < 0.1),
                difference: diff,
            };
        }
    }, [viewType, totalAssets, totalLiabilities, finalEquityTotal, totalExpense, totalEquity, totalRevenue, data?.is_balanced]);

    return (
        <div className="space-y-6">
            {/* Header / Filtering Controls */}
            <BalanceSheetHeaderFilters
                asOfDate={asOfDate}
                onAsOfDateChange={onAsOfDateChange}
                viewType={viewType}
                onViewTypeChange={setViewType}
                showDebitCredit={showDebitCredit}
                onShowDebitCreditChange={setShowDebitCredit}
                extraAction={
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                        <Button
                            type="button"
                            onClick={() => setIsPrintDialogOpen(true)}
                            disabled={!data}
                            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs shadow-sm cursor-pointer transition-all"
                        >
                            <IconPrinter size={16} />
                            <span>Cetak PDF</span>
                        </Button>

                        {data && flatAccounts && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleStartEditing}
                                className="h-9 px-4 text-xs font-bold rounded-xl border-indigo-200 hover:border-indigo-300 dark:border-indigo-900/60 dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
                            >
                                <IconEdit className="w-3.5 h-3.5" />
                                {hasDraft ? "Lanjutkan Draf Neraca" : "Edit Neraca"}
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Warning draft banner */}
            {hasDraft && (
                <BalanceSheetDraftBanner
                    onDiscard={() => resetStore()}
                    onEdit={() => router.push("/admin/accounting/balance-sheet?action=new")}
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

            {/* Two-Column Assets vs Liabilities and Equity Grid */}
            <div className={cn("grid gap-6", showDebitCredit ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                {/* Left Side: Debit Column Assets & Expenses */}
                <div className="space-y-6">
                    <BalanceSheetSectionCard
                        title="Aset"
                        description="Harta kekayaan perusahaan termasuk kas, rekening bank, piutang, dan stok persediaan barang dagang."
                        items={assets}
                        total={totalAssets}
                        accentColor="emerald"
                        totalLabel="Total Aset"
                        icon={<IconWallet className="w-4.5 h-4.5 text-emerald-500" />}
                        isEditing={false}
                        showDebitCredit={showDebitCredit}
                        sectionKey="assets"
                        coaList={flatAccounts || []}
                    />

                    {viewType === "equation" && (
                        <BalanceSheetSectionCard
                            title="Beban (Expenses)"
                            description="Biaya-biaya operasional, pengeluaran administratif, beban pembelian, serta penyusutan aset."
                            items={expense}
                            total={totalExpense}
                            accentColor="amber"
                            totalLabel="Total Beban"
                            icon={<IconTrendingUp className="w-4.5 h-4.5 text-amber-500" />}
                            isEditing={false}
                            showDebitCredit={showDebitCredit}
                            sectionKey="expense"
                            coaList={flatAccounts || []}
                        />
                    )}
                </div>

                {/* Right Side: Credit Column Liabilities, Equity & Revenues */}
                <div className="space-y-6">
                    <BalanceSheetSectionCard
                        title="Kewajiban (Liabilitas)"
                        description="Kewajiban finansial jangka pendek dan jangka panjang perusahaan kepada pihak lain."
                        items={liabilities}
                        total={totalLiabilities}
                        accentColor="amber"
                        totalLabel="Total Kewajiban"
                        icon={<IconCoin className="w-4.5 h-4.5 text-amber-500" />}
                        isEditing={false}
                        showDebitCredit={showDebitCredit}
                        sectionKey="liabilities"
                        coaList={flatAccounts || []}
                    />

                    <BalanceSheetSectionCard
                        title="Ekuitas"
                        description="Modal pemilik perusahaan beserta laba ditahan dan laba berjalan hasil operasional."
                        items={equityItems}
                        total={finalEquityTotal}
                        accentColor="indigo"
                        totalLabel="Total Ekuitas"
                        icon={<IconTrendingUp className="w-4.5 h-4.5 text-indigo-500" />}
                        isEditing={false}
                        showDebitCredit={showDebitCredit}
                        sectionKey="equity"
                        coaList={flatAccounts || []}
                    />

                    {viewType === "equation" && (
                        <BalanceSheetSectionCard
                            title="Pendapatan (Revenues)"
                            description="Penerimaan dari omset hasil penjualan barang, pendapatan jasa, maupun penerimaan non-operasional."
                            items={revenue}
                            total={totalRevenue}
                            accentColor="indigo"
                            totalLabel="Total Pendapatan"
                            icon={<IconCoin className="w-4.5 h-4.5 text-indigo-500" />}
                            isEditing={false}
                            showDebitCredit={showDebitCredit}
                            sectionKey="revenue"
                            coaList={flatAccounts || []}
                        />
                    )}
                </div>
            </div>

            <PrintConfirmDialog<BalanceSheetPrintFilterValues>
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
                onConfirm={handlePrintConfirm}
                defaultValues={{
                    paperSize: "A4",
                    orientation: "portrait",
                    asOfDate: asOfDate,
                    startDate: "",
                    endDate: "",
                    detailRevenue: true,
                    detailExpense: true,
                    detailHpp: true,
                }}
            >
                <FormDatePicker<BalanceSheetPrintFilterValues>
                    name="asOfDate"
                    label="Per Tanggal (Cutoff)"
                    placeholder="Pilih Tanggal Cutoff..."
                    clearable={false}
                />

                <div className="space-y-2 pt-2">
                    <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Opsi Rincian Detail Halaman Cetak
                    </h5>
                    <FormSwitch<BalanceSheetPrintFilterValues>
                        name="detailRevenue"
                        label="Rincian Detail Pendapatan"
                    />
                    <FormSwitch<BalanceSheetPrintFilterValues>
                        name="detailExpense"
                        label="Rincian Detail Beban Operasional"
                    />
                    <FormSwitch<BalanceSheetPrintFilterValues>
                        name="detailHpp"
                        label="Rincian Detail Beban Pembelian (HPP)"
                    />
                </div>
            </PrintConfirmDialog>
        </div>
    );
}
