"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconClipboardList, IconReceipt, IconCreditCard } from "@tabler/icons-react";
import type { LabaRugiReport } from "../../types";

interface LabaRugiDetailsTableProps {
    reportData: LabaRugiReport | undefined;
    isLoading: boolean;
}

export function LabaRugiDetailsTable({ reportData, isLoading }: LabaRugiDetailsTableProps) {
    return (
        <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
            <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h4 className="text-xs font-bold text-slate-800">
                        Rincian Transaksi
                    </h4>
                    <TabsList className="h-10 bg-slate-100/80 border border-slate-200/40 p-1 rounded-xl gap-1 shrink-0">
                        <TabsTrigger 
                            value="all" 
                            className="text-xs px-3.5 py-1.5 font-bold text-slate-500 rounded-lg transition-all duration-200 flex items-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
                        >
                            <IconClipboardList size={14} />
                            Semua
                        </TabsTrigger>
                        <TabsTrigger 
                            value="sale" 
                            className="text-xs px-3.5 py-1.5 font-bold text-slate-500 rounded-lg transition-all duration-200 flex items-center gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
                        >
                            <IconReceipt size={14} />
                            Penjualan
                        </TabsTrigger>
                        <TabsTrigger 
                            value="expense" 
                            className="text-xs px-3.5 py-1.5 font-bold text-slate-500 rounded-lg transition-all duration-200 flex items-center gap-1.5 data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
                        >
                            <IconCreditCard size={14} />
                            Pengeluaran
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="outline-none mt-0">
                    <DataTable
                        defaultSorting={[{ id: "date_raw", desc: true }]}
                        columns={[
                            {
                                accessorKey: "date_raw",
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
                </TabsContent>

                <TabsContent value="sale" className="outline-none mt-0">
                    <DataTable
                        defaultSorting={[{ id: "date_raw", desc: true }]}
                        columns={[
                            {
                                accessorKey: "date_raw",
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
                                    <span className="font-semibold text-slate-700 text-xs">
                                        {row.original.keterangan}
                                    </span>
                                ),
                                size: 200,
                            },
                            {
                                accessorKey: "h_jual",
                                header: "Penjualan (Rp)",
                                meta: {
                                    headerClassName: "text-right",
                                    cellClassName: "text-right font-medium text-slate-600",
                                },
                                cell: ({ row }) => formatRupiah(row.original.h_jual),
                                size: 130,
                            },
                            {
                                accessorKey: "hpp",
                                header: "HPP (COGS)",
                                meta: {
                                    headerClassName: "text-right",
                                    cellClassName: "text-right font-medium text-slate-500",
                                },
                                cell: ({ row }) => formatRupiah(row.original.hpp),
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
                                header: "Laba Penjualan (Rp)",
                                meta: {
                                    headerClassName: "text-right",
                                    cellClassName: "text-right font-bold text-emerald-600",
                                },
                                cell: ({ row }) => formatRupiah(row.original.laba_rugi),
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
                                    if (!jual) return "-";
                                    const pct = (laba / jual) * 100;
                                    return `${pct.toFixed(2)}%`;
                                },
                                size: 90,
                            },
                        ]}
                        data={(reportData?.report_data || []).filter((item) => item.tipe === "sale")}
                        isLoading={isLoading}
                        emptyMessage="Tidak ada data rincian penjualan pada periode ini."
                        virtualize={false}
                    />
                </TabsContent>

                <TabsContent value="expense" className="outline-none mt-0">
                    <DataTable
                        defaultSorting={[{ id: "date_raw", desc: true }]}
                        columns={[
                            {
                                accessorKey: "date_raw",
                                header: "Tanggal",
                                cell: ({ row }) => (
                                    <span className="text-slate-600 font-medium">
                                        {row.original.tanggal}
                                    </span>
                                ),
                                size: 120,
                            },
                            {
                                accessorKey: "no_faktur",
                                header: "No. Referensi",
                                cell: ({ row }) => (
                                    <span className="font-semibold text-slate-800 font-mono text-xs">
                                        {row.original.no_faktur}
                                    </span>
                                ),
                                size: 150,
                            },
                            {
                                accessorKey: "keterangan",
                                header: "Keterangan / Deskripsi",
                                cell: ({ row }) => (
                                    <span className="font-semibold text-slate-700 text-xs">
                                        {row.original.keterangan}
                                    </span>
                                ),
                                size: 300,
                            },
                            {
                                accessorKey: "hpp",
                                header: "Jumlah Pengeluaran (Rp)",
                                meta: {
                                    headerClassName: "text-right",
                                    cellClassName: "text-right font-bold text-rose-600",
                                },
                                cell: ({ row }) => formatRupiah(Math.abs(row.original.hpp)),
                                size: 180,
                            },
                        ]}
                        data={(reportData?.report_data || []).filter((item) => item.tipe === "expense")}
                        isLoading={isLoading}
                        emptyMessage="Tidak ada data rincian pengeluaran pada periode ini."
                        virtualize={false}
                    />
                </TabsContent>
            </Tabs>
        </Card>
    );
}
