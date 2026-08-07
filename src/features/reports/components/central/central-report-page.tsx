"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { startOfMonthStr, todayStr } from "@/lib/date-utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
        <div className="space-y-6 pb-12 font-sans">
            {/* Header Filters with React Hook Form & FilterForm */}
            <CentralHeaderFilters
                methods={methods}
                onSubmit={onSubmitFilter}
                onReset={onResetFilter}
                onRefetch={handleRefetchAll}
                isLoading={isLoadingOverview}
                isFetching={isFetchingOverview}
                appliedFilters={appliedFilters}
            />

            {/* Proportional & Clean Tabs Navigation System */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <div className="border-b border-slate-200/80 pb-3">
                    <TabsList className="bg-slate-100/80 border border-slate-200/70 p-1 rounded-xl inline-flex gap-1 h-auto">
                        <TabsTrigger
                            value="overview"
                            className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-500 hover:text-slate-900"
                        >
                            <IconChartLine size={16} />
                            <span>Ringkasan Konsolidasi</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="stores"
                            className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-500 hover:text-slate-900"
                        >
                            <IconBuildingStore size={16} />
                            <span>Perbandingan Cabang</span>
                        </TabsTrigger>

                        <TabsTrigger
                            value="inventory"
                            className="px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-500 hover:text-slate-900"
                        >
                            <IconBox size={16} />
                            <span>Valuasi Stok Cabang</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview">
                    <CentralOverviewTab
                        overview={overviewData}
                        trendData={trendData}
                        byStore={byStore}
                        onByStoreToggle={setByStore}
                        isLoadingOverview={isLoadingOverview}
                        isLoadingTrend={isLoadingTrend}
                    />
                </TabsContent>

                <TabsContent value="stores">
                    <CentralStoresComparisonTab
                        data={storesData}
                        isLoading={isLoadingStores}
                    />
                </TabsContent>

                <TabsContent value="inventory">
                    <CentralInventoryTab
                        data={inventoryData}
                        isLoading={isLoadingInventory}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
