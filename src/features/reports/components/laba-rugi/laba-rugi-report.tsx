"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { useLabaRugiReport } from "../../api/reports-api";
import { LabaRugiHeaderFilters } from "./laba-rugi-header-filters";
import { LabaRugiSummaryCard } from "./laba-rugi-summary-card";
import { LabaRugiDetailsTable } from "./laba-rugi-details-table";
import { formatToISO, todayStr } from "@/lib/date-utils";

interface LabaRugiFilterValues {
    fromDate: string;
    toDate: string;
    interval: string;
}

export function LabaRugiReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    // Default: 30 days ago to today
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [appliedFilters, setAppliedFilters] = useState<LabaRugiFilterValues>({
        fromDate: formatToISO(thirtyDaysAgo),
        toDate: todayStr(),
        interval: "daily",
    });

    const methods = useForm<LabaRugiFilterValues>({
        defaultValues: appliedFilters,
    });

    const { data: reportData, isLoading, isFetching, refetch } = useLabaRugiReport(
        appliedFilters.fromDate,
        appliedFilters.toDate,
        appliedFilters.interval,
    );

    if (!hasViewReports) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat laporan laba rugi.</p>
            </div>
        );
    }

    const handleFilterSubmit = (data: LabaRugiFilterValues) => {
        setAppliedFilters(data);
    };

    const handleFilterReset = () => {
        const defaults = {
            fromDate: formatToISO(thirtyDaysAgo),
            toDate: todayStr(),
            interval: "daily",
        };
        methods.reset(defaults);
        setAppliedFilters(defaults);
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters Section */}
            <LabaRugiHeaderFilters
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
            <LabaRugiSummaryCard
                reportData={reportData}
                isLoading={isLoading}
            />

            {/* Transactions Details Table Section */}
            <LabaRugiDetailsTable
                reportData={reportData}
                isLoading={isLoading}
            />
        </div>
    );
}
