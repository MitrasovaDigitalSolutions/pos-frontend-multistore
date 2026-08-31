"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { useDeleteAssetCategory } from "../../api/asset-categories-api";
import type { AssetCategory } from "../../types";

interface AssetCategoriesTableProps {
    categories: AssetCategory[];
    onEdit: (category: AssetCategory) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    onRefetch?: () => void;
}

export function AssetCategoriesTable({
    categories,
    onEdit,
    isLoading = false,
    isFetching = false,
}: AssetCategoriesTableProps) {
    const deleteCategory = useDeleteAssetCategory();
    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [categoryToDelete, setCategoryToDelete] = useState<AssetCategory | null>(null);

    const handleDelete = (c: AssetCategory) => {
        setCategoryToDelete(c);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!categoryToDelete) return;
        deleteCategory.mutate(categoryToDelete.uid, {
            onSuccess: () => {
                toast.success(`Kategori '${categoryToDelete.nama}' berhasil dihapus.`);
                setIsConfirmOpen(false);
                setCategoryToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus kategori aset.");
            },
        });
    };

    const columns: ColumnDef<AssetCategory>[] = useMemo(
        () => [
            {
                accessorKey: "kode",
                header: "Kode",
                size: 110,
                cell: ({ row }) => (
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                        {row.original.kode || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "nama",
                header: "Nama Kategori",
                cell: ({ row }) => (
                    <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {row.original.nama}
                        </div>
                        {row.original.keterangan && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                                {row.original.keterangan}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "assets_count",
                header: "Jumlah Aset",
                size: 110,
                cell: ({ row }) => {
                    const count = row.original.assets_count ?? 0;
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                            {count} Unit
                        </span>
                    );
                },
            },
            {
                id: "coaAsset",
                header: "Akun Aset",
                cell: ({ row }) => {
                    const coa = row.original.coaAsset;
                    if (!coa) return <span className="text-slate-400 text-xs">-</span>;
                    return (
                        <div className="text-xs">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                [{coa.kode}]
                            </span>{" "}
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {coa.nama}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "coaAkumulasi",
                header: "Akumulasi Penyusutan",
                cell: ({ row }) => {
                    const coa = row.original.coaAkumulasiPenyusutan;
                    if (!coa) return <span className="text-slate-400 text-xs">-</span>;
                    return (
                        <div className="text-xs">
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                [{coa.kode}]
                            </span>{" "}
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {coa.nama}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "coaBeban",
                header: "Beban Penyusutan",
                cell: ({ row }) => {
                    const coa = row.original.coaBebanPenyusutan;
                    if (!coa) return <span className="text-slate-400 text-xs">-</span>;
                    return (
                        <div className="text-xs">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                [{coa.kode}]
                            </span>{" "}
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {coa.nama}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: "Aksi",
                size: 90,
                cell: ({ row }) => {
                    const c = row.original;
                    const hasAssets = (c.assets_count ?? 0) > 0;
                    return (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(c)}
                                className="h-7.5 w-7.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg cursor-pointer transition-colors"
                                title="Edit Kategori"
                            >
                                <IconEdit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(c)}
                                disabled={hasAssets}
                                className="h-7.5 w-7.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={
                                    hasAssets
                                        ? "Tidak dapat dihapus karena memiliki aset terdaftar"
                                        : "Hapus Kategori"
                                }
                            >
                                <IconTrash className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [onEdit]
    );

    return (
        <>
            <DataTable
                columns={columns}
                data={categories}
                isLoading={isLoading}
                isFetching={isFetching}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Kategori Aset?"
                description={`Apakah Anda yakin ingin menghapus kategori aset '${categoryToDelete?.nama}'? Tindakan ini tidak dapat dibatalkan.`}
                confirmText={deleteCategory.isPending ? "Menghapus..." : "Hapus Kategori"}
                variant="danger"
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
