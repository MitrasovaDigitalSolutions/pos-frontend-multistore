"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { usePengeluaranReport } from "../../api/reports-api";
import { PengeluaranHeaderFilters } from "./pengeluaran-header-filters";
import { PengeluaranSummaryCard } from "./pengeluaran-summary-card";
import { PengeluaranDetailsTable } from "./pengeluaran-details-table";
import { formatToISO, todayStr } from "@/lib/date-utils";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { ReportsTutorialController } from "../../tutorial/components/reports-tutorial-controller";
import { MOCK_PENGELUARAN } from "../../tutorial/constants/reports-tutorial-constants";
import { useReportsTutorialStore } from "@/stores/reports-tutorial-store";

interface PengeluaranFilterValues {
    fromDate: string;
    toDate: string;
}

export function PengeluaranReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const isTutorialRunning = useReportsTutorialStore((state) => state.isRunning);

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    // Default: 30 days ago to today
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [appliedFilters, setAppliedFilters] = useState<PengeluaranFilterValues>({
        fromDate: formatToISO(thirtyDaysAgo),
        toDate: todayStr(),
    });

    const methods = useForm<PengeluaranFilterValues>({
        defaultValues: appliedFilters,
    });

    const { data: reportData, isLoading, isFetching, refetch } = usePengeluaranReport(
        appliedFilters.fromDate,
        appliedFilters.toDate,
    );

    // Saat tutorial berjalan, pakai data contoh agar walkthrough selalu utuh.
    const activeData = isTutorialRunning ? MOCK_PENGELUARAN : reportData;

    if (!hasViewReports) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat laporan pengeluaran operasional."
                requiredPermission="view_reports"
            />
        );
    }

    const handleFilterSubmit = (data: PengeluaranFilterValues) => {
        setAppliedFilters(data);
    };

    const handleFilterReset = () => {
        const defaults = {
            fromDate: formatToISO(thirtyDaysAgo),
            toDate: todayStr(),
        };
        methods.reset(defaults);
        setAppliedFilters(defaults);
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters Section */}
            <PengeluaranHeaderFilters
                methods={methods}
                onSubmit={handleFilterSubmit}
                onReset={handleFilterReset}
                onRefetch={refetch}
                isLoading={isLoading}
                isFetching={isFetching}
                hasReportData={!!reportData}
                appliedFilters={appliedFilters}
            />

            {/* Metrics Summary Card Section */}
            <PengeluaranSummaryCard
                reportData={activeData}
                isLoading={isLoading && !isTutorialRunning}
            />

            {/* Transactions Details Table Section */}
            <PengeluaranDetailsTable
                reportData={activeData}
                isLoading={isLoading && !isTutorialRunning}
            />

            <ReportsTutorialController />
        </div>
    );
}
