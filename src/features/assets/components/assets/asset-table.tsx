"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    IconEye,
    IconTrendingDown,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useDeleteAsset } from "../../api/assets-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import type { Asset } from "../../types";

interface AssetTableProps {
    assets: Asset[];
    onDetail: (asset: Asset) => void;
    onDepreciate: (asset: Asset) => void;
    onEdit: (asset: Asset) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    onRefetch?: () => void;
}

export function AssetTable({
    assets,
    onDetail,
    onDepreciate,
    onEdit,
    isLoading = false,
    isFetching = false,
}: AssetTableProps) {
    const deleteAsset = useDeleteAsset();
    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

    const handleDelete = (asset: Asset) => {
        setAssetToDelete(asset);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!assetToDelete) return;
        deleteAsset.mutate(assetToDelete.uid, {
            onSuccess: () => {
                toast.success(`Data aset '${assetToDelete.nama}' berhasil dihapus.`);
                setIsConfirmOpen(false);
                setAssetToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus data aset.");
            },
        });
    };

    const columns: ColumnDef<Asset>[] = useMemo(
        () => [
            {
                accessorKey: "nomor_aset",
                header: "No. Aset",
                size: 130,
                cell: ({ row }) => (
                    <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 block w-fit">
                            {row.original.nomor_aset}
                        </span>
                        {row.original.kode_aset && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                                SN: {row.original.kode_aset}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "nama",
                header: "Nama Aset & Kategori",
                cell: ({ row }) => (
                    <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {row.original.nama}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                {row.original.category?.nama || "-"}
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                                {row.original.sumber_perolehan === "kas" ? "Kas/Bank" : "Non-Kas"}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "tanggal_perolehan",
                header: "Tgl Perolehan",
                size: 110,
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {formatToReadableDate(row.original.tanggal_perolehan)}
                    </span>
                ),
            },
            {
                accessorKey: "harga_perolehan",
                header: "Harga Perolehan",
                size: 130,
                cell: ({ row }) => (
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formatRupiah(Number(row.original.harga_perolehan) || 0)}
                    </span>
                ),
            },
            {
                accessorKey: "total_penyusutan",
                header: "Akumulasi Susut",
                size: 130,
                cell: ({ row }) => (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {formatRupiah(Number(row.original.total_penyusutan) || 0)}
                    </span>
                ),
            },
            {
                accessorKey: "nilai_buku",
                header: "Nilai Buku",
                size: 130,
                cell: ({ row }) => (
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(Number(row.original.nilai_buku) || 0)}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                size: 100,
                cell: ({ row }) => {
                    const s = row.original.status;
                    if (s === "aktif") {
                        return (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                Aktif
                            </span>
                        );
                    }
                    if (s === "habis_susut") {
                        return (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                Habis Susut
                            </span>
                        );
                    }
                    if (s === "dijual") {
                        return (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                Dijual
                            </span>
                        );
                    }
                    return (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border">
                            {s}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                header: "Aksi",
                size: 130,
                cell: ({ row }) => {
                    const a = row.original;
                    const maxSusut =
                        (Number(a.nilai_buku) || 0) - (Number(a.nilai_residu) || 0);
                    const canDepreciate = a.status === "aktif" && maxSusut > 0;
                    const hasDepreciationHistory = (Number(a.total_penyusutan) || 0) > 0;

                    return (
                        <div className="flex items-center gap-0.5">
                            {/* Detail */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDetail(a)}
                                className="h-7.5 w-7.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg cursor-pointer transition-colors"
                                title="Lihat Detail & Riwayat Penyusutan"
                            >
                                <IconEye className="w-4 h-4" />
                            </Button>

                            {/* Susutkan */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDepreciate(a)}
                                disabled={!canDepreciate}
                                className="h-7.5 w-7.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={
                                    canDepreciate
                                        ? "Catat Penyusutan"
                                        : "Aset sudah habis disusutkan"
                                }
                            >
                                <IconTrendingDown className="w-4 h-4" />
                            </Button>

                            {/* Edit */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(a)}
                                className="h-7.5 w-7.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg cursor-pointer transition-colors"
                                title="Edit Info Aset"
                            >
                                <IconEdit className="w-4 h-4" />
                            </Button>

                            {/* Hapus */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(a)}
                                disabled={hasDepreciationHistory}
                                className="h-7.5 w-7.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={
                                    hasDepreciationHistory
                                        ? "Tidak dapat dihapus karena memiliki riwayat penyusutan"
                                        : "Hapus Aset"
                                }
                            >
                                <IconTrash className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [onDetail, onDepreciate, onEdit]
    );

    return (
        <>
            <DataTable
                columns={columns}
                data={assets}
                isLoading={isLoading}
                isFetching={isFetching}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Data Aset?"
                description={`Apakah Anda yakin ingin menghapus data aset '${assetToDelete?.nama}' (${assetToDelete?.nomor_aset})? Tindakan ini akan mengembalikan saldo kas jika dibayar secara tunai.`}
                confirmText={deleteAsset.isPending ? "Menghapus..." : "Hapus Aset"}
                variant="danger"
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
