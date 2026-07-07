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

interface PengeluaranFilterValues {
    fromDate: string;
    toDate: string;
}

export function PengeluaranReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

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

    if (!hasViewReports) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat laporan pengeluaran.</p>
            </div>
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
                reportData={reportData}
                isLoading={isLoading}
            />

            {/* Table Details Section */}
            <PengeluaranDetailsTable
                reportData={reportData}
                isLoading={isLoading}
            />
        </div>
    );
}
