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
    CompoundTablePagination,
} from "@/components/ui/compound-table";
import type { PenjualanReport } from "../../types";

interface PenjualanDetailsTableProps {
    reportData: PenjualanReport | undefined;
    isLoading: boolean;
    appliedFilters: {
        includeItems: boolean;
    };
    page: number;
    onPageChange: (page: number) => void;
    perPage: number;
    onPerPageChange: (perPage: number) => void;
    sortOrder: "asc" | "desc";
    onSortOrderChange: (order: "asc" | "desc") => void;
}

export function PenjualanDetailsTable({
    reportData,
    isLoading,
    appliedFilters,
    page,
    onPageChange,
    perPage,
    onPerPageChange,
    sortOrder,
    onSortOrderChange,
}: PenjualanDetailsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>({
        key: "tanggal",
        direction: "desc",
    });

    const salesList = useMemo(() => {
        return reportData?.sales?.data ?? reportData?.receivings?.data ?? [];
    }, [reportData]);

    const computedMeta = useMemo(() => {
        return reportData?.sales?.meta ?? reportData?.receivings?.meta;
    }, [reportData]);

    const sortedSales = useMemo(() => {
        if (!salesList) return [];
        const items = [...salesList];
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
            } else if (sortConfig.key === "jumlah") {
                valA = a.jumlah || 0;
                valB = b.jumlah || 0;
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
    }, [salesList, sortConfig]);

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
        <CompoundTable title="Transaksi Penjualan & Detail Log">
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
                        sortKey="operator"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Kasir
                    </CompoundTableHead>
                    <CompoundTableHead
                        align="right"
                        sortKey="jumlah"
                        activeSortKey={sortConfig?.key}
                        sortDirection={sortConfig?.direction}
                        onSort={requestSort}
                    >
                        Total Belanja (Rp)
                    </CompoundTableHead>
                </CompoundTableHeader>
                <CompoundTableBody
                    isLoading={isLoading}
                    isEmpty={sortedSales.length === 0}
                    columnsCount={6}
                    emptyMessage="Tidak ada data transaksi penjualan ditemukan."
                >
                    {sortedSales.map((row, index) => {
                        const isExpanded = !!expandedRows[row.no_faktur];
                        const hasPaymentsData = !!row.riwayat_pembayaran;

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
                                    <CompoundTableCell className="text-center text-slate-500 font-medium text-xs font-mono" align="center">
                                        {row.no ?? (computedMeta ? (computedMeta.current_page - 1) * computedMeta.per_page + index + 1 : index + 1)}
                                    </CompoundTableCell>
                                    <CompoundTableCell className="text-slate-600 font-semibold text-xs">{row.tanggal}</CompoundTableCell>
                                    <CompoundTableCell className="text-slate-800 font-bold text-xs font-mono">{row.no_faktur}</CompoundTableCell>
                                    <CompoundTableCell className="text-slate-500 font-medium text-xs">{row.operator || "-"}</CompoundTableCell>
                                    <CompoundTableCell className="text-right text-slate-800 font-semibold text-xs" align="right">{formatRupiah(row.jumlah)}</CompoundTableCell>
                                </CompoundTableRow>

                                {/* Sub-row with Details */}
                                {isExpanded && (
                                    <CompoundTableRow isExpandedRow>
                                        <CompoundTableCell colSpan={6} isExpandedCell>
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                                                {/* Items Detail */}
                                                {appliedFilters.includeItems && row.daftar_barang ? (
                                                    <div className={hasPaymentsData ? "lg:col-span-7 space-y-2" : "lg:col-span-12 space-y-2"}>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                            <IconShoppingCart size={14} className="text-slate-400" />
                                                            <span>Daftar Barang Jual</span>
                                                        </div>
                                                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                                            <Table>
                                                                <TableHeader className="bg-slate-50/60">
                                                                    <TableRow className="hover:bg-transparent">
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500">Nama Barang</TableHead>
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-center">Qty</TableHead>
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-right">Harga Jual (Rp)</TableHead>
                                                                        <TableHead className="text-[9px] font-bold py-2 text-slate-500 text-right">Subtotal</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody className="divide-y divide-slate-100/50">
                                                                    {row.daftar_barang.map((item, itemIdx) => {
                                                                        const qty = item.qty ?? item.qty_beli ?? 0;
                                                                        const harga = item.harga_jual ?? item.harga_beli ?? 0;
                                                                        const subtotal = item.subtotal ?? item.subtotal_net ?? 0;

                                                                        return (
                                                                            <TableRow key={itemIdx} className="hover:bg-slate-50/30 text-[11px] text-slate-600 font-medium">
                                                                                <TableCell className="py-2.5 font-bold text-slate-800">{item.nama_barang}</TableCell>
                                                                                <TableCell className="py-2.5 text-center">{qty} {item.satuan}</TableCell>
                                                                                <TableCell className="py-2.5 text-right">{formatRupiah(harga)}</TableCell>
                                                                                <TableCell className="py-2.5 text-right font-bold text-slate-800">{formatRupiah(subtotal)}</TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                ) : !appliedFilters.includeItems ? (
                                                    <div className={hasPaymentsData ? "lg:col-span-7 p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center flex flex-col items-center justify-center min-h-[140px] select-none" : "lg:col-span-12 p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center flex flex-col items-center justify-center min-h-[140px] select-none"}>
                                                        <IconShoppingCart size={24} className="text-slate-400 mb-1.5" />
                                                        <span className="text-xs font-bold text-slate-700">Rincian Barang Disembunyikan</span>
                                                        <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal whitespace-normal text-center">
                                                            Opsi filter &quot;Sertakan Detail Barang&quot; dinonaktifkan. Aktifkan opsi tersebut untuk memuat daftar produk faktur ini.
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

            {computedMeta && (
                <CompoundTablePagination
                    page={page}
                    lastPage={computedMeta.last_page}
                    perPage={perPage}
                    total={computedMeta.total}
                    entityName="transaksi"
                    onPageChange={onPageChange}
                    onPerPageChange={onPerPageChange}
                    sortOrder={sortOrder}
                    onSortOrderChange={onSortOrderChange}
                />
            )}
        </CompoundTable>
    );
}
