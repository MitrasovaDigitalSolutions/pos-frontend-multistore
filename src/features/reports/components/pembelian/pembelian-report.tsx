"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { usePembelianReport } from "../../api/reports-api";
import { PembelianHeaderFilters } from "./pembelian-header-filters";
import { PembelianSummaryCard } from "./pembelian-summary-card";
import { PembelianDetailsTable } from "./pembelian-details-table";
import { formatToISO, todayStr } from "@/lib/date-utils";
import { AccessDeniedState } from "@/components/ui/access-denied-state";

interface PembelianFilterValues {
    fromDate: string;
    toDate: string;
    includeItems: boolean;
    includePayments: boolean;
}

export function PembelianReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    // Default: 30 days ago to today
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [appliedFilters, setAppliedFilters] = useState<PembelianFilterValues>({
        fromDate: formatToISO(thirtyDaysAgo),
        toDate: todayStr(),
        includeItems: true,
        includePayments: true,
    });

    const methods = useForm<PembelianFilterValues>({
        defaultValues: appliedFilters,
    });

    const { data: reportData, isLoading, isFetching, refetch } = usePembelianReport(
        appliedFilters.fromDate,
        appliedFilters.toDate,
        appliedFilters.includeItems,
        appliedFilters.includePayments,
    );

    if (!hasViewReports) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat laporan pembelian."
                requiredPermission="view_reports"
            />
        );
    }

    const handleFilterSubmit = (data: PembelianFilterValues) => {
        setAppliedFilters(data);
    };

    const handleFilterReset = () => {
        const defaults = {
            fromDate: formatToISO(thirtyDaysAgo),
            toDate: todayStr(),
            includeItems: true,
            includePayments: true,
        };
        methods.reset(defaults);
        setAppliedFilters(defaults);
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters Section */}
            <PembelianHeaderFilters
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
            <PembelianSummaryCard
                reportData={reportData}
                isLoading={isLoading}
            />

            {/* Expandable Rows Table Section */}
            <PembelianDetailsTable
                reportData={reportData}
                isLoading={isLoading}
                appliedFilters={appliedFilters}
            />
        </div>
    );
}
