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
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat laporan pembelian.</p>
            </div>
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
