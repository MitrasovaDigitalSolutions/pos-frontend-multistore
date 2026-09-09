"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import {
    IconAlertTriangle,
    IconAssembly,
    IconBan,
    IconBox,
    IconCalendar,
    IconCheck,
    IconEdit,
    IconNotes,
    IconPackage,
    IconTrash,
    IconUser,
} from "@tabler/icons-react";
import {
    useDeleteProduction,
    useProductionDetail,
    useVoidProduction,
} from "../api/production-api";
import type { ProductionMaterial, ProductionOutput } from "../types";
import { ProductionFinalizeDialog } from "./production-finalize-dialog";

interface ProductionDetailDialogProps {
    productionUid: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductionDetailDialog({
    productionUid,
    open,
    onOpenChange,
}: ProductionDetailDialogProps) {
    const router = useAppRouter();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasManagePermission =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);

    const { data: res, isLoading } = useProductionDetail(productionUid);
    const production = res?.data;

    const deleteMutation = useDeleteProduction();
    const voidMutation = useVoidProduction();

    const totalOutputQty = (production?.outputs || []).reduce(
        (sum: number, o: ProductionOutput) => sum + Number(o.kuantitas || 0),
        0
    );

    const totalMaterialQty = (production?.materials || []).reduce(
        (sum: number, m: ProductionMaterial) => sum + Number(m.kuantitas || 0),
        0
    );

    const handleDelete = async () => {
        if (!productionUid) return;
        try {
            await deleteMutation.mutateAsync(productionUid);
            toast.success("Draft produksi berhasil dihapus.");
            setIsDeleteConfirmOpen(false);
            onOpenChange(false);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error?.message || "Gagal menghapus draft produksi.");
        }
    };

    const handleVoid = async () => {
        if (!productionUid) return;
        try {
            await voidMutation.mutateAsync(productionUid);
            toast.success("Transaksi produksi berhasil dibatalkan (void).");
            setIsVoidConfirmOpen(false);
            onOpenChange(false);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error?.message || "Gagal membatalkan transaksi produksi.");
        }
    };

    const handleEdit = () => {
        if (!production) return;
        onOpenChange(false);
        router.push(ROUTES.ADMIN_PRODUCTION_EDIT(production.uid));
    };

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shrink-0">
                            <IconAssembly size={16} />
                        </div>
                        <span className="text-sm sm:text-base font-extrabold text-slate-800">
                            Detail Produksi Harian
                        </span>
                    </div>
                }
                className="sm:max-w-4xl"
                scrollable={true}
            >
                {isLoading ? (
                    <div className="space-y-3 py-1">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Skeleton className="h-44 w-full rounded-xl" />
                            <Skeleton className="h-44 w-full rounded-xl" />
                        </div>
                    </div>
                ) : !production ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                        Data transaksi produksi tidak ditemukan.
                    </div>
                ) : (
                    <div className="space-y-3 pb-1">
                        {/* Compact Metadata Strip */}
                        <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
                                <div>
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                        No. Produksi
                                    </span>
                                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                                        {production.nomor_produksi}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                        Tanggal Mulai
                                    </span>
                                    <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                                        <IconCalendar size={12} className="text-slate-400 shrink-0" />
                                        <span>
                                            {formatToReadableDate(
                                                production.tanggal_mulai || production.tanggal
                                            )}
                                        </span>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                        Tanggal Selesai
                                    </span>
                                    <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                                        <IconCalendar size={12} className="text-slate-400 shrink-0" />
                                        <span>
                                            {production.tanggal_selesai
                                                ? formatToReadableDate(production.tanggal_selesai)
                                                : production.status === "draft"
                                                    ? "Belum Selesai (Draft)"
                                                    : "-"}
                                        </span>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                        Operator
                                    </span>
                                    <div className="flex items-center gap-1 font-semibold text-slate-700 text-xs truncate">
                                        <IconUser size={13} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{production.user?.name || "System"}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                                        Status
                                    </span>
                                    <StatusBadge status={production.status} />
                                </div>
                            </div>

                            {/* Void Note if voided */}
                            {production.status === "void" && production.voided_at && (
                                <div className="pt-2 border-t border-rose-200/60 flex items-center gap-1.5 text-[11px] text-rose-700 font-medium">
                                    <IconBan size={14} className="text-rose-500 shrink-0" />
                                    <span>
                                        Dibatalkan (Void) pada {formatToReadableDate(production.voided_at)}. Stok telah dipulihkan.
                                    </span>
                                </div>
                            )}

                            {production.catatan && (
                                <div className="pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-slate-600">
                                    <IconNotes size={13} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span className="italic leading-snug">{production.catatan}</span>
                                </div>
                            )}
                        </div>

                        {/* Side-by-Side 2-Column Compact Tables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                            {/* Column 1: Bahan Baku Terpakai */}
                            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs bg-white">
                                <div className="bg-amber-50/70 border-b border-amber-100/80 px-3 py-2 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <IconBox size={15} className="text-amber-600 shrink-0" />
                                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide truncate">
                                            Bahan Terpakai
                                        </h4>
                                        <span className="text-[10px] text-amber-700/80 font-medium">
                                            ({production.materials?.length || 0})
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded-md font-mono shrink-0">
                                        {formatRupiah(production.total_biaya_bahan)}
                                    </span>
                                </div>

                                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-[11px] border-collapse">
                                        <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200/80 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-1.5 px-2.5">Bahan</th>
                                                <th className="py-1.5 px-2 text-right">Qty</th>
                                                <th className="py-1.5 px-2 text-right">Harga</th>
                                                <th className="py-1.5 px-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(production.materials || []).map((m: ProductionMaterial) => (
                                                <tr key={m.uid} className="hover:bg-slate-50/60">
                                                    <td className="py-1.5 px-2.5">
                                                        <span className="font-semibold text-slate-800 block truncate max-w-[130px]" title={m.product?.nama}>
                                                            {m.product?.nama || "Item Bahan"}
                                                        </span>
                                                        {m.product?.barcode && (
                                                            <span className="text-[9px] text-slate-400 font-mono block">
                                                                {m.product.barcode}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-1.5 px-2 text-right font-medium text-slate-700 whitespace-nowrap">
                                                        {m.kuantitas}
                                                    </td>
                                                    <td className="py-1.5 px-2 text-right text-slate-500 font-mono whitespace-nowrap">
                                                        {formatRupiah(m.harga_satuan)}
                                                    </td>
                                                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-800 font-mono whitespace-nowrap">
                                                        {formatRupiah(m.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-slate-200 bg-slate-50/80 font-bold text-[10px] text-slate-700">
                                            <tr>
                                                <td className="py-1.5 px-2.5">Total</td>
                                                <td className="py-1.5 px-2 text-right">{totalMaterialQty}</td>
                                                <td className="py-1.5 px-2"></td>
                                                <td className="py-1.5 px-2.5 text-right font-mono text-amber-900 font-extrabold">
                                                    {formatRupiah(production.total_biaya_bahan)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Column 2: Hasil Barang Jadi */}
                            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs bg-white">
                                <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-3 py-2 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <IconPackage size={15} className="text-emerald-600 shrink-0" />
                                        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide truncate">
                                            Barang Jadi
                                        </h4>
                                        <span className="text-[10px] text-emerald-700/80 font-medium">
                                            ({production.outputs?.length || 0})
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-extrabold text-emerald-900 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md font-mono shrink-0">
                                        {totalOutputQty} Pcs
                                    </span>
                                </div>

                                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-[11px] border-collapse">
                                        <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200/80 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-1.5 px-2.5">Produk Jadi</th>
                                                <th className="py-1.5 px-2 text-right">Qty</th>
                                                <th className="py-1.5 px-2 text-right">HPP</th>
                                                <th className="py-1.5 px-2.5 text-right">Total HPP</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(production.outputs || []).map((o: ProductionOutput) => (
                                                <tr key={o.uid} className="hover:bg-slate-50/60">
                                                    <td className="py-1.5 px-2.5">
                                                        <span className="font-semibold text-slate-800 block truncate max-w-[130px]" title={o.product?.nama}>
                                                            {o.product?.nama || "Item Barang Jadi"}
                                                        </span>
                                                        {o.product?.barcode && (
                                                            <span className="text-[9px] text-slate-400 font-mono block">
                                                                {o.product.barcode}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-1.5 px-2 text-right font-bold text-emerald-700 whitespace-nowrap">
                                                        {o.kuantitas}
                                                    </td>
                                                    <td className="py-1.5 px-2 text-right text-slate-500 font-mono whitespace-nowrap">
                                                        {formatRupiah(o.hpp_satuan)}
                                                    </td>
                                                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-800 font-mono whitespace-nowrap">
                                                        {formatRupiah(o.subtotal_hpp)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-slate-200 bg-slate-50/80 font-bold text-[10px] text-slate-700">
                                            <tr>
                                                <td className="py-1.5 px-2.5">Total</td>
                                                <td className="py-1.5 px-2 text-right font-bold text-emerald-800">{totalOutputQty}</td>
                                                <td className="py-1.5 px-2"></td>
                                                <td className="py-1.5 px-2.5 text-right font-mono text-emerald-900 font-extrabold">
                                                    {formatRupiah(
                                                        (production.outputs || []).reduce(
                                                            (s, o) => s + Number(o.subtotal_hpp || 0),
                                                            0
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons in Footer */}
                        {hasManagePermission && (
                            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    {production.status === "draft" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsDeleteConfirmOpen(true)}
                                            className="h-8.5 px-3 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl cursor-pointer"
                                        >
                                            <IconTrash size={14} />
                                            <span>Hapus Draft</span>
                                        </Button>
                                    )}

                                    {production.status === "completed" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsVoidConfirmOpen(true)}
                                            className="h-8.5 px-3 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl cursor-pointer"
                                        >
                                            <IconBan size={14} />
                                            <span>Batalkan (Void)</span>
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {production.status === "draft" && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleEdit}
                                                className="h-8.5 px-3 text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer"
                                            >
                                                <IconEdit size={14} />
                                                <span>Edit Draft</span>
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => setIsFinalizeOpen(true)}
                                                className="h-8.5 px-3.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow-sm shadow-emerald-600/20"
                                            >
                                                <IconCheck size={14} />
                                                <span>Finalisasi Produksi</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </BaseDialog>

            {/* Confirm Dialog: Delete Draft */}
            <ConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                title="Hapus Draft Produksi"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus draft produksi{" "}
                        <span className="font-mono font-bold text-slate-800">
                            #{production?.nomor_produksi}
                        </span>
                        ? Tindakan ini akan menghapus data draft secara permanen.
                    </span>
                }
                confirmText="Hapus Draft"
                cancelText="Batal"
                variant="danger"
                isLoading={deleteMutation.isPending}
                onConfirm={handleDelete}
            />

            {/* Confirm Dialog: Void Completed */}
            <ConfirmDialog
                open={isVoidConfirmOpen}
                onOpenChange={setIsVoidConfirmOpen}
                title="Batalkan (Void) Produksi"
                description={
                    <div className="space-y-2 text-left">
                        <p>
                            Apakah Anda yakin ingin membatalkan transaksi produksi{" "}
                            <span className="font-mono font-bold text-slate-800">
                                #{production?.nomor_produksi}
                            </span>
                            ?
                        </p>
                        <div className="flex items-start gap-1.5 p-2 bg-rose-50 border border-rose-200/60 rounded-lg text-rose-800 text-[11px] leading-relaxed">
                            <IconAlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                            <span>
                                Pembatalan ini akan memulihkan stok bahan baku, mengurangi stok barang jadi, dan mencatat pembalikan jurnal. Tindakan ini tidak dapat diulang.
                            </span>
                        </div>
                    </div>
                }
                confirmText="Ya, Batalkan Transaksi"
                cancelText="Kembali"
                variant="danger"
                isLoading={voidMutation.isPending}
                onConfirm={handleVoid}
            />

            {/* Finalize Dialog */}
            <ProductionFinalizeDialog
                open={isFinalizeOpen}
                onOpenChange={setIsFinalizeOpen}
                productionUid={productionUid}
                nomorProduksi={production?.nomor_produksi}
                onSuccess={() => {
                    onOpenChange(false);
                }}
            />
        </>
    );
}

