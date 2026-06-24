"use client";

import { useState } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FilterForm } from "@/components/forms/filter-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { IconPrinter, IconRefresh } from "@tabler/icons-react";
import { PrintConfirmDialog } from "../print-confirm-dialog";

interface PembelianFilterValues {
    fromDate: string;
    toDate: string;
    includeItems: boolean;
    includePayments: boolean;
}

interface PembelianPrintFilterValues {
    paperSize: string;
    orientation: string;
    fromDate: string;
    toDate: string;
    includeItems: boolean;
    includePayments: boolean;
}

interface PembelianHeaderFiltersProps {
    methods: UseFormReturn<PembelianFilterValues>;
    onSubmit: (data: PembelianFilterValues) => void;
    onReset: () => void;
    onRefetch: () => void;
    isLoading: boolean;
    isFetching: boolean;
    hasReportData: boolean;
    appliedFilters: PembelianFilterValues;
}

export function PembelianHeaderFilters({
    methods,
    onSubmit,
    onReset,
    onRefetch,
    isLoading,
    isFetching,
    hasReportData,
    appliedFilters,
}: PembelianHeaderFiltersProps) {
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState<boolean>(false);

    const handlePrintConfirm = (data: PembelianPrintFilterValues) => {
        const url = `/api/proxy/v1/reports/print/pembelian?from=${data.fromDate}&to=${data.toDate}&include_items=${data.includeItems}&include_payments=${data.includePayments}&paper_size=${data.paperSize}&orientation=${data.orientation}`;
        window.open(url, "_blank");
    };

    return (
        <>
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/60 mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Laporan Pembelian & Hutang Supplier
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Rangkuman faktur pembelian barang masuk dari supplier beserta status hutang & retur.
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
                    titleLabel="Filter Laporan Pembelian & Hutang"
                >
                    <FormDatePicker<PembelianFilterValues>
                        name="fromDate"
                        label="Dari Tanggal"
                        placeholder="Mulai..."
                        clearable={false}
                    />

                    <FormDatePicker<PembelianFilterValues>
                        name="toDate"
                        label="Sampai Tanggal"
                        placeholder="Selesai..."
                        clearable={false}
                    />

                    <Controller
                        name="includeItems"
                        control={methods.control}
                        render={({ field }) => (
                            <div className="flex items-center gap-3 border border-slate-100 bg-white p-3 rounded-xl shadow-xs">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-700">Sertakan Detail Barang</span>
                                    <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Tampilkan nama & harga barang yang dibeli saat baris faktur diperluas (diklik) dan di cetakan PDF</span>
                                </div>
                            </div>
                        )}
                    />

                    <Controller
                        name="includePayments"
                        control={methods.control}
                        render={({ field }) => (
                            <div className="flex items-center gap-3 border border-slate-100 bg-white p-3 rounded-xl shadow-xs">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-700">Sertakan Histori Bayar</span>
                                    <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Tampilkan catatan cicilan pembayaran, sisa hutang, & kas bank saat baris diperluas dan di cetakan PDF</span>
                                </div>
                            </div>
                        )}
                    />
                </FilterForm>
            </Card>

            <PrintConfirmDialog<PembelianPrintFilterValues>
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
                onConfirm={handlePrintConfirm}
                defaultValues={{
                    paperSize: "A4",
                    orientation: "portrait",
                    fromDate: appliedFilters.fromDate,
                    toDate: appliedFilters.toDate,
                    includeItems: appliedFilters.includeItems,
                    includePayments: appliedFilters.includePayments,
                }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormDatePicker<PembelianPrintFilterValues>
                        name="fromDate"
                        label="Dari Tanggal"
                        placeholder="Mulai..."
                        clearable={false}
                    />

                    <FormDatePicker<PembelianPrintFilterValues>
                        name="toDate"
                        label="Sampai Tanggal"
                        placeholder="Selesai..."
                        clearable={false}
                    />
                </div>

                <div className="space-y-3">
                    <Controller
                        name="includeItems"
                        render={({ field }) => (
                            <div className="flex items-center gap-3 border border-slate-100 bg-slate-50/50 p-3 rounded-xl">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-700">Sertakan Detail Barang</span>
                                    <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Tampilkan daftar barang di cetakan PDF</span>
                                </div>
                            </div>
                        )}
                    />

                    <Controller
                        name="includePayments"
                        render={({ field }) => (
                            <div className="flex items-center gap-3 border border-slate-100 bg-slate-50/50 p-3 rounded-xl">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-700">Sertakan Histori Bayar</span>
                                    <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Tampilkan riwayat pembayaran & sisa hutang di cetakan PDF</span>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </PrintConfirmDialog>
        </>
    );
}
