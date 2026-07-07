"use client";

import React, { useState, useMemo } from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    IconShoppingCart,
    IconCoin,
} from "@tabler/icons-react";
import {
    CompoundTable,
    CompoundTableContent,
    CompoundTableHeader,
    CompoundTableHead,
    CompoundTableBody,
    CompoundTableRow,
    CompoundTableCell,
    CompoundTableExpandButton,
} from "@/components/ui/compound-table";
import type { PurchaseReport } from "../../types";

interface PembelianDetailsTableProps {
    reportData: PurchaseReport | undefined;
    isLoading: boolean;
    appliedFilters: {
        includeItems: boolean;
        includePayments: boolean;
    };
}

export function PembelianDetailsTable({
    reportData,
    isLoading,
    appliedFilters,
}: PembelianDetailsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>({
        key: "tanggal",
        direction: "desc",
    });

    const sortedReceivings = useMemo(() => {
        if (!reportData?.receivings) return [];
        const items = [...reportData.receivings];
        if (!sortConfig) return items;

        items.sort((a, b) => {
            let valA: string | number = "";
            let valB: string | number = "";

            if (sortConfig.key === "tanggal") {
                valA = a.tanggal_raw || a.tanggal;
                valB = b.tanggal_raw || b.tanggal;
            } else if (sortConfig.key === "no_faktur") {
                valA = a.no_faktur || "";
                valB = b.no_faktur || "";
            } else if (sortConfig.key === "supplier") {
                valA = a.supplier || "";
                valB = b.supplier || "";
            } else if (sortConfig.key === "pembayaran") {
                valA = a.pembayaran || "";
                valB = b.pembayaran || "";
            } else if (sortConfig.key === "jumlah") {
                valA = a.jumlah || 0;
                valB = b.jumlah || 0;
            } else if (sortConfig.key === "retur") {
                valA = a.retur || 0;
                valB = b.retur || 0;
            } else if (sortConfig.key === "total_net") {
                valA = a.total_net || 0;
                valB = b.total_net || 0;
            } else if (sortConfig.key === "hutang") {
                valA = a.hutang || 0;
                valB = b.hutang || 0;
            } else if (sortConfig.key === "operator") {
                valA = a.operator || "";
                valB = b.operator || "";
            }

            if (typeof valA === "number" && typeof valB === "number") {
                return sortConfig.direction === "asc" ? valA - valB : valB - valA;
            }

            return sortConfig.direction === "asc"
                ? String(valA).localeCompare(String(valB))
                : String(valB).localeCompare(String(valA));
        });

        return items;
    }, [reportData, sortConfig]);

    const requestSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        } else if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
            setSortConfig(null);
            return;
        }
        setSortConfig({ key, direction });
    };

    const toggleRow = (uid: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [uid]: !prev[uid],
        }));
    };

    return (
        <CompoundTable title="Transaksi Pembelian & Detail Log">
            <CompoundTableContent>
                <CompoundTableHeader>
                    <CompoundTableHead className="w-12" align="center" />
                    <CompoundTableHead className="w-12 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3" align="center">No.</CompoundTableHead>
                    <CompoundTableHead
                        sortKey="tanggal"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Tanggal
                    </CompoundTableHead>
                    <CompoundTableHead
                        sortKey="no_faktur"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        No. Faktur
                    </CompoundTableHead>
                    <CompoundTableHead
                        sortKey="supplier"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Supplier
                    </CompoundTableHead>
                    <CompoundTableHead
                        align="center"
                        sortKey="pembayaran"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Status
                    </CompoundTableHead>
                    <CompoundTableHead
                        align="right"
                        sortKey="jumlah"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Faktur (Rp)
                    </CompoundTableHead>
                    <CompoundTableHead
                        align="right"
                        sortKey="retur"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Retur (Rp)
                    </CompoundTableHead>
                    <CompoundTableHead
                        align="right"
                        sortKey="total_net"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Net (Rp)
                    </CompoundTableHead>
                    <CompoundTableHead
                        align="right"
                        sortKey="hutang"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Sisa Hutang
                    </CompoundTableHead>
                    <CompoundTableHead
                        sortKey="operator"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Operator
                    </CompoundTableHead>
                </CompoundTableHeader>
                <CompoundTableBody
                    isLoading={isLoading}
                    isEmpty={!reportData || sortedReceivings.length === 0}
                    columnsCount={11}
                    emptyMessage="Tidak ada data transaksi pembelian ditemukan."
                >
                    {sortedReceivings.map((row, index) => {
                        const isExpanded = !!expandedRows[row.no_faktur];
                        return (
                            <React.Fragment key={`${row.no_faktur}-${index}`}>
                                <CompoundTableRow
                                    onClick={() => toggleRow(row.no_faktur)}
                                >
                                    <CompoundTableCell align="center" onClick={(e) => e.stopPropagation()}>
                                        <CompoundTableExpandButton
                                            isExpanded={isExpanded}
                                            onClick={() => toggleRow(row.no_faktur)}
                                        />
                                    </CompoundTableCell>
                                    <CompoundTableCell className="text-center text-slate-500 font-medium text-xs font-mono" align="center">{index + 1}</CompoundTableCell>
                                    <CompoundTableCell className="text-slate-600 font-semibold text-xs">{row.tanggal}</CompoundTableCell>
                                    <CompoundTableCell className="text-slate-800 font-bold text-xs font-mono">{row.no_faktur}</CompoundTableCell>
                                    <CompoundTableCell className="text-slate-700 font-bold text-xs">{row.supplier}</CompoundTableCell>
                                    <CompoundTableCell align="center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${row.pembayaran === "LUNAS"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-amber-50 text-amber-700 border-amber-100"
                                            }`}>
                                            {row.pembayaran}
                                        </span>
                                    </CompoundTableCell>
                                    <CompoundTableCell className="text-right text-slate-800 font-semibold text-xs" align="right">{formatRupiah(row.jumlah)}</CompoundTableCell>
                                    <CompoundTableCell className="text-right text-amber-600 font-semibold text-xs" align="right">{row.retur > 0 ? formatRupiah(row.retur) : "-"}</CompoundTableCell>
                                    <CompoundTableCell className="text-right text-slate-800 font-bold text-xs" align="right">{formatRupiah(row.total_net)}</CompoundTableCell>
                                    <CompoundTableCell className={`text-right font-bold text-xs ${row.hutang > 0 ? "text-rose-600" : "text-slate-400"}`} align="right">
                                        {row.hutang > 0 ? formatRupiah(row.hutang) : "Selesai"}
                                    </CompoundTableCell>
                                    <CompoundTableCell className="text-slate-500 font-medium text-xs">{row.operator}</CompoundTableCell>
                                </CompoundTableRow>

                                {/* Sub-row with Details */}
                                {isExpanded && (
                                    <CompoundTableRow isExpandedRow>
                                        <CompoundTableCell colSpan={11} isExpandedCell>
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                                                {/* Items Detail */}
                                                {appliedFilters.includeItems && row.daftar_barang ? (
                                                    <div className="lg:col-span-7 space-y-2">
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                            <IconShoppingCart size={14} className="text-slate-400" />
                                                            <span>Daftar Barang Beli</span>
                                                        </div>
                                                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                                            <Table>
                                                                <TableHeader className="bg-slate-50/60">
                                                                    <TableRow className="hover:bg-transparent">
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500">Nama Barang</TableHead>
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-center">Beli</TableHead>
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-center">Retur</TableHead>
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-center">Net Qty</TableHead>
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-right">Harga Beli (Rp)</TableHead>
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-right">Subtotal Net</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody className="divide-y divide-slate-100/50">
                                                                    {row.daftar_barang.map((item, itemIdx) => (
                                                                        <TableRow key={itemIdx} className="hover:bg-slate-50/30 text-[11px] text-slate-600 font-medium">
                                                                            <TableCell className="py-2.5 font-bold text-slate-800">{item.nama_barang}</TableCell>
                                                                            <TableCell className="py-2.5 text-center">{item.qty_beli} {item.satuan}</TableCell>
                                                                            <TableCell className={`py-2.5 text-center ${item.qty_retur > 0 ? "text-amber-600 font-bold" : ""}`}>{item.qty_retur} {item.satuan}</TableCell>
                                                                            <TableCell className="py-2.5 text-center font-bold text-slate-800">{item.net_qty} {item.satuan}</TableCell>
                                                                            <TableCell className="py-2.5 text-right">{formatRupiah(item.harga_beli)}</TableCell>
                                                                            <TableCell className="py-2.5 text-right font-bold text-slate-800">{formatRupiah(item.subtotal_net)}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                ) : !appliedFilters.includeItems ? (
                                                    <div className="lg:col-span-7 p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center flex flex-col items-center justify-center min-h-[140px] select-none">
                                                        <IconShoppingCart size={24} className="text-slate-400 mb-1.5" />
                                                        <span className="text-xs font-bold text-slate-700">Rincian Barang Disembunyikan</span>
                                                        <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal whitespace-normal text-center">
                                                            Opsi filter &quot;Sertakan Detail Barang&quot; dinonaktifkan. Aktifkan opsi tersebut untuk memuat daftar produk faktur ini.
                                                        </p>
                                                    </div>
                                                ) : null}

                                                {/* Payment History & Summary */}
                                                {appliedFilters.includePayments && row.riwayat_pembayaran ? (
                                                    <div className="lg:col-span-5 space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                                <IconCoin size={14} className="text-slate-400" />
                                                                <span>Riwayat Transaksi Pembayaran</span>
                                                            </div>
                                                            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                                                <Table>
                                                                    <TableHeader className="bg-slate-50/60">
                                                                        <TableRow className="hover:bg-transparent">
                                                                            <TableHead className="text-[9px] font-bold py-2 text-slate-500">Tanggal</TableHead>
                                                                            <TableHead className="text-[9px] font-bold py-2 text-slate-500">Referensi / Akun</TableHead>
                                                                            <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-right">Bayar (Rp)</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody className="divide-y divide-slate-100/50">
                                                                        {row.riwayat_pembayaran.history.length === 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={3} className="text-center py-6 text-slate-400 text-[10px]">
                                                                                    Belum ada pembayaran dicatat.
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ) : (
                                                                            row.riwayat_pembayaran.history.map((pay, payIdx) => (
                                                                                <TableRow key={payIdx} className="hover:bg-slate-50/30 text-[11px] text-slate-600 font-medium">
                                                                                    <TableCell className="py-2.5">{pay.tanggal}</TableCell>
                                                                                    <TableCell className="py-2.5">
                                                                                        <div className="font-bold text-slate-800">{pay.metode_akun}</div>
                                                                                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{pay.no_pembayaran_ref}</div>
                                                                                    </TableCell>
                                                                                    <TableCell className={`py-2.5 text-right font-bold ${pay.jumlah_bayar < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                                                                        {formatRupiah(pay.jumlah_bayar)}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>

                                                        {/* Summary Box */}
                                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-[11px] font-bold text-slate-600">
                                                            <div className="flex justify-between">
                                                                <span>Total Dibayar (Kotor):</span>
                                                                <span className="text-slate-800">{formatRupiah(row.riwayat_pembayaran.total_dibayar_kotor)}</span>
                                                            </div>
                                                            {row.riwayat_pembayaran.pengembalian_dana_refund < 0 && (
                                                                <div className="flex justify-between text-rose-600">
                                                                    <span>Refund / Pengembalian Retur:</span>
                                                                    <span>{formatRupiah(row.riwayat_pembayaran.pengembalian_dana_refund)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between border-t border-slate-200/60 pt-2 text-emerald-600">
                                                                <span>Total Dibayar (Bersih):</span>
                                                                <span className="font-extrabold">{formatRupiah(row.riwayat_pembayaran.total_dibayar_bersih)}</span>
                                                            </div>
                                                            <div className="flex justify-between border-t border-slate-200/60 pt-2">
                                                                <span>Sisa Hutang:</span>
                                                                <span className={`font-extrabold ${row.riwayat_pembayaran.sisa_hutang > 0 ? "text-rose-600" : "text-slate-500"}`}>
                                                                    {row.riwayat_pembayaran.sisa_hutang > 0 ? formatRupiah(row.riwayat_pembayaran.sisa_hutang) : "LUNAS"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : !appliedFilters.includePayments ? (
                                                    <div className="lg:col-span-5 p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center flex flex-col items-center justify-center min-h-[140px] select-none">
                                                        <IconCoin size={24} className="text-slate-400 mb-1.5" />
                                                        <span className="text-xs font-bold text-slate-700">Histori Bayar Disembunyikan</span>
                                                        <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal whitespace-normal text-center">
                                                            Opsi filter &quot;Sertakan Histori Bayar&quot; dinonaktifkan. Aktifkan opsi tersebut untuk memuat cicilan & sisa hutang.
                                                        </p>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </CompoundTableCell>
                                    </CompoundTableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </CompoundTableBody>
            </CompoundTableContent>
        </CompoundTable>
    );
}
