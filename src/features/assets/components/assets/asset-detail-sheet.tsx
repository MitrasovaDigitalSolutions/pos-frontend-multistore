"use client";

import React, { useState, useMemo } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import {
    IconBuildingWarehouse,
    IconTrendingDown,
    IconCalendar,
    IconFileText,
    IconBuildingBank,
    IconReceipt2,
    IconArrowRight,
    IconCoin,
    IconPlus,
    IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useAssetDetail, useDeleteAssetPenyusutan } from "../../api/assets-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import { AssetDetailDepreciationForm } from "./form/asset-detail-depreciation-form";
import type { Asset, AssetPenyusutan } from "../../types";

interface AssetDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assetUid: string | null;
    initialMode?: "history" | "form";
}

export function AssetDetailSheet({
    open,
    onOpenChange,
    assetUid,
    initialMode = "history",
}: AssetDetailSheetProps) {
    const { data: asset, isLoading, isFetching, refetch } = useAssetDetail(assetUid);
    const deletePenyusutan = useDeleteAssetPenyusutan();

    const [isFormActive, setIsFormActive] = useState<boolean>(initialMode === "form");
    const [isConfirmVoidOpen, setIsConfirmVoidOpen] = useState<boolean>(false);
    const [penyusutanToVoid, setPenyusutanToVoid] = useState<AssetPenyusutan | null>(null);

    const handleVoidClick = (pys: AssetPenyusutan) => {
        setPenyusutanToVoid(pys);
        setIsConfirmVoidOpen(true);
    };

    const handleConfirmVoid = () => {
        if (!penyusutanToVoid || !assetUid) return;
        deletePenyusutan.mutate(
            {
                penyusutanUid: penyusutanToVoid.uid,
                assetUid: assetUid,
            },
            {
                onSuccess: () => {
                    toast.success("Log penyusutan berhasil dibatalkan dan nilai buku aset dikembalikan.");
                    setIsConfirmVoidOpen(false);
                    setPenyusutanToVoid(null);
                    refetch();
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membatalkan log penyusutan.");
                },
            }
        );
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "aktif":
                return (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Aktif
                    </span>
                );
            case "habis_susut":
                return (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Habis Susut
                    </span>
                );
            case "dijual":
                return (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        Dijual
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border">
                        {status}
                    </span>
                );
        }
    };

    const logs = useMemo(() => asset?.penyusutan || [], [asset]);
    const maxSusut = asset
        ? Math.max(0, (Number(asset.nilai_buku) || 0) - (Number(asset.nilai_residu) || 0))
        : 0;

    // Columns definition for DataTable
    const columns: ColumnDef<AssetPenyusutan>[] = useMemo(
        () => [
            {
                accessorKey: "nomor_transaksi",
                header: "No. Transaksi & Tgl",
                size: 150,
                cell: ({ row }) => (
                    <div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {row.original.nomor_transaksi}
                        </div>
                        <span className="text-[10px] text-slate-400">
                            {formatToReadableDate(row.original.tanggal)}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "nominal",
                header: "Nominal Susut",
                size: 120,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-extrabold text-amber-600 dark:text-amber-400 text-xs",
                },
                cell: ({ row }) => formatRupiah(Number(row.original.nominal) || 0),
            },
            {
                id: "perubahan_nilai_buku",
                header: "Perubahan Nilai Buku",
                size: 160,
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-mono">
                        <span className="text-slate-500">
                            {formatRupiah(Number(row.original.nilai_buku_sebelum) || 0)}
                        </span>
                        <IconArrowRight className="w-2.5 h-2.5 text-slate-400" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(Number(row.original.nilai_buku_sesudah) || 0)}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "keterangan",
                header: "Keterangan",
                size: 160,
                cell: ({ row }) => (
                    <span
                        className="text-slate-600 dark:text-slate-400 text-[11px] truncate block max-w-[150px]"
                        title={row.original.keterangan || "-"}
                    >
                        {row.original.keterangan || "-"}
                    </span>
                ),
            },
        ],
        []
    );

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                            <IconBuildingWarehouse className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 block">
                                Detail & Riwayat Aset
                            </span>
                            <span className="text-[11px] text-slate-500 font-normal block">
                                Rincian lengkap nilai kapitalisasi, saldo buku, dan riwayat mutasi penyusutan
                            </span>
                        </div>
                    </div>
                }
                className="w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl"
            >
                {isLoading ? (
                    <div className="space-y-3 pt-1">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                            <Skeleton className="h-5 w-48 rounded" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-24 rounded" />
                                <Skeleton className="h-4 w-32 rounded" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                            <div className="lg:col-span-5 space-y-2.5">
                                <Skeleton className="h-28 rounded-xl" />
                                <Skeleton className="h-24 rounded-xl" />
                            </div>
                            <div className="lg:col-span-7">
                                <Skeleton className="h-56 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ) : !asset ? (
                    <div className="p-8 text-center text-xs text-rose-500">
                        Data aset tidak ditemukan.
                    </div>
                ) : (
                    <div className="space-y-3 pt-1">
                        {/* 1. Header Information Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                                        {asset.nama}
                                    </h3>
                                    {statusBadge(asset.status)}
                                    {isFetching && (
                                        <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
                                            <IconLoader2 className="w-3 h-3 animate-spin" />
                                            Memperbarui data...
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                                    <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                        {asset.nomor_aset}
                                    </span>
                                    {asset.kode_aset && (
                                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                            SN: {asset.kode_aset}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                        {asset.category?.nama || "-"}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <IconCalendar className="w-3.5 h-3.5" />
                                        {formatToReadableDate(asset.tanggal_perolehan)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Main 2-Column Responsive Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                            {/* Kolom Kiri: Finansial, COA, dan Sumber Dana */}
                            <div className="lg:col-span-5 space-y-3">
                                {/* Metrics 2x2 Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Nilai Buku */}
                                    <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                            Nilai Buku Saat Ini
                                        </span>
                                        <div className="text-xs sm:text-sm font-extrabold text-indigo-700 dark:text-indigo-400 truncate">
                                            {formatRupiah(Number(asset.nilai_buku) || 0)}
                                        </div>
                                    </div>

                                    {/* Harga Perolehan */}
                                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                            Harga Perolehan
                                        </span>
                                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                                            {formatRupiah(Number(asset.harga_perolehan) || 0)}
                                        </div>
                                    </div>

                                    {/* Total Susut */}
                                    <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/30">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                            Akumulasi Susut
                                        </span>
                                        <div className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 truncate">
                                            {formatRupiah(Number(asset.total_penyusutan) || 0)}
                                        </div>
                                    </div>

                                    {/* Nilai Residu */}
                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                            Nilai Residu
                                        </span>
                                        <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 truncate">
                                            {formatRupiah(Number(asset.nilai_residu) || 0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Akun COA & Pembiayaan */}
                                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-100 dark:border-slate-800">
                                        <IconReceipt2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                        <span>Konfigurasi Akun COA</span>
                                    </div>

                                    <div className="space-y-1.5 text-[11px]">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-500">Akun Aset:</span>
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right truncate">
                                                {(() => {
                                                    const coa =
                                                        asset.category?.coa_asset ||
                                                        asset.category?.coaAsset;
                                                    return coa ? `[${coa.kode}] ${coa.nama}` : "-";
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-500">Akum. Susut:</span>
                                            <span className="font-semibold text-amber-600 dark:text-amber-400 text-right truncate">
                                                {(() => {
                                                    const coa =
                                                        asset.category?.coa_akumulasi_penyusutan ||
                                                        asset.category?.coaAkumulasiPenyusutan;
                                                    return coa ? `[${coa.kode}] ${coa.nama}` : "-";
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-500">Beban Susut:</span>
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-right truncate">
                                                {(() => {
                                                    const coa =
                                                        asset.category?.coa_beban_penyusutan ||
                                                        asset.category?.coaBebanPenyusutan;
                                                    return coa ? `[${coa.kode}] ${coa.nama}` : "-";
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-500 flex items-center gap-1">
                                                {asset.sumber_perolehan === "kas" ? (
                                                    <IconBuildingBank className="w-3 h-3 text-indigo-500" />
                                                ) : (
                                                    <IconCoin className="w-3 h-3 text-amber-500" />
                                                )}
                                                Sumber Dana:
                                            </span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                {asset.sumber_perolehan === "kas"
                                                    ? `Kas (${asset.cashAccount?.nama || "-"})`
                                                    : asset.offsetCoa
                                                    ? `Non-Kas ([${asset.offsetCoa.kode}] ${asset.offsetCoa.nama})`
                                                    : "Non-Kas"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-slate-500">Pencatat:</span>
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {asset.creator?.name || asset.creator?.username || "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Catatan jika ada */}
                                {asset.catatan && (
                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                        <IconFileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <span>{asset.catatan}</span>
                                    </div>
                                )}
                            </div>

                            {/* Kolom Kanan: Mode Switcher (DataTable Riwayat vs Form Input) */}
                            <div className="lg:col-span-7">
                                {isFormActive ? (
                                    <AssetDetailDepreciationForm
                                        key={`depreciation-form-${asset.uid}`}
                                        asset={asset}
                                        onSuccess={() => {
                                            refetch();
                                            setIsFormActive(false);
                                        }}
                                        onCancel={() => setIsFormActive(false)}
                                    />
                                ) : (
                                    <div className="space-y-2.5 animate-in fade-in slide-in-from-left-4 duration-200">
                                        <div className="flex items-center justify-between px-1">
                                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                <IconTrendingDown className="w-4 h-4 text-amber-500" />
                                                <span>Riwayat Penyusutan</span>
                                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                    {logs.length}
                                                </span>
                                            </h4>

                                            {asset.status === "aktif" && maxSusut > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsFormActive(true)}
                                                    className="h-6.5 px-2 text-[11px] font-bold text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/60 rounded-lg cursor-pointer flex items-center gap-1"
                                                >
                                                    <IconPlus className="w-3 h-3 text-amber-500" />
                                                    <span>Tambah Penyusutan</span>
                                                </Button>
                                            )}
                                        </div>

                                        {/* Reusable DataTable for Depreciation Logs */}
                                        <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
                                            <DataTable
                                                columns={columns}
                                                data={logs}
                                                isLoading={isLoading}
                                                isFetching={isFetching}
                                                showViewToggle={false}
                                                clientPagination={true}
                                                perPage={5}
                                                emptyMessage="Belum ada riwayat transaksi penyusutan pada aset ini."
                                                onDelete={handleVoidClick}
                                                hideEdit={true}
                                                hideView={true}
                                                maxHeight="380px"
                                                tableClassName="text-xs"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </BaseDialog>

            <ConfirmDialog
                open={isConfirmVoidOpen}
                onOpenChange={setIsConfirmVoidOpen}
                title="Batalkan Log Penyusutan?"
                description={`Apakah Anda yakin ingin membatalkan transaksi penyusutan '${penyusutanToVoid?.nomor_transaksi}' senilai ${formatRupiah(Number(penyusutanToVoid?.nominal) || 0)}? Nilai buku aset akan dikembalikan ke saldo semula.`}
                confirmText={deletePenyusutan.isPending ? "Membatalkan..." : "Ya, Batalkan Penyusutan"}
                variant="danger"
                onConfirm={handleConfirmVoid}
            />
        </>
    );
}
