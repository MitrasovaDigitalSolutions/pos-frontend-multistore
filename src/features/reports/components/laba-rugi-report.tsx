"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormSelect } from "@/components/forms/form-select";
import { FilterForm } from "@/components/forms/filter-form";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useLabaRugiReport } from "../api/reports-api";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { IconPrinter, IconTrendingUp, IconTrendingDown, IconCalendar, IconRefresh } from "@tabler/icons-react";
import { PrintConfirmDialog } from "./print-confirm-dialog";

interface LabaRugiFilterValues {
    fromDate: string;
    toDate: string;
    interval: string;
}

export function LabaRugiReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    // Default: 30 days ago to today
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [appliedFilters, setAppliedFilters] = useState<LabaRugiFilterValues>({
        fromDate: thirtyDaysAgo.toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        interval: "daily",
    });

    const methods = useForm<LabaRugiFilterValues>({
        defaultValues: appliedFilters,
    });

    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState<boolean>(false);



    const { data: reportData, isLoading, isFetching, refetch } = useLabaRugiReport(
        appliedFilters.fromDate,
        appliedFilters.toDate,
        appliedFilters.interval,
    );

    if (!hasViewReports) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat laporan laba rugi.</p>
            </div>
        );
    }

    const handleFilterSubmit = (data: LabaRugiFilterValues) => {
        setAppliedFilters(data);
    };

    const handleFilterReset = () => {
        const defaults = {
            fromDate: thirtyDaysAgo.toISOString().split("T")[0],
            toDate: new Date().toISOString().split("T")[0],
            interval: "daily",
        };
        methods.reset(defaults);
        setAppliedFilters(defaults);
    };

    interface LabaRugiPrintFilterValues {
        paperSize: string;
        orientation: string;
        fromDate: string;
        toDate: string;
        interval: string;
    }

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
        <div className="space-y-6">
            {/* Header & Filters */}
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center border-b border-slate-50">
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
                            onClick={() => refetch()}
                            disabled={isLoading || isFetching}
                            className="h-9 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center gap-1.5"
                            title="Muat Ulang"
                        >
                            <IconRefresh size={16} className={isFetching ? "animate-spin" : ""} />
                        </Button>

                        <Button
                            onClick={() => setIsPrintDialogOpen(true)}
                            disabled={isLoading || !reportData}
                            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs"
                        >
                            <IconPrinter size={16} />
                            Cetak PDF
                        </Button>
                    </div>
                </div>

                <FilterForm
                    methods={methods}
                    onSubmit={handleFilterSubmit}
                    onReset={handleFilterReset}
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

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Jual */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Penjualan Kotor
                    </div>
                    <div className="text-lg font-extrabold text-slate-800 mt-1">
                        {isLoading ? (
                            <Skeleton className="h-6 w-32 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_h_jual ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconTrendingUp size={40} className="text-slate-100/80" />
                    </div>
                </div>

                {/* Total HPP */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total HPP (COGS)
                    </div>
                    <div className="text-lg font-extrabold text-slate-700 mt-1">
                        {isLoading ? (
                            <Skeleton className="h-6 w-32 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_hpp ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconCalendar size={40} className="text-slate-100/80" />
                    </div>
                </div>

                {/* Total Diskon */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Potongan Diskon
                    </div>
                    <div className="text-lg font-extrabold text-amber-600 mt-1">
                        {isLoading ? (
                            <Skeleton className="h-6 w-28 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_diskon ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconTrendingDown size={40} className="text-slate-100/80" />
                    </div>
                </div>

                {/* Total Laba Rugi */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Laba / Rugi Bersih
                    </div>
                    <div className={`text-lg font-extrabold mt-1 ${(reportData?.total_laba_rugi ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {isLoading ? (
                            <Skeleton className="h-6 w-32 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_laba_rugi ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconTrendingUp size={40} className={((reportData?.total_laba_rugi ?? 0) >= 0) ? "text-emerald-100/50" : "text-rose-100/50"} />
                    </div>
                </div>
            </div>

            {/* Table Details */}
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
                <h4 className="text-xs font-bold text-slate-800 mb-4">
                    Rincian Transaksi
                </h4>
                <DataTable
                    defaultSorting={[{ id: "tanggal", desc: true }]}
                    columns={[
                        {
                            accessorKey: "tanggal",
                            header: "Tanggal",
                            cell: ({ row }) => (
                                <span className="text-slate-600 font-medium">
                                    {row.original.tanggal}
                                </span>
                            ),
                            size: 110,
                        },
                        {
                            accessorKey: "no_faktur",
                            header: "No. Transaksi",
                            cell: ({ row }) => (
                                <span className="font-semibold text-slate-800 font-mono text-xs">
                                    {row.original.no_faktur}
                                </span>
                            ),
                            size: 130,
                        },
                        {
                            accessorKey: "keterangan",
                            header: "Keterangan",
                            cell: ({ row }) => (
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-slate-700 text-xs">
                                        {row.original.keterangan}
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${row.original.tipe === "sale" ? "text-emerald-500" : "text-rose-500"}`}>
                                        {row.original.tipe === "sale" ? "Penjualan" : "Pengeluaran"}
                                    </span>
                                </div>
                            ),
                            size: 180,
                        },
                        {
                            accessorKey: "h_jual",
                            header: "Penjualan (Rp)",
                            meta: {
                                headerClassName: "text-right",
                                cellClassName: "text-right font-medium text-slate-600",
                            },
                            cell: ({ row }) => row.original.h_jual > 0 ? formatRupiah(row.original.h_jual) : "-",
                            size: 130,
                        },
                        {
                            accessorKey: "hpp",
                            header: "HPP (COGS)",
                            meta: {
                                headerClassName: "text-right",
                                cellClassName: "text-right font-medium text-slate-500",
                            },
                            cell: ({ row }) => {
                                const hpp = row.original.hpp;
                                if (hpp === 0) return "-";
                                if (hpp < 0) return `-${formatRupiah(Math.abs(hpp))}`;
                                return formatRupiah(hpp);
                            },
                            size: 130,
                        },
                        {
                            accessorKey: "diskon",
                            header: "Diskon (Rp)",
                            meta: {
                                headerClassName: "text-right",
                                cellClassName: "text-right font-medium text-amber-600",
                            },
                            cell: ({ row }) => row.original.diskon > 0 ? formatRupiah(row.original.diskon) : "-",
                            size: 110,
                        },
                        {
                            accessorKey: "laba_rugi",
                            header: "Laba / Rugi",
                            meta: {
                                headerClassName: "text-right",
                                cellClassName: "text-right font-bold",
                            },
                            cell: ({ row }) => {
                                const val = row.original.laba_rugi;
                                return (
                                    <span className={val >= 0 ? "text-emerald-600" : "text-rose-600"}>
                                        {val < 0 ? `-${formatRupiah(Math.abs(val))}` : formatRupiah(val)}
                                    </span>
                                );
                            },
                            size: 130,
                        },
                        {
                            id: "margin",
                            header: "Margin",
                            meta: {
                                headerClassName: "text-right",
                                cellClassName: "text-right font-semibold text-slate-500",
                            },
                            cell: ({ row }) => {
                                const jual = row.original.h_jual;
                                const laba = row.original.laba_rugi;
                                if (row.original.tipe !== "sale" || !jual) return "-";
                                const pct = (laba / jual) * 100;
                                return `${pct.toFixed(2)}%`;
                            },
                            size: 90,
                        },
                    ]}
                    data={reportData?.report_data || []}
                    isLoading={isLoading}
                    emptyMessage="Tidak ada data rincian laba rugi pada periode ini."
                    virtualize={false}
                />
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
                <div className="grid grid-cols-2 gap-4">
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
        </div>
    );
}
