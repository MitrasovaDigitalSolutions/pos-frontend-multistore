"use client";

import { useState, useMemo } from "react";
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
import { useCentralReportTutorialStore } from "@/stores/central-report-tutorial-store";
import { CentralReportTutorialController } from "../../tutorial/central/components/central-report-tutorial-controller";
import {
    MOCK_CENTRAL_OVERVIEW,
    MOCK_CENTRAL_TREND,
    MOCK_CENTRAL_STORES,
    MOCK_CENTRAL_INVENTORY,
} from "../../tutorial/central/constants/central-report-tutorial-constants";

export function CentralReportPage() {
    const isTutorialActive = useCentralReportTutorialStore((s) => s.isRunning);
    const stepIndex = useCentralReportTutorialStore((s) => s.stepIndex);

    const [activeTab, setActiveTab] = useState<string>("overview");
    const [byStore, setByStore] = useState<boolean>(false);

    const currentTab = useMemo(() => {
        if (isTutorialActive) {
            if (stepIndex <= 6) return "overview";
            if (stepIndex >= 7 && stepIndex <= 9) return "stores";
            if (stepIndex >= 10) return "inventory";
        }
        return activeTab;
    }, [isTutorialActive, stepIndex, activeTab]);

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

    // Use rich mock data during the interactive tutorial
    const displayOverview = isTutorialActive ? MOCK_CENTRAL_OVERVIEW : overviewData;
    const displayStores = isTutorialActive ? MOCK_CENTRAL_STORES : storesData;
    const displayTrend = isTutorialActive ? MOCK_CENTRAL_TREND : trendData;
    const displayInventory = isTutorialActive ? MOCK_CENTRAL_INVENTORY : inventoryData;
    const displayLoadingOverview = isTutorialActive ? false : isLoadingOverview;
    const displayLoadingStores = isTutorialActive ? false : isLoadingStores;
    const displayLoadingTrend = isTutorialActive ? false : isLoadingTrend;
    const displayLoadingInventory = isTutorialActive ? false : isLoadingInventory;

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
                <Tabs value={currentTab} onValueChange={setActiveTab} className="w-full">
                    {/* Integrated Tab Navigation Header Bar */}
                    <div className="border-b border-slate-100 bg-slate-50/70 p-2 sm:p-2.5">
                        <TabsList id="central-report-tabs-nav" className="grid grid-cols-3 sm:flex sm:flex-nowrap bg-slate-100/90 border border-slate-200/70 p-1 sm:p-1.5 rounded-xl gap-1 sm:gap-1.5 !h-auto group-data-horizontal/tabs:!h-auto w-full sm:w-auto items-stretch">
                            <TabsTrigger
                                id="central-report-tab-trigger-overview"
                                value="overview"
                                className={cn(
                                    "!h-auto py-2 px-2 sm:px-3.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer border-0 text-center",
                                    currentTab === "overview"
                                        ? "bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200/60"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                )}
                            >
                                <IconChartLine size={15} className={cn("shrink-0", currentTab === "overview" ? "text-emerald-600" : "text-slate-400")} />
                                <span className="truncate">
                                    <span className="inline sm:hidden">Ringkasan</span>
                                    <span className="hidden sm:inline">Ringkasan Konsolidasi</span>
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                id="central-report-tab-trigger-stores"
                                value="stores"
                                className={cn(
                                    "!h-auto py-2 px-2 sm:px-3.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer border-0 text-center",
                                    currentTab === "stores"
                                        ? "bg-white text-blue-800 shadow-xs ring-1 ring-slate-200/60"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                )}
                            >
                                <IconBuildingStore size={15} className={cn("shrink-0", currentTab === "stores" ? "text-blue-600" : "text-slate-400")} />
                                <span className="truncate">
                                    <span className="inline sm:hidden">Cabang</span>
                                    <span className="hidden sm:inline">Perbandingan Cabang</span>
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                id="central-report-tab-trigger-inventory"
                                value="inventory"
                                className={cn(
                                    "!h-auto py-2 px-2 sm:px-3.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer border-0 text-center",
                                    currentTab === "inventory"
                                        ? "bg-white text-purple-800 shadow-xs ring-1 ring-slate-200/60"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                )}
                            >
                                <IconBox size={15} className={cn("shrink-0", currentTab === "inventory" ? "text-purple-600" : "text-slate-400")} />
                                <span className="truncate">
                                    <span className="inline sm:hidden">Stok</span>
                                    <span className="hidden sm:inline">Valuasi Stok Cabang</span>
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Integrated Tab Body Wrapping Detail Data */}
                    <div className="p-3 sm:p-6 bg-slate-50/20">
                        <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                            <CentralOverviewTab
                                overview={displayOverview}
                                trendData={displayTrend}
                                byStore={byStore}
                                onByStoreToggle={setByStore}
                                isLoadingOverview={displayLoadingOverview}
                                isLoadingTrend={displayLoadingTrend}
                            />
                        </TabsContent>

                        <TabsContent value="stores" className="mt-0 focus-visible:outline-none">
                            <CentralStoresComparisonTab
                                data={displayStores}
                                isLoading={displayLoadingStores}
                            />
                        </TabsContent>

                        <TabsContent value="inventory" className="mt-0 focus-visible:outline-none">
                            <CentralInventoryTab
                                data={displayInventory}
                                isLoading={displayLoadingInventory}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </Card>

            {/* Dedicated Central Reports Tutorial Controller & Dialog */}
            <CentralReportTutorialController />
        </div>
    );
}
