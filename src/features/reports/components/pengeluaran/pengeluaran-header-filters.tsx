"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FilterForm } from "@/components/forms/filter-form";
import { Button } from "@/components/ui/button";
import { IconPrinter, IconRefresh } from "@tabler/icons-react";
import { PrintConfirmDialog } from "../print-confirm-dialog";

interface PengeluaranFilterValues {
    fromDate: string;
    toDate: string;
}

interface PengeluaranPrintFilterValues {
    paperSize: string;
    orientation: string;
    fromDate: string;
    toDate: string;
}

interface PengeluaranHeaderFiltersProps {
    methods: UseFormReturn<PengeluaranFilterValues>;
    onSubmit: (data: PengeluaranFilterValues) => void;
    onReset: () => void;
    onRefetch: () => void;
    isLoading: boolean;
    isFetching: boolean;
    hasReportData: boolean;
    appliedFilters: PengeluaranFilterValues;
}

export function PengeluaranHeaderFilters({
    methods,
    onSubmit,
    onReset,
    onRefetch,
    isLoading,
    isFetching,
    hasReportData,
    appliedFilters,
}: PengeluaranHeaderFiltersProps) {
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState<boolean>(false);

    const handlePrintConfirm = (data: PengeluaranPrintFilterValues) => {
        const url = `/api/proxy/v1/reports/print/pengeluaran?from=${data.fromDate}&to=${data.toDate}&paper_size=${data.paperSize}&orientation=${data.orientation}`;
        window.open(url, "_blank");
    };

    return (
        <>
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/60 mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Laporan Pengeluaran Operasional
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Rangkuman dan log rincian biaya pengeluaran kas operasional toko.
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
                    cols={2}
                    titleLabel="Filter Laporan Pengeluaran"
                >
                    <FormDatePicker<PengeluaranFilterValues>
                        name="fromDate"
                        label="Dari Tanggal"
                        placeholder="Mulai..."
                        clearable={false}
                    />
                    <FormDatePicker<PengeluaranFilterValues>
                        name="toDate"
                        label="Sampai Tanggal"
                        placeholder="Selesai..."
                        clearable={false}
                    />
                </FilterForm>
            </Card>

            <PrintConfirmDialog<PengeluaranPrintFilterValues>
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
                onConfirm={handlePrintConfirm}
                defaultValues={{
                    paperSize: "A4",
                    orientation: "portrait",
                    fromDate: appliedFilters.fromDate,
                    toDate: appliedFilters.toDate,
                }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormDatePicker<PengeluaranPrintFilterValues>
                        name="fromDate"
                        label="Dari Tanggal"
                        placeholder="Mulai..."
                        clearable={false}
                    />

                    <FormDatePicker<PengeluaranPrintFilterValues>
                        name="toDate"
                        label="Sampai Tanggal"
                        placeholder="Selesai..."
                        clearable={false}
                    />
                </div>
            </PrintConfirmDialog>
        </>
    );
}
