"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { hasRole, hasPermission } from "@/constants/roles";
import { useManualJournals } from "../../api/manual-journal-api";
import { JournalList } from "./journal-list";
import type { ManualJournal } from "../../types/manual-journal";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { AccessDeniedState } from "@/components/ui/access-denied-state";

interface JournalFilterValues {
    search: string;
    status: string;
}

export function JournalsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    // Table state
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filters form
    const filterMethods = useForm<JournalFilterValues>({
        defaultValues: {
            search: "",
            status: "all",
        },
    });

    const handleFilterSubmit = (data: JournalFilterValues) => {
        setDebouncedSearch(data.search);
        setStatusFilter(data.status);
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "", status: "all" });
        setDebouncedSearch("");
        setStatusFilter("all");
        setPage(1);
    };

    // Query manual journals list
    const { data: journalsData, isLoading, isFetching } = useManualJournals({
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
    });

    if (!hasViewReports) {
        return (
            <AccessDeniedState
                description="Anda tidak memiliki izin untuk melihat atau mengelola jurnal akuntansi manual."
                requiredPermission="view_reports"
            />
        );
    }

    const handleEdit = (journal: ManualJournal) => {
        router.push(`/admin/accounting/balance-sheet?action=edit&uid=${journal.uid}`);
    };

    const handleView = (journal: ManualJournal) => {
        router.push(`/admin/accounting/balance-sheet?action=detail&uid=${journal.uid}`);
    };

    const handleAddClick = () => {
        router.push(`/admin/accounting/balance-sheet?action=new`);
    };

    const statusFilterOptions = [
        { value: "all", label: "Semua Status" },
        { value: "draft", label: "Draft" },
        { value: "posted", label: "Posted" },
        { value: "voided", label: "Voided" },
    ];

    return (
        <div className="space-y-6">
            <JournalList
                journals={journalsData?.data || []}
                meta={journalsData?.meta}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                onEdit={handleEdit}
                onView={handleView}
                onAddClick={handleAddClick}
                isLoading={isLoading}
                isFetching={isFetching}
                filterElement={
                    <FilterForm
                        methods={filterMethods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <FormInput<JournalFilterValues>
                                name="search"
                                label="Cari Jurnal"
                                placeholder="Masukkan no referensi atau keterangan..."
                            />
                            <FormSelect
                                name="status"
                                label="Status"
                                options={statusFilterOptions}
                            />
                        </div>
                    </FilterForm>
                }
            />
        </div>
    );
}
