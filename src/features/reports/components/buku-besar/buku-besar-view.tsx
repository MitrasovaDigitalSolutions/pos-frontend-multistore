"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { IconBook } from "@tabler/icons-react";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { todayStr } from "@/lib/date-utils";
import { useGeneralLedger } from "@/features/reports/api/reports-api";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import type { GeneralLedgerEntry } from "@/features/reports/types";

export function BukuBesarView() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState(todayStr());
    const [coaUid, setCoaUid] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(50);

    const { data, isLoading, isFetching } = useGeneralLedger({
        from: from || undefined,
        to: to || undefined,
        chart_of_account_uid: coaUid || undefined,
        page,
        per_page: perPage,
    });

    const { data: coaData } = useFlatChartOfAccounts();

    const columns = useMemo<ColumnDef<GeneralLedgerEntry>[]>(
        () => [
            {
                accessorKey: "transaction_date",
                header: "Tanggal",
                cell: ({ row }) => (
                    <span className="text-slate-600 text-xs whitespace-nowrap">
                        {format(new Date(row.original.transaction_date), "dd MMM yyyy", {
                            locale: localeId,
                        })}
                    </span>
                ),
                size: 110,
            },
            {
                accessorKey: "kode",
                header: "Akun",
                cell: ({ row }) => (
                    <div className="whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                            {row.original.kode ?? "-"}
                        </span>
                        <span className="text-slate-500 text-[11px] ml-1.5">
                            {row.original.nama}
                        </span>
                    </div>
                ),
                size: 200,
            },
            {
                accessorKey: "description",
                header: "Keterangan",
                cell: ({ row }) => (
                    <span className="text-slate-700 text-xs">
                        {row.original.description || row.original.reference_type || "-"}
                    </span>
                ),
                size: 280,
            },
            {
                accessorKey: "debit",
                header: "Debit",
                cell: ({ row }) => (
                    <span className="text-emerald-700 text-xs font-medium tabular-nums text-right block">
                        {Number(row.original.debit) > 0
                            ? formatRupiah(Number(row.original.debit))
                            : "-"}
                    </span>
                ),
                size: 140,
            },
            {
                accessorKey: "credit",
                header: "Kredit",
                cell: ({ row }) => (
                    <span className="text-rose-700 text-xs font-medium tabular-nums text-right block">
                        {Number(row.original.credit) > 0
                            ? formatRupiah(Number(row.original.credit))
                            : "-"}
                    </span>
                ),
                size: 140,
            },
            {
                accessorKey: "source",
                header: "Sumber",
                cell: ({ row }) =>
                    row.original.source === "manual" ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold px-2 py-0.5 border">
                            Manual
                        </Badge>
                    ) : (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold px-2 py-0.5 border">
                            GL
                        </Badge>
                    ),
                size: 90,
            },
        ],
        []
    );

    const entries = data?.data ?? [];
    const meta = data?.meta;

    const totalDebit = entries.reduce((s, e) => s + Number(e.debit || 0), 0);
    const totalCredit = entries.reduce((s, e) => s + Number(e.credit || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <IconBook size={20} className="text-emerald-600" />
                <div>
                    <h1 className="text-base font-bold text-slate-900">Buku Besar</h1>
                    <p className="text-[11px] text-slate-400">
                        Riwayat debit & kredit per akun (GL + jurnal manual).
                    </p>
                </div>
            </div>

            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DatePicker
                        value={from}
                        onChange={(d) => {
                            setFrom(d);
                            setPage(1);
                        }}
                        label="Dari Tanggal"
                    />
                    <DatePicker
                        value={to}
                        onChange={(d) => {
                            setTo(d);
                            setPage(1);
                        }}
                        label="Sampai Tanggal"
                    />
                    <div className="space-y-1.5 w-full">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Akun (COA)
                        </label>
                        <select
                            value={coaUid}
                            onChange={(e) => {
                                setCoaUid(e.target.value);
                                setPage(1);
                            }}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        >
                            <option value="">Semua Akun</option>
                            {(coaData ?? []).map((c) => (
                                <option key={c.uid} value={c.uid}>
                                    {c.kode} - {c.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h3 className="text-sm font-bold text-slate-900">
                        Entri Buku Besar
                        {meta ? ` (${meta.total} entri)` : ""}
                    </h3>
                </div>

                <DataTable
                    columns={columns}
                    data={entries}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    emptyMessage="Tidak ada entri pada rentang tanggal ini."
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                    meta={meta}
                    entityName="entri buku besar"
                    virtualize={true}
                    estimateRowHeight={44}
                    hideEdit={() => true}
                    hideDelete={() => true}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onView={() => {}}
                />

                {entries.length > 0 && (
                    <div className="flex justify-end gap-8 border-t border-slate-100 pt-3 text-xs">
                        <span className="text-slate-500">
                            Total Halaman Debit:{" "}
                            <span className="font-semibold text-emerald-700 tabular-nums">
                                {formatRupiah(totalDebit)}
                            </span>
                        </span>
                        <span className="text-slate-500">
                            Total Halaman Kredit:{" "}
                            <span className="font-semibold text-rose-700 tabular-nums">
                                {formatRupiah(totalCredit)}
                            </span>
                        </span>
                    </div>
                )}
            </section>
        </div>
    );
}
