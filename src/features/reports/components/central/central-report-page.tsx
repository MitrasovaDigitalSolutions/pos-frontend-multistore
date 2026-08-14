"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { startOfMonthStr, todayStr } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
    useCentralOverview,
    useCentralStoresComparison,
    useCentralSalesTrend,
    useCentralInventory,
} from "../../api/central-reports-api";
import { CentralHeaderFilters, CentralFilterValues } from "./central-header-filters";
import { CentralOverviewTab } from "./central-overview-tab";
import { CentralStoresComparisonTab } from "./central-stores-comparison-tab";
import { CentralInventoryTab } from "./central-inventory-tab";
import { IconChartLine, IconBuildingStore, IconBox } from "@tabler/icons-react";

export function CentralReportPage() {
    const [activeTab, setActiveTab] = useState<string>("overview");
    const [byStore, setByStore] = useState<boolean>(false);

    const methods = useForm<CentralFilterValues>({
        defaultValues: {
            from: startOfMonthStr(),
            to: todayStr(),
            interval: "daily",
            storeUids: [],
        },
    });

    const [appliedFilters, setAppliedFilters] = useState<CentralFilterValues>({
        from: startOfMonthStr(),
        to: todayStr(),
        interval: "daily",
        storeUids: [],
    });

    const onSubmitFilter = (data: CentralFilterValues) => {
        setAppliedFilters(data);
    };

    const onResetFilter = () => {
        const defaults: CentralFilterValues = {
            from: startOfMonthStr(),
            to: todayStr(),
            interval: "daily",
            storeUids: [],
        };
        methods.reset(defaults);
        setAppliedFilters(defaults);
    };

    // Queries using appliedFilters
    const {
        data: overviewData,
        isLoading: isLoadingOverview,
        isFetching: isFetchingOverview,
        refetch: refetchOverview,
    } = useCentralOverview(appliedFilters.from, appliedFilters.to, appliedFilters.storeUids);

    const {
        data: storesData,
        isLoading: isLoadingStores,
        refetch: refetchStores,
    } = useCentralStoresComparison(appliedFilters.from, appliedFilters.to, appliedFilters.storeUids);

    const {
        data: trendData,
        isLoading: isLoadingTrend,
        refetch: refetchTrend,
    } = useCentralSalesTrend(
        appliedFilters.from,
        appliedFilters.to,
        appliedFilters.interval,
        byStore,
        appliedFilters.storeUids
    );

    const {
        data: inventoryData,
        isLoading: isLoadingInventory,
        refetch: refetchInventory,
    } = useCentralInventory(appliedFilters.storeUids);

    const handleRefetchAll = () => {
        refetchOverview();
        refetchStores();
        refetchTrend();
        refetchInventory();
    };

    return (
        <div className="space-y-4 sm:space-y-6 font-sans">
            {/* 1. Header Filter Bar (Compact & Responsive) */}
            <CentralHeaderFilters
                methods={methods}
                onSubmit={onSubmitFilter}
                onReset={onResetFilter}
                onRefetch={handleRefetchAll}
                isLoading={isLoadingOverview}
                isFetching={isFetchingOverview}
                appliedFilters={appliedFilters}
            />

            {/* 2. Unified Card Container wrapping Tab Navigation & Content */}
            <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Integrated Tab Navigation Header Bar */}
                    <div className="border-b border-slate-100 bg-slate-50/60 p-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <TabsList className="bg-slate-200/70 p-1 rounded-xl gap-1 flex-wrap sm:flex-nowrap h-auto border-0 w-full sm:w-auto">
                            <TabsTrigger
                                value="overview"
                                className={cn(
                                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 shadow-none flex-1 sm:flex-initial",
                                    activeTab === "overview"
                                        ? "bg-white text-emerald-800 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <IconChartLine size={15} className="shrink-0 text-emerald-600" />
                                <span>Ringkasan Konsolidasi</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="stores"
                                className={cn(
                                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 shadow-none flex-1 sm:flex-initial",
                                    activeTab === "stores"
                                        ? "bg-white text-blue-800 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <IconBuildingStore size={15} className="shrink-0 text-blue-600" />
                                <span>Perbandingan Cabang</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="inventory"
                                className={cn(
                                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 shadow-none flex-1 sm:flex-initial",
                                    activeTab === "inventory"
                                        ? "bg-white text-purple-800 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <IconBox size={15} className="shrink-0 text-purple-600" />
                                <span>Valuasi Stok Cabang</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Quick Stats Indicator Badge */}
                        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-semibold px-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>
                                Periode: <strong className="text-slate-700">{appliedFilters.from}</strong> s/d{" "}
                                <strong className="text-slate-700">{appliedFilters.to}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Integrated Tab Body Wrapping Detail Data */}
                    <div className="p-4 sm:p-6 bg-slate-50/20">
                        <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                            <CentralOverviewTab
                                overview={overviewData}
                                trendData={trendData}
                                byStore={byStore}
                                onByStoreToggle={setByStore}
                                isLoadingOverview={isLoadingOverview}
                                isLoadingTrend={isLoadingTrend}
                            />
                        </TabsContent>

                        <TabsContent value="stores" className="mt-0 focus-visible:outline-none">
                            <CentralStoresComparisonTab
                                data={storesData}
                                isLoading={isLoadingStores}
                            />
                        </TabsContent>

                        <TabsContent value="inventory" className="mt-0 focus-visible:outline-none">
                            <CentralInventoryTab
                                data={inventoryData}
                                isLoading={isLoadingInventory}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    );
}
