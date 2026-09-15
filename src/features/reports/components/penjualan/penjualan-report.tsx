"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { usePenjualanReport } from "../../api/reports-api";
import { PenjualanHeaderFilters } from "./penjualan-header-filters";
import { PenjualanSummaryCard } from "./penjualan-summary-card";
import { PenjualanDetailsTable } from "./penjualan-details-table";
import { todayStr } from "@/lib/date-utils";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { ReportsTutorialController } from "../../tutorial/components/reports-tutorial-controller";
import { MOCK_PENJUALAN } from "../../tutorial/constants/reports-tutorial-constants";
import { useReportsTutorialStore } from "@/stores/reports-tutorial-store";

interface PenjualanFilterValues {
    fromDate: string;
    toDate: string;
    includeItems: boolean;
}

export function PenjualanReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const isTutorialRunning = useReportsTutorialStore((state) => state.isRunning);

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    // Default: today only
    const today = todayStr();

    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [appliedFilters, setAppliedFilters] = useState<PenjualanFilterValues>({
        fromDate: today,
        toDate: today,
        includeItems: true,
    });

    const methods = useForm<PenjualanFilterValues>({
        defaultValues: appliedFilters,
    });

    const { data: reportData, isLoading, isFetching, refetch } = usePenjualanReport(
        appliedFilters.fromDate,
        appliedFilters.toDate,
        appliedFilters.includeItems,
        false,
        page,
        perPage,
        sortOrder
    );

    // Saat tutorial berjalan, pakai data contoh agar walkthrough selalu utuh.
    const activeData = isTutorialRunning ? MOCK_PENJUALAN : reportData;

    if (!hasViewReports) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat laporan penjualan."
                requiredPermission="view_reports"
            />
        );
    }

    const handleFilterSubmit = (data: PenjualanFilterValues) => {
        setPage(1);
        setAppliedFilters(data);
    };

    const handleFilterReset = () => {
        const defaults = {
            fromDate: today,
            toDate: today,
            includeItems: true,
        };
        methods.reset(defaults);
        setPage(1);
        setPerPage(10);
        setSortOrder("desc");
        setAppliedFilters(defaults);
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters Section */}
            <PenjualanHeaderFilters
                methods={methods}
                onSubmit={handleFilterSubmit}
                onReset={handleFilterReset}
                onRefetch={refetch}
                isLoading={isLoading}
                isFetching={isFetching}
                hasReportData={!!activeData}
                appliedFilters={appliedFilters}
            />

            {/* Metrics Summary Card Section */}
            <PenjualanSummaryCard
                reportData={activeData}
                isLoading={isLoading && !isTutorialRunning}
            />

            {/* Detailed Table Section */}
            <PenjualanDetailsTable
                reportData={activeData}
                isLoading={isLoading && !isTutorialRunning}
                appliedFilters={appliedFilters}
                page={page}
                onPageChange={setPage}
                perPage={perPage}
                onPerPageChange={setPerPage}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
            />

            <ReportsTutorialController />
        </div>
    );
}
