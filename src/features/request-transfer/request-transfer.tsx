"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { hasPermission, hasRole } from "@/constants/roles";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { useRequestTransferSummaries } from "./api/request-transfer-api";
import { RequestTransferSummaryList } from "./components/request-transfer-summary-list";

interface FilterValues {
    search: string;
}

export function RequestTransfer() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const canAccess =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_request_transfers") ||
        hasPermission(userRoles, userPermissions, "manage_request_transfers");

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const filterMethods = useForm<FilterValues>({ defaultValues: { search: "" } });

    const handleFilterSubmit = (data: FilterValues) => {
        setDebouncedSearch(data.search);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setDebouncedSearch("");
        setPage(1);
    };

    const { data: summariesData, isLoading, isFetching } = useRequestTransferSummaries({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
    });

    if (!canAccess) {
        return (
            <AccessDeniedState description="Halaman request transfer hanya dapat diakses oleh pengguna dengan akses request transfer." />
        );
    }

    return (
        <div className="space-y-6">
            <RequestTransferSummaryList
                summaries={summariesData?.data || []}
                meta={summariesData?.meta}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                isLoading={isLoading}
                isFetching={isFetching}
                filterElement={
                    <FilterForm
                        methods={filterMethods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                    >
                        <FormInput<FilterValues>
                            name="search"
                            label="Cari Supplier"
                            placeholder="Cari nama supplier atau katalog..."
                        />
                    </FilterForm>
                }
            />
        </div>
    );
}
