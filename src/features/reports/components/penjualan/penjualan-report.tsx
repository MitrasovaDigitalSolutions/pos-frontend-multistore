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

interface PenjualanFilterValues {
    fromDate: string;
    toDate: string;
    includeItems: boolean;
}

export function PenjualanReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

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

    if (!hasViewReports) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat laporan penjualan.</p>
            </div>
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
                hasReportData={!!reportData}
                appliedFilters={appliedFilters}
            />

            {/* Metrics Summary Card Section */}
            <PenjualanSummaryCard
                reportData={reportData}
                isLoading={isLoading}
            />

            {/* Detailed Table Section */}
            <PenjualanDetailsTable
                reportData={reportData}
                isLoading={isLoading}
                appliedFilters={appliedFilters}
                page={page}
                onPageChange={setPage}
                perPage={perPage}
                onPerPageChange={setPerPage}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
            />
        </div>
    );
}
