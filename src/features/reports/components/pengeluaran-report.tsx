"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FilterForm } from "@/components/forms/filter-form";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { usePengeluaranReport } from "../api/reports-api";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { IconPrinter, IconReceipt, IconRefresh } from "@tabler/icons-react";
import { PrintConfirmDialog } from "./print-confirm-dialog";
import { format, parseISO } from "date-fns";

interface PengeluaranFilterValues {
    fromDate: string;
    toDate: string;
}

export function PengeluaranReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    // Default: 30 days ago to today
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [appliedFilters, setAppliedFilters] = useState<PengeluaranFilterValues>({
        fromDate: thirtyDaysAgo.toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
    });

    const methods = useForm<PengeluaranFilterValues>({
        defaultValues: appliedFilters,
    });

    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState<boolean>(false);



    const { data: reportData, isLoading, isFetching, refetch } = usePengeluaranReport(
        appliedFilters.fromDate,
        appliedFilters.toDate,
    );

    if (!hasViewReports) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat laporan pengeluaran.</p>
            </div>
        );
    }

    const handleFilterSubmit = (data: PengeluaranFilterValues) => {
        setAppliedFilters(data);
    };

    const handleFilterReset = () => {
        const defaults = {
            fromDate: thirtyDaysAgo.toISOString().split("T")[0],
            toDate: new Date().toISOString().split("T")[0],
        };
        methods.reset(defaults);
        setAppliedFilters(defaults);
    };

    interface PengeluaranPrintFilterValues {
        paperSize: string;
        orientation: string;
        fromDate: string;
        toDate: string;
    }

    const handlePrintConfirm = (data: PengeluaranPrintFilterValues) => {
        const url = `/api/proxy/v1/reports/print/pengeluaran?from=${data.fromDate}&to=${data.toDate}&paper_size=${data.paperSize}&orientation=${data.orientation}`;
        window.open(url, "_blank");
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center border-b border-slate-50">
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

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Pengeluaran */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden md:col-span-1">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Nilai Pengeluaran
                    </div>
                    <div className="text-lg font-extrabold text-rose-600 mt-1">
                        {isLoading ? (
                            <Skeleton className="h-6 w-36 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_amount ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconReceipt size={40} className="text-rose-100/50" />
                    </div>
                </div>

                {/* Transaksi Pengeluaran Count */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden md:col-span-1">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Jumlah Transaksi Pengeluaran
                    </div>
                    <div className="text-lg font-extrabold text-slate-800 mt-1">
                        {isLoading ? (
                            <Skeleton className="h-6 w-20 mt-1" />
                        ) : (
                            `${reportData?.expenses?.length ?? 0} Transaksi`
                        )}
                    </div>
                </div>
            </div>

            {/* Table Details */}
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
                <h4 className="text-xs font-bold text-slate-800 mb-4">
                    Daftar Pengeluaran
                </h4>
                <DataTable
                    paginationMode="client"
                    defaultSorting={[{ id: "tanggal", desc: true }]}
                    columns={[
                        {
                            accessorKey: "tanggal",
                            header: "Tanggal",
                            cell: ({ row }) => {
                                try {
                                    const dateStr = row.original.tanggal;
                                    return (
                                        <span className="text-slate-600 font-medium">
                                            {format(parseISO(dateStr), "dd/MM/yyyy")}
                                        </span>
                                    );
                                } catch {
                                    return <span className="text-slate-600 font-medium">{row.original.tanggal}</span>;
                                }
                            },
                            size: 110,
                        },
                        {
                            accessorKey: "nomor_pengeluaran",
                            header: "No. Pengeluaran",
                            cell: ({ row }) => (
                                <span className="font-semibold text-slate-800 font-mono text-xs">
                                    {row.original.nomor_pengeluaran || `-`}
                                </span>
                            ),
                            size: 150,
                        },
                        {
                            accessorKey: "category.nama",
                            header: "Kategori",
                            cell: ({ row }) => (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/50 uppercase">
                                    {row.original.category?.nama || row.original.category_name || "-"}
                                </span>
                            ),
                            size: 140,
                        },
                        {
                            accessorKey: "nama",
                            header: "Keterangan / Nama",
                            cell: ({ row }) => (
                                <div className="max-w-[200px] truncate">
                                    <span className="font-semibold text-slate-700 block">
                                        {row.original.nama || "-"}
                                    </span>
                                    {row.original.catatan && (
                                        <span className="text-[10px] text-slate-400 block truncate">
                                            {row.original.catatan}
                                        </span>
                                    )}
                                </div>
                            ),
                            size: 200,
                        },
                        {
                            accessorKey: "cash_account.nama",
                            header: "Sumber Kas",
                            cell: ({ row }) => (
                                <span className="text-slate-600 text-xs font-semibold uppercase">
                                    {row.original.cash_account?.nama || row.original.cashAccount?.nama || "-"}
                                </span>
                            ),
                            size: 130,
                        },
                        {
                            accessorKey: "amount",
                            header: "Jumlah (Rp)",
                            meta: {
                                headerClassName: "text-right",
                                cellClassName: "text-right font-bold text-rose-600",
                            },
                            cell: ({ row }) => formatRupiah(row.original.amount),
                            size: 130,
                        },
                        {
                            accessorKey: "user.name",
                            header: "Operator",
                            cell: ({ row }) => (
                                <span className="text-slate-500 font-medium">
                                    {row.original.user?.name || "-"}
                                </span>
                            ),
                            size: 120,
                        },
                    ]}
                    data={reportData?.expenses || []}
                    isLoading={isLoading}
                    emptyMessage="Tidak ada catatan pengeluaran pada periode ini."
                    virtualize={false}
                />
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
                <div className="grid grid-cols-2 gap-4">
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
        </div>
    );
}
