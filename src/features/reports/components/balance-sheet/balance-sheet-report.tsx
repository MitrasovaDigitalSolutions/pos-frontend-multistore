"use client";

import { useState } from "react";
import { useBalanceSheet } from "@/features/reports/api/reports-api";
import { IconCoin, IconTrendingUp, IconWallet } from "@tabler/icons-react";
import { getThisMonthRange, getThisYearRange, getTodayRange } from "@/lib/date-utils";

import { BalanceSheetHeaderFilters } from "./balance-sheet-header-filters";
import { BalanceSheetSectionCard } from "./balance-sheet-section-card";
import { BalanceSheetSkeleton } from "./balance-sheet-skeleton";
import { BalanceSheetStatusCard } from "./balance-sheet-status-card";

export function BalanceSheetReport() {
    const [startDate, setStartDate] = useState<string>(() => getThisMonthRange().from);
    const [endDate, setEndDate] = useState<string>(() => getThisMonthRange().to);

    const { data, isLoading, isError } = useBalanceSheet(startDate, endDate);

    // Presets trigger
    const handlePresetChange = (preset: "today" | "thisMonth" | "thisYear") => {
        if (preset === "today") {
            const range = getTodayRange();
            setStartDate(range.from);
            setEndDate(range.to);
        } else if (preset === "thisMonth") {
            const range = getThisMonthRange();
            setStartDate(range.from);
            setEndDate(range.to);
        } else if (preset === "thisYear") {
            const range = getThisYearRange();
            setStartDate(range.from);
            setEndDate(range.to);
        }
    };

    // Calculate metrics
    const totalAssets = data?.assets?.total_assets ?? 0;
    const totalLiabilities = data?.liabilities?.total_liabilities ?? 0;
    const totalEquity = data?.equity?.total_equity ?? 0;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
    const isBalanced = data?.is_balanced ?? false;

    return (
        <div className="space-y-6">
            <BalanceSheetHeaderFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onPresetChange={handlePresetChange}
            />

            {isLoading && <BalanceSheetSkeleton />}

            {isError && (
                <div className="text-center p-12 text-destructive bg-rose-50/50 border border-rose-100 rounded-2xl">
                    <p className="font-bold">Gagal memuat data neraca.</p>
                    <p className="text-xs mt-1 text-rose-600/80">Pastikan koneksi internet stabil dan coba segarkan halaman.</p>
                </div>
            )}

            {data && !isLoading && (
                <>
                    <BalanceSheetStatusCard
                        isBalanced={isBalanced}
                        totalAssets={totalAssets}
                        totalLiabilitiesAndEquity={totalLiabilitiesAndEquity}
                        difference={difference}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Side: Assets */}
                        <div className="space-y-6">
                            <BalanceSheetSectionCard
                                title="Aset"
                                description="Seluruh harta kekayaan, hak paten, persediaan barang, serta piutang dagang yang dikuasai oleh bisnis Anda."
                                items={data.assets?.items}
                                total={totalAssets}
                                accentColor="emerald"
                                totalLabel="Total Aset"
                                icon={<IconWallet className="w-4 text-emerald-500" />}
                            />
                        </div>

                        {/* Right Side: Liabilities & Equities */}
                        <div className="space-y-6">
                            <BalanceSheetSectionCard
                                title="Kewajiban (Liabilitas)"
                                description="Kewajiban finansial berupa utang usaha, pinjaman bank, atau kewajiban pembayaran lainnya kepada pihak luar."
                                items={data.liabilities?.items}
                                total={totalLiabilities}
                                accentColor="amber"
                                totalLabel="Total Kewajiban"
                                icon={<IconCoin className="w-4 text-amber-500" />}
                            />

                            <BalanceSheetSectionCard
                                title="Ekuitas"
                                description="Modal bersih yang diinvestasikan oleh pemilik bisnis dan laba ditahan setelah dikurangi seluruh kewajiban."
                                items={data.equity?.items}
                                total={totalEquity}
                                accentColor="indigo"
                                totalLabel="Total Ekuitas"
                                icon={<IconTrendingUp className="w-4 text-indigo-500" />}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
