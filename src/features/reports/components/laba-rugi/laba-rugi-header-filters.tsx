"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormSelect } from "@/components/forms/form-select";
import { FilterForm } from "@/components/forms/filter-form";
import { Button } from "@/components/ui/button";
import { IconPrinter, IconRefresh } from "@tabler/icons-react";
import { PrintConfirmDialog } from "../print-confirm-dialog";

interface LabaRugiFilterValues {
    fromDate: string;
    toDate: string;
    interval: string;
}

interface LabaRugiPrintFilterValues {
    paperSize: string;
    orientation: string;
    fromDate: string;
    toDate: string;
    interval: string;
}

interface LabaRugiHeaderFiltersProps {
    methods: UseFormReturn<LabaRugiFilterValues>;
    onSubmit: (data: LabaRugiFilterValues) => void;
    onReset: () => void;
    onRefetch: () => void;
    isLoading: boolean;
    isFetching: boolean;
    hasReportData: boolean;
    appliedFilters: LabaRugiFilterValues;
}

export function LabaRugiHeaderFilters({
    methods,
    onSubmit,
    onReset,
    onRefetch,
    isLoading,
    isFetching,
    hasReportData,
    appliedFilters,
}: LabaRugiHeaderFiltersProps) {
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState<boolean>(false);

    const handlePrintConfirm = (data: LabaRugiPrintFilterValues) => {
        const url = `/api/proxy/v1/reports/print/laba-rugi?from=${data.fromDate}&to=${data.toDate}&interval=${data.interval}&paper_size=${data.paperSize}&orientation=${data.orientation}`;
        window.open(url, "_blank");
    };

    const intervalOptions = [
        { value: "daily", label: "Harian" },
        { value: "weekly", label: "Mingguan" },
        { value: "monthly", label: "Bulanan" },
        { value: "yearly", label: "Tahunan" },
    ];

    return (
        <>
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/60 mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Laporan Laba Rugi
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Analisis pendapatan, HPP (COGS), diskon, dan keuntungan bersih.
                        </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="outline"
                            onClick={onRefetch}
                            disabled={isLoading || isFetching}
                            className="h-9 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center gap-1.5"
                            title="Muat Ulang"
                        >
                            <IconRefresh size={16} className={isFetching ? "animate-spin" : ""} />
                        </Button>

                        <Button
                            onClick={() => setIsPrintDialogOpen(true)}
                            disabled={isLoading || !hasReportData}
                            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs"
                        >
                            <IconPrinter size={16} />
                            Cetak PDF
                        </Button>
                    </div>
                </div>

                <FilterForm
                    methods={methods}
                    onSubmit={onSubmit}
                    onReset={onReset}
                    cols={3}
                    titleLabel="Filter Laporan Laba Rugi"
                >
                    <FormSelect<LabaRugiFilterValues>
                        name="interval"
                        label="Interval"
                        options={intervalOptions}
                        placeholder="Pilih Interval"
                    />
                    <FormDatePicker<LabaRugiFilterValues>
                        name="fromDate"
                        label="Dari Tanggal"
                        placeholder="Mulai..."
                        clearable={false}
                    />
                    <FormDatePicker<LabaRugiFilterValues>
                        name="toDate"
                        label="Sampai Tanggal"
                        placeholder="Selesai..."
                        clearable={false}
                    />
                </FilterForm>
            </Card>

            <PrintConfirmDialog<LabaRugiPrintFilterValues>
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
                onConfirm={handlePrintConfirm}
                defaultValues={{
                    paperSize: "A4",
                    orientation: "portrait",
                    fromDate: appliedFilters.fromDate,
                    toDate: appliedFilters.toDate,
                    interval: appliedFilters.interval,
                }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormDatePicker<LabaRugiPrintFilterValues>
                        name="fromDate"
                        label="Dari Tanggal"
                        placeholder="Mulai..."
                        clearable={false}
                    />

                    <FormDatePicker<LabaRugiPrintFilterValues>
                        name="toDate"
                        label="Sampai Tanggal"
                        placeholder="Selesai..."
                        clearable={false}
                    />
                </div>
                <FormSelect<LabaRugiPrintFilterValues>
                    name="interval"
                    label="Interval Analisis"
                    options={intervalOptions}
                    placeholder="Pilih Interval"
                />
            </PrintConfirmDialog>
        </>
    );
}
