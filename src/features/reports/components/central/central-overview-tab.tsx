"use client";

import { CentralKpiCards } from "./central-kpi-cards";
import { CentralSalesChart } from "./central-sales-chart";
import { CentralStoreDistribution } from "./central-store-distribution";
import type {
    CentralOverviewData,
    CentralSalesTrendData,
} from "../../types/central-reports-types";

interface CentralOverviewTabProps {
    overview?: CentralOverviewData;
    trendData?: CentralSalesTrendData;
    byStore: boolean;
    onByStoreToggle: (val: boolean) => void;
    isLoadingOverview: boolean;
    isLoadingTrend: boolean;
}

export function CentralOverviewTab({
    overview,
    trendData,
    byStore,
    onByStoreToggle,
    isLoadingOverview,
    isLoadingTrend,
}: CentralOverviewTabProps) {
    return (
        <div className="space-y-4 sm:space-y-5">
            {/* 1. Top KPI Summary Metric Tiles */}
            <CentralKpiCards overview={overview} isLoading={isLoadingOverview} />

            {/* 2. Main Analytics Grid: Sales Chart + Store Distribution Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                <div className="lg:col-span-8">
                    <CentralSalesChart
                        trendData={trendData}
                        byStore={byStore}
                        onByStoreToggle={onByStoreToggle}
                        isLoading={isLoadingTrend}
                    />
                </div>
                <div className="lg:col-span-4">
                    <CentralStoreDistribution
                        stores={overview?.stores || []}
                        totalNetSales={overview?.net_sales || 0}
                        isLoading={isLoadingOverview}
                    />
                </div>
            </div>
        </div>
    );
}
