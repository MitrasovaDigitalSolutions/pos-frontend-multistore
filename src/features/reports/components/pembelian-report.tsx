"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FilterForm } from "@/components/forms/filter-form";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { usePembelianReport } from "../api/reports-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    IconPrinter,
    IconShoppingCart,
    IconChevronDown,
    IconChevronUp,
    IconRefresh,
    IconTrendingDown,
    IconArrowBackUp,
    IconCoin
} from "@tabler/icons-react";
import { PrintConfirmDialog } from "./print-confirm-dialog";
import { PrintPreviewDialog } from "./print-preview-dialog";

interface PembelianFilterValues {
    fromDate: string;
    toDate: string;
    includeItems: boolean;
    includePayments: boolean;
}

export function PembelianReportView() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasViewReports =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    // Default: 30 days ago to today
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [appliedFilters, setAppliedFilters] = useState<PembelianFilterValues>({
        fromDate: thirtyDaysAgo.toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        includeItems: true,
        includePayments: true,
    });

    const methods = useForm<PembelianFilterValues>({
        defaultValues: appliedFilters,
    });

    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

    const { data: reportData, isLoading, isFetching, refetch } = usePembelianReport(
        appliedFilters.fromDate,
        appliedFilters.toDate,
        appliedFilters.includeItems,
        appliedFilters.includePayments,
    );

    if (!hasViewReports) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">Anda tidak memiliki izin untuk melihat laporan pembelian.</p>
            </div>
        );
    }

    const toggleRow = (id: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleFilterSubmit = (data: PembelianFilterValues) => {
        setAppliedFilters(data);
    };

    const handleFilterReset = () => {
        const defaults = {
            fromDate: thirtyDaysAgo.toISOString().split("T")[0],
            toDate: new Date().toISOString().split("T")[0],
            includeItems: true,
            includePayments: true,
        };
        methods.reset(defaults);
        setAppliedFilters(defaults);
    };

    const handlePrintConfirm = (paperSize: string, orientation: string) => {
        const url = `/api/proxy/v1/reports/print/pembelian?from=${appliedFilters.fromDate}&to=${appliedFilters.toDate}&include_items=${appliedFilters.includeItems}&include_payments=${appliedFilters.includePayments}&paper_size=${paperSize}&orientation=${orientation}`;
        setPreviewUrl(url);
        setIsPreviewOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center border-b border-slate-50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Laporan Pembelian & Hutang Supplier
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Rangkuman faktur pembelian barang masuk dari supplier beserta status hutang & retur.
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
                    titleLabel="Filter Laporan Pembelian & Hutang"
                >
                    <FormDatePicker<PembelianFilterValues>
                        name="fromDate"
                        label="Dari Tanggal"
                        placeholder="Mulai..."
                        clearable={false}
                    />

                    <FormDatePicker<PembelianFilterValues>
                        name="toDate"
                        label="Sampai Tanggal"
                        placeholder="Selesai..."
                        clearable={false}
                    />

                    <Controller
                        name="includeItems"
                        control={methods.control}
                        render={({ field }) => (
                            <div className="flex items-center gap-3 border border-slate-100 bg-white p-3 rounded-xl shadow-xs">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-700">Sertakan Detail Barang</span>
                                    <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Tampilkan nama & harga barang yang dibeli saat baris faktur diperluas (diklik) dan di cetakan PDF</span>
                                </div>
                            </div>
                        )}
                    />

                    <Controller
                        name="includePayments"
                        control={methods.control}
                        render={({ field }) => (
                            <div className="flex items-center gap-3 border border-slate-100 bg-white p-3 rounded-xl shadow-xs">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-bold text-slate-700">Sertakan Histori Bayar</span>
                                    <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Tampilkan catatan cicilan pembayaran, sisa hutang, & kas bank saat baris diperluas dan di cetakan PDF</span>
                                </div>
                            </div>
                        )}
                    />
                </FilterForm>
            </Card>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Pembelian */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Faktur (Kotor)
                    </div>
                    <div className="text-lg font-extrabold text-slate-800 mt-1">
                        {isLoading ? (
                            <Skeleton className="h-6 w-32 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_amount ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconShoppingCart size={40} className="text-slate-100/80" />
                    </div>
                </div>

                {/* Total Retur */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Nilai Retur
                    </div>
                    <div className="text-lg font-extrabold text-amber-600 mt-1">
                        {isLoading ? (
                            <Skeleton className="h-6 w-28 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_retur ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconArrowBackUp size={40} className="text-amber-100/50" />
                    </div>
                </div>

                {/* Total Pembelian Bersih */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Pembelian Bersih
                    </div>
                    <div className="text-lg font-extrabold text-emerald-600 mt-1">
                        {isLoading ? (
                            <Skeleton className="h-6 w-32 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_net ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconCoin size={40} className="text-emerald-100/50" />
                    </div>
                </div>

                {/* Total Sisa Hutang */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Sisa Hutang
                    </div>
                    <div className={`text-lg font-extrabold mt-1 ${(reportData?.total_hutang ?? 0) > 0 ? "text-rose-600 animate-pulse" : "text-slate-500"}`}>
                        {isLoading ? (
                            <Skeleton className="h-6 w-32 mt-1" />
                        ) : (
                            formatRupiah(reportData?.total_hutang ?? 0)
                        )}
                    </div>
                    <div className="absolute right-4 bottom-4 text-slate-100">
                        <IconTrendingDown size={40} className="text-rose-100/30" />
                    </div>
                </div>
            </div>

            {/* Custom Table with Expandable Rows */}
            <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-6 overflow-hidden">
                <h4 className="text-xs font-bold text-slate-800 mb-4">
                    Transaksi Pembelian & Detail Log
                </h4>

                <div className="relative border border-slate-100 rounded-xl overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center"></TableHead>
                                <TableHead className="w-12 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">No.</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">Tanggal</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">No. Faktur</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">Supplier</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 text-center">Metode</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 text-right">Faktur (Rp)</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 text-right">Retur (Rp)</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 text-right">Net (Rp)</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3 text-right">Sisa Hutang</TableHead>
                                <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3">Operator</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index} className="hover:bg-transparent border-b border-slate-100">
                                        {Array.from({ length: 11 }).map((_, cIdx) => (
                                            <TableCell key={cIdx} className="py-4 px-3">
                                                <Skeleton className="h-4 w-full bg-slate-100/80 animate-pulse rounded-lg" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : !reportData || reportData.receivings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center py-12 text-slate-400 text-xs font-medium">
                                        Tidak ada data transaksi pembelian ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reportData.receivings.map((row) => {
                                    const isExpanded = !!expandedRows[row.no_faktur];
                                    return (
                                        <React.Fragment key={row.no_faktur}>
                                            <TableRow
                                                className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 cursor-pointer"
                                                onClick={() => toggleRow(row.no_faktur)}
                                            >
                                                <TableCell className="text-center py-3.5 px-3">
                                                    <button className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer">
                                                        {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-center text-slate-500 font-medium text-xs font-mono py-3.5 px-3">{row.no}</TableCell>
                                                <TableCell className="text-slate-600 font-semibold text-xs py-3.5 px-3">{row.tanggal}</TableCell>
                                                <TableCell className="text-slate-800 font-bold text-xs font-mono py-3.5 px-3">{row.no_faktur}</TableCell>
                                                <TableCell className="text-slate-700 font-bold text-xs py-3.5 px-3">{row.supplier}</TableCell>
                                                <TableCell className="text-center py-3.5 px-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${row.pembayaran === "LUNAS"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                                        }`}>
                                                        {row.pembayaran}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right text-slate-800 font-semibold text-xs py-3.5 px-3">{formatRupiah(row.jumlah)}</TableCell>
                                                <TableCell className="text-right text-amber-600 font-semibold text-xs py-3.5 px-3">{row.retur > 0 ? formatRupiah(row.retur) : "-"}</TableCell>
                                                <TableCell className="text-right text-slate-800 font-bold text-xs py-3.5 px-3">{formatRupiah(row.total_net)}</TableCell>
                                                <TableCell className={`text-right font-bold text-xs py-3.5 px-3 ${row.hutang > 0 ? "text-rose-600" : "text-slate-400"}`}>
                                                    {row.hutang > 0 ? formatRupiah(row.hutang) : "Selesai"}
                                                </TableCell>
                                                <TableCell className="text-slate-500 font-medium text-xs py-3.5 px-3">{row.operator}</TableCell>
                                            </TableRow>

                                            {/* Sub-row with Details */}
                                            {isExpanded && (
                                                <TableRow className="bg-slate-50/40 hover:bg-slate-50/40">
                                                    <TableCell colSpan={11} className="p-5 border-b border-slate-100">
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
                                                                    <span className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal">
                                                                        Opsi filter &quot;Sertakan Detail Barang&quot; dinonaktifkan. Aktifkan opsi tersebut untuk memuat daftar produk faktur ini.
                                                                    </span>
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
                                                                    <span className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal">
                                                                        Opsi filter &quot;Sertakan Histori Bayar&quot; dinonaktifkan. Aktifkan opsi tersebut untuk memuat cicilan & sisa hutang.
                                                                    </span>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <PrintConfirmDialog
                open={isPrintDialogOpen}
                onOpenChange={setIsPrintDialogOpen}
                onConfirm={handlePrintConfirm}
            />

            <PrintPreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                pdfUrl={previewUrl}
                title="Pratinjau Laporan Pembelian & Hutang Supplier"
            />
        </div>
    );
}
