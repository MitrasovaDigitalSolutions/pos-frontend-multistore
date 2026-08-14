"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { hasPermission, hasRole } from "@/constants/roles";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { useIncomingRequestTransfers, useOutgoingRequestTransfers } from "../api/request-transfer-api";
import { RequestTransferSummaryHeader } from "./list/request-transfer-summary-header";
import { RequestTransferFilters, type RequestTransferFilterValues } from "./list/request-transfer-filters";
import { RequestTransferSummaryTable } from "./list/request-transfer-summary-table";

interface RequestTransferListPageProps {
    mode?: "outgoing" | "incoming";
}

export function RequestTransferListPage({ mode = "outgoing" }: RequestTransferListPageProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const canAccess =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_request_transfers") ||
        hasPermission(userRoles, userPermissions, "manage_request_transfers");
    const canManage =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_request_transfers");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const handleFilterSubmit = (data: RequestTransferFilterValues) => {
        setDebouncedSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        setDebouncedSearch("");
        setPage(1);
    };

    const filterParams = {
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
    };

    const outgoingResult = useOutgoingRequestTransfers(filterParams);
    const incomingResult = useIncomingRequestTransfers(filterParams);

    const activeQuery = mode === "incoming" ? incomingResult : outgoingResult;
    const { data: summariesData, isLoading, isFetching } = activeQuery;

    if (!canAccess) {
        return (
            <AccessDeniedState description="Halaman request transfer hanya dapat diakses oleh pengguna dengan akses request transfer." />
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                <RequestTransferSummaryHeader canManage={canManage} mode={mode} />

                <RequestTransferFilters
                    onFilterSubmit={handleFilterSubmit}
                    onFilterReset={handleFilterReset}
                />

                <RequestTransferSummaryTable
                    summaries={summariesData?.data || []}
                    meta={summariesData?.meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    mode={mode}
                />

            </section>
        </div>
    );
}

