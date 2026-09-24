"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { AppButton } from "@/components/shared/app-button";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    IconActivity,
    IconArrowDownRight,
    IconArrowUpRight,
    IconCheck,
    IconInfoCircle,
    IconPackage,
    IconPlus,
    IconMinus,
} from "@tabler/icons-react";
import { type AdjustmentInput } from "@/features/stock/schemas/adjustment-schema";
import { useCreateAdjustment } from "@/features/stock/api/stock-api";
import type { Product } from "../types";
import { cn } from "@/lib/utils";

interface ProductAdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onSuccess?: () => void;
}

const QUICK_REASONS = [
    "Koreksi Stok Manual",
    "Barang Rusak / Cacat",
    "Barang Kadaluarsa",
    "Selisih Perhitungan Fisik",
    "Bonus / Hadiah Supplier",
    "Barang Hilang",
];

export function ProductAdjustmentDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
}: ProductAdjustmentDialogProps) {
    const createAdjustment = useCreateAdjustment();
    const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");

    // Reset adjustment type during render when open changes
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setAdjustmentType("add");
        }
    }

    const methods = useForm<{
        amount: number;
        alasan: string;
    }>({
        defaultValues: {
            amount: 1,
            alasan: "Koreksi Stok Manual",
        },
    });

    const { handleSubmit, reset, control, setValue } = methods;
    const watchAmount = useWatch({ control, name: "amount" });
    const watchAlasan = useWatch({ control, name: "alasan" });

    // Reset form values when dialog opens with product
    useEffect(() => {
        if (open && product) {
            reset({
                amount: 1,
                alasan: "Koreksi Stok Manual",
            });
        }
    }, [open, product, reset]);

    const currentStock = Number(product?.stok ?? 0);
    const unitLabel = product?.unit?.simbol || product?.satuan || "Unit";
    const numericAmount = Math.abs(Number(watchAmount) || 0);

    const calculatedDelta = adjustmentType === "add" ? numericAmount : -numericAmount;
    const previewFinalStock = currentStock + calculatedDelta;

    const onSubmit = handleSubmit((data) => {
        if (!product?.uid) {
            toast.error("Data produk tidak valid.");
            return;
        }

        const delta = adjustmentType === "add" ? Math.abs(data.amount) : -Math.abs(data.amount);
        if (delta === 0) {
            toast.error("Kuantitas perubahan stok tidak boleh 0.");
            return;
        }

        const payload: AdjustmentInput = {
            product_uid: product.uid,
            kuantitas: delta,
            alasan: data.alasan.trim(),
        };

        createAdjustment.mutate(payload, {
            onSuccess: () => {
                toast.success(
                    `Stok ${product.nama} berhasil disesuaikan (${delta > 0 ? `+${delta}` : delta} ${unitLabel}).`
                );
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (err: unknown) => {
                const message = err instanceof Error ? err.message : "Gagal menyesuaikan stok produk.";
                toast.error(message);
            },
        });
    });

    if (!product) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            scrollable={false}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/70 shadow-2xs shrink-0">
                        <IconActivity size={17} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm block leading-tight">
                                Penyesuaian Stok Produk
                            </span>
                            <Badge
                                variant="outline"
                                className="text-[10px] font-mono font-bold px-1.5 py-0 rounded bg-slate-100 text-slate-600 border-slate-200"
                            >
                                Adjustment Qty
                            </Badge>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block">
                            Koreksi stok fisik produk secara langsung tanpa perlu sesi Stock Opname
                        </span>
                    </div>
                </div>
            }
            className="sm:max-w-lg"
        >
            <FormProvider {...methods}>
                <form onSubmit={onSubmit} className="space-y-4 pt-1">
                    {/* Product Summary Card */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 shadow-2xs">
                                <IconPackage size={20} />
                            </div>
                            <div className="min-w-0">
                                <span className="font-bold text-xs text-slate-900 block truncate">
                                    {product.nama}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                    <span>Barcode: {product.barcode || "-"}</span>
                                    {product.category && (
                                        <>
                                            <span>•</span>
                                            <span>{product.category.nama}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Current Stock Tag */}
                        <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Stok Saat Ini
                            </span>
                            <div className="flex items-baseline justify-end gap-1">
                                <span className="font-extrabold text-slate-900 text-base font-mono">
                                    {currentStock}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500">
                                    {unitLabel}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mode Selection: Tambah (+) atau Kurang (-) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                            Arah Perubahan Stok
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setAdjustmentType("add")}
                                className={cn(
                                    "p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer",
                                    adjustmentType === "add"
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs ring-1 ring-emerald-500/20"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-md flex items-center justify-center text-xs",
                                    adjustmentType === "add" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                    <IconPlus size={13} className="stroke-[3]" />
                                </div>
                                <span>Tambah Stok (+)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setAdjustmentType("subtract")}
                                className={cn(
                                    "p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer",
                                    adjustmentType === "subtract"
                                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs ring-1 ring-rose-500/20"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-md flex items-center justify-center text-xs",
                                    adjustmentType === "subtract" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                    <IconMinus size={13} className="stroke-[3]" />
                                </div>
                                <span>Kurang Stok (-)</span>
                            </button>
                        </div>
                    </div>

                    {/* Quantity Input & Final Live Calculation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <FormNumberInput
                            name="amount"
                            label="Jumlah Perubahan Qty"
                            placeholder="Contoh: 5"
                            min={1}
                            autoFocus
                        />

                        {/* Resulting Stock Preview Card */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center h-[62px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Estimasi Stok Akhir
                            </span>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    {calculatedDelta >= 0 ? (
                                        <IconArrowUpRight size={16} className="text-emerald-600" />
                                    ) : (
                                        <IconArrowDownRight size={16} className="text-rose-600" />
                                    )}
                                    <span className={cn(
                                        "font-extrabold text-base font-mono",
                                        previewFinalStock < 0 ? "text-rose-600" : "text-slate-900"
                                    )}>
                                        {previewFinalStock}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold">
                                        {unitLabel}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md font-mono",
                                    calculatedDelta >= 0
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-rose-100 text-rose-800"
                                )}>
                                    {calculatedDelta >= 0 ? `+${calculatedDelta}` : calculatedDelta}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning if stock goes below zero */}
                    {previewFinalStock < 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                            <IconInfoCircle size={15} className="shrink-0 text-amber-600" />
                            <span>
                                <strong>Perhatian:</strong> Penyesuaian ini akan menyebabkan stok menjadi minus ({previewFinalStock}).
                            </span>
                        </div>
                    )}

                    {/* Alasan Penyesuaian with Quick Selection Chips */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                            Alasan Penyesuaian <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 pb-1">
                            {QUICK_REASONS.map((reason) => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => setValue("alasan", reason)}
                                    className={cn(
                                        "text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer",
                                        watchAlasan === reason
                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={watchAlasan || ""}
                            onChange={(e) => setValue("alasan", e.target.value)}
                            placeholder="Tulis alasan penyesuaian stok..."
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            required
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <AppButton
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createAdjustment.isPending}
                            className="text-xs font-bold h-9 rounded-xl"
                        >
                            Batal
                        </AppButton>
                        <AppButton
                            type="submit"
                            isLoading={createAdjustment.isPending}
                            disabled={numericAmount <= 0 || !watchAlasan?.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 rounded-xl gap-1.5 shadow-2xs"
                        >
                            <IconCheck size={16} />
                            <span>Simpan Penyesuaian</span>
                        </AppButton>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
