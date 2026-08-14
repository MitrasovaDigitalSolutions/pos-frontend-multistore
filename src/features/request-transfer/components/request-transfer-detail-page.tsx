"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import {
    IconArrowLeft,
    IconBuildingStore,
    IconClock,
    IconPackage,
    IconTruckDelivery
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/hooks/use-app-router";
import { useMemo } from "react";
import { useRequestTransferDetail } from "../api/request-transfer-api";

export function RequestTransferDetailPage() {
    const router = useAppRouter();

    const searchParams = useSearchParams();
    const summaryUid = searchParams.get("summary_uid") || "";

    const { data: detail, isLoading, isFetching } = useRequestTransferDetail(summaryUid);

    const totalQtySum = useMemo(() => {
        return (detail?.items || []).reduce((acc, curr) => acc + Number(curr.kuantitas || 0), 0);
    }, [detail]);

    if (!summaryUid) {
        return (
            <div className="p-8 text-center text-sm text-slate-500">
                Summary ID tidak ditemukan di URL.
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Stock Transfer Style Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-3.5">
                    <Button
                        type="button"
                        onClick={() => router.push(ROUTES.ADMIN_REQUEST_TRANSFERS)}
                        variant="outline"
                        className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer shadow-xs shrink-0"
                    >
                        <IconArrowLeft size={18} />
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">Detail Request Transfer</h2>
                            <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 font-bold border border-blue-200 bg-blue-50 text-blue-700"
                            >
                                REQUEST KELUAR
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Permintaan stok barang yang diajukan oleh toko ini ke toko sumber
                        </p>
                    </div>
                </div>

                {detail && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Badge
                            variant="outline"
                            className="text-xs px-3 py-1 font-bold border border-amber-200 bg-amber-50 text-amber-800 flex items-center gap-1.5"
                        >
                            <IconClock size={14} /> Menunggu Diproses
                        </Badge>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            )}

            {detail && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    {/* Left Column: Items Table */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                        <Card className="border-slate-100 shadow-xs rounded-2xl bg-white overflow-hidden">
                            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <IconPackage size={16} className="text-blue-600" />
                                    <span>Daftar Barang Diminta ({detail.items.length} Product)</span>
                                </CardTitle>
                            </CardHeader>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left min-w-[500px]">
                                    <thead className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-3.5 py-2.5">Nama Produk</th>
                                            <th className="px-3.5 py-2.5 text-right">Qty Diminta</th>
                                            <th className="px-3.5 py-2.5 text-right">Qty PO</th>
                                            <th className="px-3.5 py-2.5 text-right">Qty Dikirim</th>
                                            <th className="px-3.5 py-2.5 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {detail.items.map((item) => (
                                            <tr key={item.product_uid} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-3.5 py-2.5 font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                                    <IconPackage size={14} className="text-slate-400 shrink-0" />
                                                    <div>
                                                        <span>{item.nama || item.product_uid}</span>
                                                        {item.barcode && (
                                                            <span className="text-[10px] text-slate-400 font-mono block font-normal">
                                                                {item.barcode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right font-extrabold text-slate-900 text-xs">
                                                    {Number(item.kuantitas).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right font-medium text-slate-600 text-xs">
                                                    {Number(item.qty_dipesan ?? 0).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-right font-medium text-emerald-700 text-xs">
                                                    {Number(item.qty_dikirim ?? 0).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-3.5 py-2.5 text-center">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                                                        <IconClock size={11} /> Pending
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900 text-xs">
                                        <tr>
                                            <td className="px-3.5 py-2.5 uppercase tracking-wider text-slate-600 text-[10px]">
                                                Total Kuantitas
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right text-slate-900 font-extrabold text-xs">
                                                {totalQtySum.toLocaleString("id-ID")}
                                            </td>
                                            <td colSpan={3}></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Info Cards (Rute Toko, Supplier, Waktu) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Route Card */}
                        <Card className="border-slate-100 shadow-xs rounded-2xl bg-white">
                            <CardHeader className="pb-3 border-b border-slate-50">
                                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <IconBuildingStore size={16} className="text-emerald-600" />
                                    <span>Rute Toko</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Toko Asal (Peminta)
                                    </span>
                                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                                        Toko Saya
                                    </span>
                                </div>

                                <div className="border-t border-slate-50 pt-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Toko Tujuan (Sumber Stock)
                                    </span>
                                    <span className="font-bold text-emerald-700 text-sm block mt-0.5">
                                        {detail.request_to_nama || "Toko Pusat"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Supplier & Catalog Card */}
                        <Card className="border-slate-100 shadow-xs rounded-2xl bg-white">
                            <CardHeader className="pb-3 border-b border-slate-50">
                                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <IconPackage size={16} className="text-blue-600" />
                                    <span>Supplier & Katalog</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Supplier Target
                                    </span>
                                    <span className="font-bold text-slate-900 text-xs block mt-0.5">
                                        {detail.supplier_nama || "Tanpa Supplier"}
                                    </span>
                                </div>

                                {detail.supplier_sales_nama && (
                                    <div className="border-t border-slate-50 pt-2.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                            Katalog Sales
                                        </span>
                                        <span className="font-semibold text-slate-700 text-xs block mt-0.5">
                                            {detail.supplier_sales_nama}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary & Timestamps Card */}
                        <Card className="border-slate-100 shadow-xs rounded-2xl bg-white">
                            <CardHeader className="pb-3 border-b border-slate-50">
                                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <IconTruckDelivery size={16} className="text-purple-600" />
                                    <span>Ringkasan Request</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Total Barang Diminta:</span>
                                    <span className="font-bold text-slate-900 text-xs">
                                        {totalQtySum.toLocaleString("id-ID")} Items
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Jumlah Dokumen:</span>
                                    <span className="font-bold text-slate-900 text-xs">
                                        {detail.requests.length} Dokumen
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!isLoading && !detail && !isFetching && (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                    Summary request transfer tidak ditemukan.
                </div>
            )}
        </div>
    );
}
