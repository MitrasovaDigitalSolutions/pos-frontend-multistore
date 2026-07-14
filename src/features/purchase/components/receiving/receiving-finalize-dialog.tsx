"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconAlertTriangle,
    IconCheck,
    IconClipboardList,
    IconCopy,
    IconInfoCircle,
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
    nomor_faktur: z.string().nullable().optional().transform((val) => val || null),
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

    const totalItemsValue = items.reduce(
        (sum, item) => sum + item.kuantitas * item.harga_estimasi,
        0
    );

    useEffect(() => {
        if (open && receiving) {
            reset({
                nomor_faktur: receiving.nomor_faktur || "",
                nilai_faktur: (receiving.nilai_faktur != null && receiving.nilai_faktur !== 0)
                    ? receiving.nilai_faktur
                    : totalItemsValue,
                catatan: receiving.catatan || "",
            });
        }
    }, [open, receiving, totalItemsValue, reset]);

    const nilaiFakturNum = Number(watchedNilaiFaktur);
    const selisih = nilaiFakturNum - totalItemsValue;
    const hasMismatch = nilaiFakturNum !== totalItemsValue;
    const isOver = selisih > 0;

    const onSubmit = (data: ReceivingFinalizeInput) => {
        onConfirm(data);
    };

    // Autofill invoice value using calculated total value of physical items
    const handleAutofillFromTotalBarang = () => {
        setValue("nilai_faktur", totalItemsValue, { shouldValidate: true });
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconClipboardList size={18} className="text-slate-800" />
                    <span>Konfirmasi Finalisasi</span>
                </div>
            }
            className="sm:max-w-3xl flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 overflow-hidden min-h-0"
                >
                    <Scrollable className="flex-1 min-h-0 pr-1">
                        <div className="space-y-6">

                            {/* ── Section 1: Summary Card Header ── */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Penerimaan</span>
                                    <p className="font-bold text-slate-800 truncate">{receiving?.nomor_penerimaan ?? "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supplier</span>
                                    <p className="font-semibold text-slate-700 truncate">
                                        {receiving?.supplier_relationship?.nama || receiving?.supplier || "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referensi PO</span>
                                    <p className="font-semibold text-slate-700">
                                        {receiving?.purchase_order_uid ? `#${receiving.purchase_order_uid}` : "Tanpa PO (Direct)"}
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fisik Barang</span>
                                    <p className="font-bold text-slate-900 font-mono text-sm">
                                        {formatRupiah(totalItemsValue)}
                                    </p>
                                </div>
                            </div>

                            {/* ── Section 2: Form & Reconciliation Split ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                                {/* Left Column: Form Fields */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Nomor Faktur Supplier <span className="text-slate-400 font-normal normal-case tracking-normal">(opsional)</span>
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Masukkan No. Faktur Fisik..."
                                            className="h-10 text-xs border-slate-200 focus-visible:ring-slate-800 rounded-xl"
                                            disabled={isPending}
                                            {...register("nomor_faktur")}
                                        />
                                        {errors.nomor_faktur && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.nomor_faktur.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                Nilai Faktur / Invoice <span className="text-rose-500">*</span>
                                            </label>
                                        </div>
                                        <FormNominalInput<ReceivingFinalizeInput>
                                            name="nilai_faktur"
                                            placeholder="Masukkan nilai dari kertas faktur..."
                                            disabled={isPending}
                                            className={cn(
                                                "h-10 text-xs border-slate-200 focus-visible:ring-slate-800 rounded-xl",
                                                hasMismatch && "border-amber-400 focus-visible:ring-amber-500 bg-amber-50/10"
                                            )}
                                        />

                                        {/* Informational Hutang Tooltip/Banner */}
                                        <div className="flex items-start gap-1.5 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-xl leading-relaxed mt-1.5">
                                            <IconInfoCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                            <span>
                                                Nilai faktur yang diinput ini nantinya akan dicatat sebagai nominal <strong>Hutang Usaha / Hutang Supplier (AP)</strong>.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Catatan Penyesuaian <span className="text-slate-400 font-normal normal-case tracking-normal">(opsional)</span>
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Tulis alasan jika ada selisih nilai faktur..."
                                            className="h-10 text-xs border-slate-200 focus-visible:ring-slate-800 rounded-xl"
                                            disabled={isPending}
                                            {...register("catatan")}
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Interactive Reconciliation Panel */}
                                <div className={cn(
                                    "rounded-2xl border p-4 space-y-4 transition-colors duration-200 md:h-full flex flex-col justify-between",
                                    hasMismatch
                                        ? "bg-amber-50/40 border-amber-200 shadow-sm shadow-amber-100/20"
                                        : "bg-slate-50/50 border-slate-100"
                                )}>
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                                                Analisis Kesesuaian Nilai
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {hasMismatch ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 border border-amber-200 rounded-full shadow-sm">
                                                        <IconAlertTriangle size={11} className="animate-pulse" /> Nilai Tidak Sama
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 border border-emerald-200 rounded-full shadow-sm">
                                                        <IconCheck size={11} /> Nilai Sesuai
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 items-center gap-2 text-center py-2">
                                            <div className="space-y-1 text-left">
                                                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Barang (Fisik)</span>
                                                <span className="text-sm font-bold text-slate-800 font-mono">
                                                    {formatRupiah(totalItemsValue)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                {hasMismatch ? (
                                                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-extrabold text-sm">
                                                        ≠
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-extrabold text-sm">
                                                        =
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Faktur (Input)</span>
                                                <span className={cn(
                                                    "text-sm font-bold font-mono",
                                                    hasMismatch ? "text-amber-700" : "text-slate-850"
                                                )}>
                                                    {formatRupiah(nilaiFakturNum)}
                                                </span>
                                            </div>
                                        </div>

                                        {hasMismatch && (
                                            <div className="flex flex-col gap-2.5 text-amber-850 text-xs pt-3.5 border-t border-amber-200/50">
                                                <div className="flex items-start gap-2">
                                                    <IconInfoCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <p className="leading-relaxed">
                                                        Terdapat selisih <span className="font-bold font-mono text-amber-950 bg-amber-100/80 px-1 py-0.5 rounded">{formatRupiah(Math.abs(selisih))}</span> ({isOver ? "Faktur lebih tinggi" : "Faktur lebih rendah"}).
                                                    </p>
                                                </div>
                                                <p className="text-[11px] text-amber-800 bg-amber-100/30 border border-amber-200/30 p-2.5 rounded-xl leading-relaxed">
                                                    <strong>Mengapa berbeda?</strong> Selisih wajar terjadi jika lembar faktur mencantumkan biaya tambahan seperti pajak (PPN), ongkos kirim, atau potongan diskon global. Anda <strong>tetap dapat menyelesaikan transaksi</strong> meskipun nominal berbeda.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {hasMismatch && (
                                        <div className="pt-3 border-t border-amber-200/50 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAutofillFromTotalBarang}
                                                className="w-full h-8 px-3 rounded-lg border border-amber-200 hover:border-amber-300 hover:bg-amber-100/50 text-[11px] font-bold text-amber-900 bg-amber-100/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                                            >
                                                <IconCopy size={12} />
                                                Samakan ke Total Barang
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Section 4: Items Table (Detail Reference) ── */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Daftar Barang yang Diterima ({items.length})
                                </span>
                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                <th className="p-3">Nama Produk</th>
                                                <th className="p-3 text-right">Harga Beli</th>
                                                <th className="p-3 text-right">Qty</th>
                                                <th className="p-3 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 font-medium">
                                            {items.map((item) => {
                                                const subtotal = item.harga_estimasi * item.kuantitas;
                                                return (
                                                    <tr key={item.temp_uid} className="hover:bg-slate-50/50">
                                                        <td className="p-3 font-semibold text-slate-900">
                                                            {item.nama}
                                                        </td>
                                                        <td className="p-3 text-right text-slate-700 font-mono">
                                                            {formatRupiah(item.harga_estimasi)}
                                                        </td>
                                                        <td className="p-3 text-right text-slate-700 font-mono">
                                                            {item.kuantitas} pcs
                                                        </td>
                                                        <td className="p-3 text-right text-slate-900 font-bold font-mono">
                                                            {formatRupiah(subtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-slate-400">
                                                        Tidak ada item barang.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-50 border-t border-slate-100">
                                                <td colSpan={3} className="p-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    Total Nilai Barang
                                                </td>
                                                <td className="p-3 text-right font-bold font-mono text-slate-900">
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
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="px-5 h-10 border-slate-200 text-slate-700 font-bold text-xs rounded-xl bg-white cursor-pointer"
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className={cn(
                                "px-5 h-10 font-bold text-xs text-white rounded-xl flex items-center gap-1.5 cursor-pointer border-none shadow-sm active:scale-[0.98] transition-all",
                                hasMismatch
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                            )}
                            disabled={isPending}
                        >
                            <IconCheck size={14} />
                            {isPending ? "Memproses..." : "Selesaikan & Tambah Stok"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
