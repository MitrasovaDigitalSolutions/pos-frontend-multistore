"use client";

import { useState } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    IconBuildingWarehouse,
    IconTrendingDown,
    IconCalendar,
    IconTrash,
    IconFileText,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useAssetDetail, useDeleteAssetPenyusutan } from "../../api/assets-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import type { Asset, AssetPenyusutan } from "../../types";

interface AssetDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assetUid: string | null;
    onAddDepreciation?: (asset: Asset) => void;
}

export function AssetDetailSheet({
    open,
    onOpenChange,
    assetUid,
    onAddDepreciation,
}: AssetDetailSheetProps) {
    const { data: asset, isLoading, refetch } = useAssetDetail(assetUid);
    const deletePenyusutan = useDeleteAssetPenyusutan();

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

    const logs = asset?.penyusutan || [];
    const maxSusut = asset
        ? Math.max(0, (Number(asset.nilai_buku) || 0) - (Number(asset.nilai_residu) || 0))
        : 0;

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <div className="flex items-center gap-2">
                        <IconBuildingWarehouse className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span>Detail & Riwayat Aset</span>
                    </div>
                }
                className="max-w-3xl"
            >
                {isLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                        Memuat rincian data aset...
                    </div>
                ) : !asset ? (
                    <div className="p-8 text-center text-xs text-rose-500">
                        Data aset tidak ditemukan.
                    </div>
                ) : (
                    <div className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto pr-1">
                        {/* 1. Header Information */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                                        {asset.nama}
                                    </h3>
                                    {statusBadge(asset.status)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                                    <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border text-[11px]">
                                        {asset.nomor_aset}
                                    </span>
                                    {asset.kode_aset && (
                                        <span className="font-mono text-[11px]">
                                            SN: {asset.kode_aset}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>Kategori: {asset.category?.nama || "-"}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <IconCalendar className="w-3.5 h-3.5" />
                                        {formatToReadableDate(asset.tanggal_perolehan)}
                                    </span>
                                </div>
                            </div>

                            {asset.status === "aktif" && maxSusut > 0 && onAddDepreciation && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        onOpenChange(false);
                                        onAddDepreciation(asset);
                                    }}
                                    className="h-8 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
                                >
                                    <IconTrendingDown className="w-3.5 h-3.5" />
                                    <span>Susutkan Aset</span>
                                </Button>
                            )}
                        </div>

                        {/* 2. Financial Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Harga Perolehan
                                </span>
                                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
                                    {formatRupiah(Number(asset.harga_perolehan) || 0)}
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Akumulasi Susut
                                </span>
                                <div className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400">
                                    {formatRupiah(Number(asset.total_penyusutan) || 0)}
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Nilai Buku Saat Ini
                                </span>
                                <div className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {formatRupiah(Number(asset.nilai_buku) || 0)}
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Nilai Residu
                                </span>
                                <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300">
                                    {formatRupiah(Number(asset.nilai_residu) || 0)}
                                </div>
                            </div>
                        </div>

                        {/* 3. Accounting & Funding Source */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                                    Akun Buku Besar (COA Terkait)
                                </span>
                                <div className="space-y-1 text-[11px]">
                                    <div>
                                        <span className="text-slate-400">Akun Aset: </span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            {(() => {
                                                const coa =
                                                    asset.category?.coa_asset ||
                                                    asset.category?.coaAsset;
                                                return coa ? `[${coa.kode}] ${coa.nama}` : "-";
                                            })()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Akumulasi: </span>
                                        <span className="font-bold text-amber-600 dark:text-amber-400">
                                            {(() => {
                                                const coa =
                                                    asset.category?.coa_akumulasi_penyusutan ||
                                                    asset.category?.coaAkumulasiPenyusutan;
                                                return coa ? `[${coa.kode}] ${coa.nama}` : "-";
                                            })()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Beban Susut: </span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                            {(() => {
                                                const coa =
                                                    asset.category?.coa_beban_penyusutan ||
                                                    asset.category?.coaBebanPenyusutan;
                                                return coa ? `[${coa.kode}] ${coa.nama}` : "-";
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                                    Sumber Dana & Pencatat
                                </span>
                                <div className="space-y-1 text-[11px]">
                                    <div>
                                        <span className="text-slate-400">Metode: </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                                            {asset.sumber_perolehan === "kas"
                                                ? "Kas / Bank"
                                                : "Non-Kas / Modal"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Akun Sumber: </span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {asset.sumber_perolehan === "kas"
                                                ? asset.cashAccount?.nama || "-"
                                                : asset.offsetCoa
                                                ? `[${asset.offsetCoa.kode}] ${asset.offsetCoa.nama}`
                                                : "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Pencatat: </span>
                                        <span className="text-slate-600 dark:text-slate-400">
                                            {asset.creator?.name || asset.creator?.username || "-"}
                                        </span>
                                    </div>
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

                        {/* 4. Depreciation History Table */}
                        <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <IconTrendingDown className="w-4 h-4 text-amber-500" />
                                    <span>Riwayat Transaksi Penyusutan ({logs.length})</span>
                                </h4>
                            </div>

                            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="p-2.5 text-left">No. Transaksi / Tgl</th>
                                            <th className="p-2.5 text-right">Nominal Susut</th>
                                            <th className="p-2.5 text-center">Perubahan Nilai Buku</th>
                                            <th className="p-2.5 text-left">Keterangan</th>
                                            <th className="p-2.5 text-center w-12">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {logs.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="p-6 text-center text-slate-400"
                                                >
                                                    Belum ada riwayat penyusutan pada aset ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            logs.map((pys) => (
                                                <tr
                                                    key={pys.uid}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                                >
                                                    <td className="p-2.5">
                                                        <div className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                                                            {pys.nomor_transaksi}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">
                                                            {formatToReadableDate(pys.tanggal)}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 text-right font-extrabold text-amber-600 dark:text-amber-400">
                                                        {formatRupiah(Number(pys.nominal) || 0)}
                                                    </td>
                                                    <td className="p-2.5 text-center text-[11px]">
                                                        <span className="text-slate-500">
                                                            {formatRupiah(
                                                                Number(pys.nilai_buku_sebelum) || 0
                                                            )}
                                                        </span>
                                                        <span className="text-slate-400 mx-1">
                                                            →
                                                        </span>
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                            {formatRupiah(
                                                                Number(pys.nilai_buku_sesudah) || 0
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="p-2.5 text-slate-600 dark:text-slate-400 text-[11px]">
                                                        {pys.keterangan || "-"}
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleVoidClick(pys)}
                                                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                                                            title="Batalkan / Void Penyusutan"
                                                        >
                                                            <IconTrash className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
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
