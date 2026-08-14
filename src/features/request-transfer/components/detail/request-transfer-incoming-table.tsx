"use client";

import { useState, useMemo } from "react";
import {
    IconSearch,
    IconBuildingStore,
    IconPackage,
    IconCheck,
    IconAlertTriangle,
    IconTable,
    IconFileText,
    IconNotes,
} from "@tabler/icons-react";
import { formatToReadableDate } from "@/lib/date-utils";
import type { RequestTransferDetailRequest, RequestTransferGroupedItem } from "../../types";


interface RequestTransferIncomingTableProps {
    requests: RequestTransferDetailRequest[];
    groupedItems: RequestTransferGroupedItem[];
}

export function RequestTransferIncomingTable({
    requests,
    groupedItems,
}: RequestTransferIncomingTableProps) {
    const [viewMode, setViewMode] = useState<"matrix" | "documents">("matrix");
    const [searchQuery, setSearchQuery] = useState("");

    // Extract unique requesting stores for dynamic columns
    const storeColumns = useMemo(() => {
        const storesMap = new Map<string, string>();
        for (const req of requests) {
            const storeKey = req.store_uid || req.store_nama || "Cabang";
            const storeName = req.store_nama || "Cabang";
            if (!storesMap.has(storeKey)) {
                storesMap.set(storeKey, storeName);
            }
        }
        return Array.from(storesMap.entries()).map(([key, name]) => ({
            key,
            name,
        }));
    }, [requests]);

    // Build Matrix Data: Rows = Products, Columns = Stores
    const matrixRows = useMemo(() => {
        const productStoreMap = new Map<string, Map<string, number>>();

        for (const req of requests) {
            const storeKey = req.store_uid || req.store_nama || "Cabang";
            for (const item of req.items) {
                if (!productStoreMap.has(item.product_uid)) {
                    productStoreMap.set(item.product_uid, new Map());
                }
                const storeMap = productStoreMap.get(item.product_uid)!;
                const currentQty = storeMap.get(storeKey) || 0;
                storeMap.set(storeKey, currentQty + Number(item.kuantitas || 0));
            }
        }

        return groupedItems.map((gItem) => {
            const storeQtyMap = productStoreMap.get(gItem.product_uid) || new Map();
            const storeQtys: Record<string, number> = {};

            for (const storeCol of storeColumns) {
                storeQtys[storeCol.key] = storeQtyMap.get(storeCol.key) || 0;
            }

            return {
                productUid: gItem.product_uid,
                nama: gItem.nama || gItem.product_uid,
                barcode: gItem.barcode || null,
                totalQty: Number(gItem.kuantitas || 0),
                stokSource: Number(gItem.stok_source ?? 0),
                cukup: gItem.cukup ?? false,
                storeQtys,
            };
        });
    }, [requests, groupedItems, storeColumns]);

    // Filter matrix rows by search query
    const filteredMatrixRows = useMemo(() => {
        if (!searchQuery.trim()) return matrixRows;
        const q = searchQuery.toLowerCase();
        return matrixRows.filter((r) => r.nama.toLowerCase().includes(q) || (r.barcode && r.barcode.toLowerCase().includes(q)));
    }, [matrixRows, searchQuery]);

    // Calculate totals per store column
    const storeTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        for (const col of storeColumns) {
            totals[col.key] = matrixRows.reduce(
                (sum, row) => sum + (row.storeQtys[col.key] || 0),
                0
            );
        }
        return totals;
    }, [storeColumns, matrixRows]);

    const grandTotalQty = useMemo(() => {
        return matrixRows.reduce((sum, row) => sum + row.totalQty, 0);
    }, [matrixRows]);

    return (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Toolbar */}
            <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2.5">
                {/* View Toggle */}
                <div className="flex items-center gap-1.5 p-0.5 bg-slate-200/70 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setViewMode("matrix")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${viewMode === "matrix"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <IconTable size={13} className="text-emerald-600" />
                        <span>Matrix Barang & Toko ({storeColumns.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("documents")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${viewMode === "documents"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        <IconFileText size={13} className="text-blue-600" />
                        <span>Dokumen Request ({requests.length})</span>
                    </button>
                </div>

                {/* Compact Search */}
                <div className="relative w-full sm:w-56">
                    <IconSearch
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari produk..."
                        className="w-full pl-8 pr-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                </div>
            </div>

            {/* MODE 1: COMPACT DYNAMIC MATRIX TABLE */}
            {viewMode === "matrix" && (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100/90 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 min-w-[180px]">Nama Produk</th>
                                {storeColumns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-2.5 py-2 text-center min-w-[100px] bg-emerald-50/60 border-x border-slate-200/60 text-emerald-900"
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <IconBuildingStore size={12} className="shrink-0 text-emerald-600" />
                                            <span className="truncate max-w-[90px]">{col.name}</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-3 py-2 text-right bg-slate-200/50 font-extrabold min-w-[90px]">
                                    Total
                                </th>
                                <th className="px-3 py-2 text-right min-w-[90px]">Stok Sumber</th>
                                <th className="px-3 py-2 text-center min-w-[100px]">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredMatrixRows.length > 0 ? (
                                filteredMatrixRows.map((row) => (
                                    <tr
                                        key={row.productUid}
                                        className="hover:bg-slate-50/80 transition-colors"
                                    >
                                        {/* Product Name */}
                                        <td className="px-3 py-2 font-semibold text-slate-900 text-[11px]">
                                            <div className="flex items-center gap-1.5">
                                                <IconPackage size={13} className="text-slate-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="truncate block">{row.nama}</span>
                                                    {row.barcode && (
                                                        <span className="text-[9px] text-slate-400 font-mono block">
                                                            {row.barcode}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Store Columns */}
                                        {storeColumns.map((col) => {
                                            const qty = row.storeQtys[col.key] || 0;
                                            return (
                                                <td
                                                    key={col.key}
                                                    className="px-2.5 py-2 text-center border-x border-slate-100"
                                                >
                                                    {qty > 0 ? (
                                                        <span className="inline-block font-extrabold text-emerald-900 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded text-[11px]">
                                                            {qty.toLocaleString("id-ID")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 font-mono text-[10px]">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        {/* Total Qty */}
                                        <td className="px-3 py-2 text-right bg-slate-50/50 font-extrabold text-slate-900 text-xs">
                                            {row.totalQty.toLocaleString("id-ID")}
                                        </td>

                                        {/* Stok Sumber */}
                                        <td className="px-3 py-2 text-right font-medium text-slate-600 text-[11px]">
                                            {row.stokSource.toLocaleString("id-ID")}
                                        </td>

                                        {/* Status */}
                                        <td className="px-3 py-2 text-center">
                                            <span
                                                className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${row.cukup
                                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                                    : "text-rose-700 bg-rose-50 border-rose-200"
                                                    }`}
                                            >
                                                {row.cukup ? (
                                                    <>
                                                        <IconCheck size={11} /> Cukup
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconAlertTriangle size={11} /> Kurang
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={storeColumns.length + 4}
                                        className="px-3 py-6 text-center text-slate-400 text-xs"
                                    >
                                        Tidak ada produk.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        {/* Compact Footer */}
                        {filteredMatrixRows.length > 0 && (
                            <tfoot className="bg-slate-100/90 border-t border-slate-200 font-bold text-slate-900 text-[11px]">
                                <tr>
                                    <td className="px-3 py-2 uppercase tracking-wider text-slate-600 text-[10px]">
                                        Total Request ({filteredMatrixRows.length} Item)
                                    </td>
                                    {storeColumns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-2.5 py-2 text-center text-emerald-800 font-extrabold border-x border-slate-200"
                                        >
                                            {(storeTotals[col.key] || 0).toLocaleString("id-ID")}
                                        </td>
                                    ))}
                                    <td className="px-3 py-2 text-right text-emerald-700 font-extrabold text-xs bg-emerald-100/60">
                                        {grandTotalQty.toLocaleString("id-ID")}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}

            {/* MODE 2: COMPACT DOCUMENT BREAKDOWN */}
            {viewMode === "documents" && (
                <div className="p-3.5 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {requests.map((r) => (
                            <div
                                key={r.uid}
                                className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/30 text-xs"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-0.5 rounded bg-emerald-50 text-emerald-600">
                                            <IconBuildingStore size={13} />
                                        </div>
                                        <span className="font-bold text-slate-900 text-[11px]">
                                            {r.store_nama || "Cabang"}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            ({r.nomor_request} • {r.tanggal_request ? formatToReadableDate(r.tanggal_request) : "-"})
                                        </span>

                                    </div>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                        {r.status}
                                    </span>
                                </div>

                                {r.catatan && (
                                    <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-100 flex items-center gap-1">
                                        <IconNotes size={11} className="text-slate-400 shrink-0" />
                                        <span>{r.catatan}</span>
                                    </div>
                                )}

                                <table className="w-full text-[11px] text-left border border-slate-100 rounded overflow-hidden">
                                    <thead className="bg-slate-100 text-[9px] font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-2 py-1">Barang</th>
                                            <th className="px-2 py-1 text-right">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {r.items.map((i) => (
                                            <tr key={i.product_uid}>
                                                <td className="px-2 py-1 font-medium text-slate-800">
                                                    {i.nama || i.product_uid}
                                                </td>
                                                <td className="px-2 py-1 text-right font-bold text-slate-900">
                                                    {Number(i.kuantitas).toLocaleString("id-ID")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
