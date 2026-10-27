"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/ui/data-table";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { usePrescriptionHistories } from "../../api/pharmacy-api";
import type { PrescriptionHistory } from "../../types";
import { HistoryDetailDialog } from "./history-detail-dialog";
import { useHistoryColumns } from "./use-history-columns";

interface HistoryFilterValues {
    search: string;
}

export function HistoryListTable() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedHistory, setSelectedHistory] = useState<PrescriptionHistory | null>(null);

    const filterMethods = useForm<HistoryFilterValues>({
        defaultValues: {
            search: "",
        },
    });

    const handleFilterSubmit = (data: HistoryFilterValues) => {
        setDebouncedSearch(data.search.trim());
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({ search: "" });
        setDebouncedSearch("");
        setPage(1);
    };

    const { data: response, isLoading, isFetching } = usePrescriptionHistories({
        search: debouncedSearch || undefined,
        page,
        per_page: perPage,
    });

    const rawData = response?.data;
    const isPaginated = rawData && typeof rawData === "object" && "data" in rawData;
    const items: PrescriptionHistory[] = isPaginated
        ? (rawData as { data: PrescriptionHistory[] }).data
        : Array.isArray(rawData)
            ? rawData
            : [];

    const total = isPaginated ? (rawData as { total: number }).total : items.length;
    const lastPage = isPaginated ? (rawData as { last_page: number }).last_page : 1;

    const columns = useHistoryColumns();

    return (
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Standard Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Riwayat Racikan Terjual
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Daftar transaksi peracikan obat apotek yang telah selesai di kasir checkout.
                    </p>
                </div>
            </div>

            {/* Filter Form */}
            <div className="w-full">
                <FilterForm<HistoryFilterValues>
                    methods={filterMethods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
                >
                    <FormInput<HistoryFilterValues>
                        name="search"
                        label="Cari Riwayat Racikan"
                        placeholder="Nama racikan terjual, signa, sediaan..."
                    />
                </FilterForm>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={items}
                onView={(item) => setSelectedHistory(item)}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada riwayat racikan ditemukan."
                entityName="riwayat racikan"
                virtualize={true}
                estimateRowHeight={44}
                page={page}
                perPage={perPage}
                onPageChange={(p: number) => setPage(p)}
                onPerPageChange={(pp: number) => {
                    setPerPage(pp);
                    setPage(1);
                }}
                meta={{
                    current_page: page,
                    last_page: lastPage,
                    per_page: perPage,
                    total,
                }}
            />

            {/* Detail Dialog */}
            <HistoryDetailDialog
                open={Boolean(selectedHistory)}
                onOpenChange={(open) => !open && setSelectedHistory(null)}
                history={selectedHistory}
            />
        </section>
    );
}

