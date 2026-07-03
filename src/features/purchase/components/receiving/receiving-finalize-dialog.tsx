"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconAlertTriangle,
    IconArrowRight,
    IconCheck,
    IconClipboardCheck,
    IconCopy,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scrollable } from "@/components/ui/scrollable";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PurchaseItemLocal, Receiving } from "../../types";

const receivingFinalizeSchema = z.object({
    nomor_faktur: z.string().min(1, "Nomor faktur wajib diisi"),
    nilai_faktur: z.coerce.number().min(0, "Nilai faktur minimal 0").default(0),
    catatan: z.string().nullable().optional().transform((val) => val || null),
});

type ReceivingFinalizeInput = z.infer<typeof receivingFinalizeSchema>;

interface ReceivingFinalizeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receiving: Receiving;
    items: PurchaseItemLocal[];
    isPending: boolean;
    onConfirm: (data: ReceivingFinalizeInput) => void;
}

export function ReceivingFinalizeDialog({
    open,
    onOpenChange,
    receiving,
    items,
    isPending,
    onConfirm,
}: ReceivingFinalizeDialogProps) {
    const methods = useForm<ReceivingFinalizeInput>({
        resolver: zodResolver(receivingFinalizeSchema) as unknown as Resolver<ReceivingFinalizeInput>,
        defaultValues: {
            nomor_faktur: "",
            nilai_faktur: 0,
            catatan: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = methods;

    const watchedNilaiFaktur = useWatch({ control, name: "nilai_faktur" }) ?? 0;

    useEffect(() => {
        if (open && receiving) {
            reset({
                nomor_faktur: receiving.nomor_faktur || "",
                nilai_faktur: receiving.nilai_faktur || 0,
                catatan: receiving.catatan || "",
            });
        }
    }, [open, receiving, reset]);

    const totalItemsValue = items.reduce(
        (sum, item) => sum + item.kuantitas * item.harga_estimasi,
        0
    );

    const nilaiFakturNum = Number(watchedNilaiFaktur);
    const selisih = nilaiFakturNum - totalItemsValue;
    const hasMismatch = nilaiFakturNum !== totalItemsValue;
    const isOver = selisih > 0;

    const onSubmit = (data: ReceivingFinalizeInput) => {
        onConfirm(data);
    };

    // Sync invoice value to items total with one click
    const handleSyncToItems = () => {
        setValue("nilai_faktur", totalItemsValue, { shouldValidate: true });
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconClipboardCheck size={18} className="text-blue-600 shrink-0" />
                    <span>Finalisasi Penerimaan Barang</span>
                </div>
            }
            className="sm:max-w-2xl flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 overflow-hidden min-h-0"
                >
                    <Scrollable className="flex-1">
                        <div className="space-y-5">

                            {/* ── Section 1: Receiving Context (read-only) ── */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3.5 py-2.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">No. Penerimaan</span>
                                    <span className="font-semibold text-slate-700">{receiving?.nomor_penerimaan ?? "—"}</span>
                                </div>
                                <span className="text-slate-200 hidden sm:inline">|</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">Supplier</span>
                                    <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                                        {receiving?.supplier_relationship?.nama || receiving?.supplier || "—"}
                                    </span>
                                </div>
                                <span className="text-slate-200 hidden sm:inline">|</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">Tgl Masuk</span>
                                    <span className="font-semibold text-slate-700">
                                        {receiving?.created_at
                                            ? new Date(receiving.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })
                                            : "—"}
                                    </span>
                                </div>
                                {receiving?.purchase_order_uid && (
                                    <>
                                        <span className="text-slate-200 hidden sm:inline">|</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-emerald-600 font-medium">PO</span>
                                            <span className="font-semibold text-emerald-700">#{receiving.purchase_order_uid}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* ── Section 2: Invoice Form Fields ── */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Data Faktur Supplier
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">
                                            No. Faktur <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Contoh: INV/2025/07/001"
                                            className="h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-lg"
                                            disabled={isPending}
                                            {...register("nomor_faktur")}
                                        />
                                        {errors.nomor_faktur && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.nomor_faktur.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <FormNominalInput<ReceivingFinalizeInput>
                                            name="nilai_faktur"
                                            label="Nilai Total Faktur *"
                                            placeholder="Masukkan nominal dari faktur supplier..."
                                            disabled={isPending}
                                            className="h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-600">
                                        Catatan <span className="text-slate-400 font-normal">(opsional)</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Misal: ada selisih karena biaya kirim, pajak, dll."
                                        className="h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-lg"
                                        disabled={isPending}
                                        {...register("catatan")}
                                    />
                                </div>
                            </div>

                            {/* ── Section 3: Live Comparison Panel ── */}
                            <div className={cn(
                                "rounded-xl border overflow-hidden",
                                hasMismatch ? "border-amber-200" : "border-emerald-200"
                            )}>
                                {/* Header row */}
                                <div className={cn(
                                    "grid grid-cols-3 text-center text-[10px] font-bold uppercase tracking-wider py-2",
                                    hasMismatch ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                                )}>
                                    <span>Total Nilai Barang</span>
                                    <span>vs</span>
                                    <span>Nilai Faktur Diinput</span>
                                </div>

                                {/* Values row */}
                                <div className={cn(
                                    "grid grid-cols-3 items-center text-center py-4 px-4",
                                    hasMismatch ? "bg-amber-50/40" : "bg-emerald-50/40"
                                )}>
                                    <div>
                                        <p className="font-mono font-bold text-base text-slate-800">
                                            {formatRupiah(totalItemsValue)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{items.length} item barang</p>
                                    </div>

                                    <div className="flex flex-col items-center gap-1.5">
                                        {hasMismatch ? (
                                            <IconAlertTriangle size={18} className="text-amber-500" />
                                        ) : (
                                            <IconCheck size={18} className="text-emerald-500" />
                                        )}
                                        <IconArrowRight size={12} className="text-slate-300" />
                                    </div>

                                    <div>
                                        <p className={cn(
                                            "font-mono font-bold text-base",
                                            hasMismatch ? "text-amber-700" : "text-emerald-700"
                                        )}>
                                            {formatRupiah(nilaiFakturNum)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">dari faktur</p>
                                    </div>
                                </div>

                                {/* Selisih / Match bar */}
                                <div className={cn(
                                    "border-t px-4 py-2.5 flex items-center justify-between text-xs",
                                    hasMismatch
                                        ? "border-amber-100 bg-amber-50"
                                        : "border-emerald-100 bg-emerald-50"
                                )}>
                                    {hasMismatch ? (
                                        <>
                                            <span className="text-amber-700 font-medium">
                                                {isOver
                                                    ? `Faktur lebih tinggi ${formatRupiah(selisih)} dari total barang`
                                                    : `Faktur lebih rendah ${formatRupiah(Math.abs(selisih))} dari total barang`}
                                                <span className="text-amber-500 font-normal ml-1">
                                                    — bisa jadi karena pajak, diskon, atau biaya kirim.
                                                </span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleSyncToItems}
                                                disabled={isPending}
                                                className="ml-3 flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 hover:border-blue-300 px-2 py-1 rounded-md transition-colors shrink-0"
                                            >
                                                <IconCopy size={11} />
                                                Samakan ke total barang
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-emerald-700 font-medium">
                                            ✓ Nilai faktur sesuai dengan total nilai barang.
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ── Section 4: Items Table (reference) ── */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Rincian Barang Diterima ({items.length} item)
                                </h3>
                                <div className="border border-slate-100 rounded-lg overflow-hidden overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs min-w-[440px]">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                <th className="px-3 py-2.5">Nama Produk</th>
                                                <th className="px-3 py-2.5 text-right">Harga Estimasi</th>
                                                <th className="px-3 py-2.5 text-right">Qty</th>
                                                <th className="px-3 py-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {items.map((item) => {
                                                const subtotal = item.harga_estimasi * item.kuantitas;
                                                return (
                                                    <tr key={item.temp_uid} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="px-3 py-2.5 font-medium text-slate-800">
                                                            {item.nama}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right text-slate-500 font-mono">
                                                            {formatRupiah(item.harga_estimasi)}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right text-slate-500 font-mono">
                                                            {item.kuantitas}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right text-slate-800 font-semibold font-mono">
                                                            {formatRupiah(subtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-50 border-t border-slate-200">
                                                <td colSpan={3} className="px-3 py-2.5 text-right text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                                    Total Nilai Barang
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-bold font-mono text-slate-900">
                                                    {formatRupiah(totalItemsValue)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </Scrollable>

                    {/* ── Footer Actions ── */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
                        {hasMismatch && (
                            <p className="text-[10px] text-amber-600 font-medium leading-tight max-w-xs">
                                <IconAlertTriangle size={11} className="inline mr-1 mb-0.5" />
                                Ada selisih. Lanjutkan jika memang ada pajak, diskon, atau biaya kirim.
                            </p>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="h-9 text-xs px-4 border-slate-200 text-slate-600 rounded-lg cursor-pointer"
                                disabled={isPending}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className={cn(
                                    "h-9 text-xs font-semibold px-5 text-white rounded-lg flex items-center gap-1.5 cursor-pointer border-none",
                                    hasMismatch
                                        ? "bg-amber-600 hover:bg-amber-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                )}
                                disabled={isPending}
                            >
                                <IconCheck size={14} />
                                {isPending ? "Memproses..." : "Selesaikan & Tambah Stok"}
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
