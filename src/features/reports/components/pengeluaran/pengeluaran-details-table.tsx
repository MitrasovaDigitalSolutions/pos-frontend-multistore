"use client";

import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { format, parseISO } from "date-fns";
import type { PengeluaranReport } from "../../types";

interface PengeluaranDetailsTableProps {
    reportData: PengeluaranReport | undefined;
    isLoading: boolean;
}

export function PengeluaranDetailsTable({ reportData, isLoading }: PengeluaranDetailsTableProps) {
    return (
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
    );
}
