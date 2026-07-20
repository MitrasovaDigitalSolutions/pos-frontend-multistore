"use client";

import { IconScale } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useGeneralLedgerUnbalanced } from "@/features/accounting/api/reports-api";
import type { GeneralLedgerEntry } from "@/features/accounting/types";
import { todayStr } from "@/lib/date-utils";

import { BalanceEntryDialog } from "./balance-entry-dialog";
import { UnbalancedStatusBanner } from "./unbalanced-status-banner";
import { getUnbalancedTableColumns } from "./unbalanced-table-columns";

interface UnbalancedFilterValues {
    from: string;
    to: string;
}

export function UnbalancedEntriesView() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(50);
    const [sortBy, setSortBy] = useState<string | undefined>("transaction_date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");
    const [selectedEntry, setSelectedEntry] = useState<GeneralLedgerEntry | null>(null);

    const filterMethods = useForm<UnbalancedFilterValues>({
        defaultValues: {
            from: todayStr(),
            to: todayStr(),
        },
    });

    const from = useWatch({ control: filterMethods.control, name: "from" });
    const to = useWatch({ control: filterMethods.control, name: "to" });

    useEffect(() => {
        setPage(1);
    }, [from, to]);

    const { data, isLoading, isFetching, refetch } = useGeneralLedgerUnbalanced({
        from: from || undefined,
        to: to || undefined,
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const columns = useMemo(() => getUnbalancedTableColumns(), []);

    const entries = data?.data ?? [];
    const meta = data?.meta;
    const totalUnbalanced = meta?.total ?? 0;

    return (
        <div className="space-y-6">
            {/* Header Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                            <IconScale size={20} />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                            Pemeriksaan Jurnal Tidak Seimbang
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-10">
                        Memantau entri transaksi General Ledger yang memiliki ketidakseimbangan antara nilai total Debit dan Kredit.
                    </p>
                </div>
            </div>

            {/* Status Banner Alert */}
            <UnbalancedStatusBanner isLoading={isLoading} totalUnbalanced={totalUnbalanced} />

            {/* Filter Card */}
            <FormProvider {...filterMethods}>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs flex flex-wrap items-center gap-4">
                    <div className="w-44">
                        <FormDatePicker
                            name="from"
                            label="Dari Tanggal"
                            placeholder="Pilih tanggal awal"
                        />
                    </div>
                    <div className="w-44">
                        <FormDatePicker
                            name="to"
                            label="Sampai Tanggal"
                            placeholder="Pilih tanggal akhir"
                        />
                    </div>
                </div>
            </FormProvider>

            {/* Data Table Section */}
            <section className="space-y-4">
                <DataTable
                    columns={columns}
                    data={entries}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    page={page}
                    perPage={perPage}
                    totalItems={totalUnbalanced}
                    totalPages={meta?.last_page ?? 1}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    virtualize={true}
                    estimateRowHeight={52}
                    enableSortingRemoval={false}
                    extraActions={(row) => (
                        <Button
                            size="sm"
                            onClick={() => setSelectedEntry(row)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 rounded-xl font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                            <IconScale size={14} />
                            Seimbangkan
                        </Button>
                    )}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(key, order) => {
                        setSortBy(key);
                        setSortOrder(order);
                        setPage(1);
                    }}
                />
            </section>

            {/* Refactored 2-Column Modal Dialog */}
            <BalanceEntryDialog
                selectedEntry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
