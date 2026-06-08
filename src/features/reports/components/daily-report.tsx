"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useDailyReport } from "../api/reports-api";
import { DataTable } from "@/components/ui/data-table";

export function DailyReportView() {
    const [selectedReportDate, setSelectedReportDate] = useState<string>(
        new Date().toISOString().split("T")[0],
    );

    const { data: dailyReport, isLoading } = useDailyReport(selectedReportDate);

    return (
        <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Laporan Penjualan Harian
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 border-none bg-transparent">
                        Analisis performa transaksi per kasir dan metode
                        pembayaran.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600">
                        Pilih Tanggal:
                    </label>
                    <Input
                        type="date"
                        className="h-9 text-xs w-36 border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                        value={selectedReportDate}
                        onChange={(e) => setSelectedReportDate(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                    Memuat laporan penjualan...
                </div>
            ) : dailyReport ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="text-[9px] font-bold uppercase text-slate-400">
                                Total Omset Harian
                            </div>
                            <div className="text-lg font-bold text-emerald-600 mt-1">
                                {formatRupiah(dailyReport.total_sales)}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="text-[9px] font-bold uppercase text-slate-400">
                                Transaksi Sukses
                            </div>
                            <div className="text-lg font-bold text-slate-800 mt-1">
                                {dailyReport.transactions_count} Trx
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="text-[9px] font-bold uppercase text-slate-400">
                                Rerata Nilai Struk
                            </div>
                            <div className="text-lg font-bold text-slate-800 mt-1">
                                {formatRupiah(
                                    dailyReport.average_transaction_value,
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <div className="text-[9px] font-bold uppercase text-slate-400">
                                Transaksi Void
                            </div>
                            <div className="text-lg font-bold text-rose-500 mt-1">
                                {dailyReport.void_count} Void
                            </div>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-800 mb-3">
                            Breakdown Metode Pembayaran
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.keys(dailyReport.payment_methods || {}).map(
                                (method) => {
                                    const pm =
                                        dailyReport.payment_methods[method];
                                    return (
                                        <div
                                            key={method}
                                            className="border border-slate-100 p-4 rounded-xl bg-white flex justify-between items-center"
                                        >
                                            <div>
                                                <div className="text-xs font-bold uppercase text-slate-600">
                                                    {method}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {pm.count} Transaksi
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-slate-800">
                                                {formatRupiah(pm.total)}
                                            </span>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-800 mb-3">
                            10 Produk Terlaris Hari Ini
                        </h4>
                        <DataTable
                            columns={[
                                {
                                    accessorKey: "product_name",
                                    header: "Nama Produk",
                                    cell: ({ row }) => (
                                        <span className="font-semibold text-slate-800">
                                            {row.original.product_name}
                                        </span>
                                    ),
                                },
                                {
                                    accessorKey: "quantity",
                                    header: "Jumlah Terjual",
                                    meta: {
                                        headerClassName: "text-right",
                                        cellClassName: "text-right font-bold",
                                    },
                                    cell: ({ row }) =>
                                        `${row.original.quantity} pcs`,
                                },
                                {
                                    accessorKey: "revenue",
                                    header: "Total Revenue",
                                    meta: {
                                        headerClassName: "text-right",
                                        cellClassName:
                                            "text-right font-bold text-emerald-600",
                                    },
                                    cell: ({ row }) =>
                                        formatRupiah(row.original.revenue),
                                },
                            ]}
                            data={dailyReport.top_products || []}
                            isLoading={isLoading}
                            emptyMessage="Belum ada item terjual pada tanggal ini."
                            virtualize={false} // Small list of 10 items, no need to virtualize
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                    Belum ada data laporan penjualan.
                </div>
            )}
        </Card>
    );
}
