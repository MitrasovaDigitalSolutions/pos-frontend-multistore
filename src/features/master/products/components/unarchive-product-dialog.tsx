"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconArchiveOff, IconBarcode, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUnarchiveProduct } from "../api/products-api";
import type { Product } from "../types";

interface UnarchiveProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

export function UnarchiveProductDialog({
    open,
    onOpenChange,
    product,
}: UnarchiveProductDialogProps) {
    const [barcode, setBarcode] = useState<string>("");
    const [prevOpen, setPrevOpen] = useState(open);
    const [prevProductUid, setPrevProductUid] = useState(product?.uid);

    // Synchronize barcode state when dialog opens or target product changes
    if (open !== prevOpen || product?.uid !== prevProductUid) {
        setPrevOpen(open);
        setPrevProductUid(product?.uid);
        if (open && product) {
            setBarcode(product.archived_barcode || product.barcode || "");
        }
    }

    const unarchiveMutation = useUnarchiveProduct();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        const trimmedBarcode = barcode.trim();

        unarchiveMutation.mutate(
            {
                uid: product.uid,
                barcode: trimmedBarcode || undefined,
            },
            {
                onSuccess: () => {
                    toast.success(`Produk "${product.nama}" berhasil diaktifkan kembali!`);
                    onOpenChange(false);
                },
                onError: (err) => {
                    const msg = err instanceof Error ? err.message : "Gagal mengaktifkan kembali produk.";
                    toast.error(msg);
                },
            }
        );
    };

    if (!product) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <IconArchiveOff className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                            Aktifkan Kembali Produk
                        </span>
                        <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            Kembalikan status produk yang diarsipkan menjadi aktif
                        </p>
                    </div>
                </div>
            }
            className="sm:max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                {/* Product info summary box */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {product.nama}
                        </span>
                        <span className="badge text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase shrink-0">
                            Diarsipkan
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        {product.category?.nama && (
                            <span>Kategori: <strong className="text-slate-700 dark:text-slate-300">{product.category.nama}</strong></span>
                        )}
                        {product.brand?.nama && (
                            <span>Brand: <strong className="text-slate-700 dark:text-slate-300">{product.brand.nama}</strong></span>
                        )}
                    </div>
                </div>

                {/* Barcode input field */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <IconBarcode className="w-4 h-4 text-slate-400" />
                        <span>Barcode / SKU</span>
                    </label>
                    <Input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Masukkan barcode baru atau gunakan barcode lama..."
                        className="font-mono text-xs h-9.5 rounded-xl"
                        disabled={unarchiveMutation.isPending}
                    />
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Barcode lama terisi otomatis jika tersedia. Anda dapat mengubahnya jika terjadi konflik barcode dengan produk lain.
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={unarchiveMutation.isPending}
                        className="text-xs h-9 rounded-xl font-semibold cursor-pointer"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={unarchiveMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                        <IconCheck className="w-4 h-4" />
                        {unarchiveMutation.isPending ? "Mengaktifkan..." : "Aktifkan Kembali"}
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}
