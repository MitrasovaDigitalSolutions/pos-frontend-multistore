"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconAlertTriangle,
    IconCheck,
    IconClipboardList,
    IconCopy,
    IconInfoCircle,
} from "@tabler/icons-react";
import { useEffect, useRef } from "react";
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

import { useCashAccounts } from "@/features/cash/api/cash-api";
import { FormSelect } from "@/components/forms/form-select";

const receivingFinalizeSchema = z.object({
    nomor_faktur: z.string().nullable().optional().transform((val) => val || null),
    nilai_faktur: z.coerce.number().min(0, "Nilai faktur minimal 0").default(0),
    metode_transaksi: z.enum(["cash", "credit"]).default("cash"),
    cash_account_uid: z.string().nullable().optional().transform((val) => val || null),
    nominal_bayar: z.coerce
        .number()
        .min(0)
        .nullable()
        .optional()
        .transform((val) => (val === undefined || val === null ? 0 : Number(val))),
    catatan: z.string().nullable().optional().transform((val) => val || null),
}).superRefine((data, ctx) => {
    if ((data.metode_transaksi === "cash" || (data.nominal_bayar && data.nominal_bayar > 0)) && !data.cash_account_uid) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Akun kas wajib dipilih untuk pembayaran ini",
            path: ["cash_account_uid"],
        });
    }
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
    const { data: cashAccountsData } = useCashAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const cashAccounts = cashAccountsData || [];

    const cashAccountOptions = cashAccounts.map((acc) => ({
        value: acc.uid,
        label: acc.nama,
        description: `Saldo: ${formatRupiah(acc.saldo || 0)} • (${acc.tipe === "register" ? "Kas Kasir" : acc.tipe === "bank" ? "Bank" : "Kas Utama"})`,
    }));

    const methods = useForm<ReceivingFinalizeInput>({
        resolver: zodResolver(receivingFinalizeSchema) as unknown as Resolver<ReceivingFinalizeInput>,
        defaultValues: {
            nomor_faktur: "",
            nilai_faktur: 0,
            metode_transaksi: "cash",
            cash_account_uid: null,
            nominal_bayar: 0,
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
    const watchedMetode = useWatch({ control, name: "metode_transaksi" }) || "cash";
    const watchedNominalBayar = useWatch({ control, name: "nominal_bayar" }) ?? 0;

    const totalItemsValue = items.reduce(
        (sum, item) => sum + item.kuantitas * item.harga_estimasi,
        0
    );

    const prevOpenRef = useRef(false);

    useEffect(() => {
        if (open && !prevOpenRef.current && receiving) {
            const defaultNilaiFaktur = (receiving.nilai_faktur != null && receiving.nilai_faktur !== 0)
                ? receiving.nilai_faktur
                : totalItemsValue;
            const defaultMetode = receiving.metode_transaksi || "cash";

            reset({
                nomor_faktur: receiving.nomor_faktur || "",
                nilai_faktur: defaultNilaiFaktur,
                metode_transaksi: defaultMetode,
                cash_account_uid: receiving.cash_account_uid || null,
                nominal_bayar: receiving.nominal_bayar != null ? receiving.nominal_bayar : (defaultMetode === "cash" ? defaultNilaiFaktur : 0),
                catatan: receiving.catatan || "",
            });
        }
        prevOpenRef.current = open;
    }, [open, receiving, totalItemsValue, reset, cashAccounts]);

    const nilaiFakturNum = Number(watchedNilaiFaktur);
    const selisih = nilaiFakturNum - totalItemsValue;
    const hasMismatch = nilaiFakturNum !== totalItemsValue;
    const isOver = selisih > 0;

    const onSubmit = (data: ReceivingFinalizeInput) => {
        // If cash, enforce nominal_bayar to match nilai_faktur
        if (data.metode_transaksi === "cash") {
            data.nominal_bayar = data.nilai_faktur;
        }
        onConfirm(data);
    };

    // Autofill invoice value using calculated total value of physical items
    const handleAutofillFromTotalBarang = () => {
        setValue("nilai_faktur", totalItemsValue, { shouldValidate: true });
        if (watchedMetode === "cash") {
            setValue("nominal_bayar", totalItemsValue, { shouldValidate: true });
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconClipboardList size={18} className="text-slate-800" />
                    <span>Konfirmasi Finalisasi Penerimaan</span>
                </div>
            }
            scrollable={false}
            className="sm:max-w-4xl lg:max-w-5xl flex flex-col max-h-[92vh] font-sans"
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 overflow-hidden min-h-0"
                >
                    <Scrollable className="flex-1 min-h-0 pr-1">
                        <div className="space-y-4 py-1">

                            {/* ── Section 1: Compact Summary Card Header ── */}
                            <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Penerimaan</span>
                                    <p className="font-bold text-slate-800 truncate text-xs">{receiving?.nomor_penerimaan ?? "—"}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supplier</span>
                                    <p className="font-semibold text-slate-700 truncate text-xs">
                                        {receiving?.supplier_relationship?.nama || receiving?.supplier || "—"}
                                    </p>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referensi PO</span>
                                    <p className="font-semibold text-slate-700 text-xs">
                                        {receiving?.purchase_order_uid ? `#${receiving.purchase_order_uid}` : "Tanpa PO (Direct)"}
                                    </p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fisik Barang</span>
                                    <p className="font-bold text-emerald-700 font-mono text-sm">
                                        {formatRupiah(totalItemsValue)}
                                    </p>
                                </div>
                            </div>

                            {/* ── Section 2: Form & Reconciliation Split ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                                {/* Left Column: Form Fields (7 cols) */}
                                <div className="lg:col-span-7 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                No. Faktur <span className="text-slate-400 font-normal normal-case">(opsional)</span>
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="No. Faktur Fisik..."
                                                className="h-9 text-xs border-slate-200 focus-visible:ring-slate-800 rounded-xl"
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
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                Nilai Faktur / Invoice <span className="text-rose-500">*</span>
                                            </label>
                                            <FormNominalInput<ReceivingFinalizeInput>
                                                name="nilai_faktur"
                                                placeholder="Nilai faktur..."
                                                disabled={isPending}
                                                className={cn(
                                                    "h-9 text-xs border-slate-200 focus-visible:ring-slate-800 rounded-xl font-mono font-bold",
                                                    hasMismatch && "border-amber-400 focus-visible:ring-amber-500 bg-amber-50/10 text-amber-900"
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Metode Transaksi & Pembayaran */}
                                    <div className="space-y-2.5 p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                                Metode Transaksi Pembelian <span className="text-rose-500">*</span>
                                            </label>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                {watchedMetode === "cash" ? "Otomatis Lunas" : "Pencatatan Hutang"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setValue("metode_transaksi", "cash");
                                                    setValue("nominal_bayar", nilaiFakturNum);
                                                }}
                                                className={cn(
                                                    "py-1.5 px-3 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
                                                    watchedMetode === "cash"
                                                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                Tunai (Lunas)
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setValue("metode_transaksi", "credit");
                                                    setValue("nominal_bayar", 0);
                                                }}
                                                className={cn(
                                                    "py-1.5 px-3 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
                                                    watchedMetode === "credit"
                                                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                Kredit (Hutang)
                                            </button>
                                        </div>

                                        {(watchedMetode === "cash" || watchedNominalBayar > 0) && (
                                            <div className="space-y-1 pt-1 animate-fade-in">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                                    Akun Kas {watchedMetode === "cash" ? "Pembayaran" : "Uang Muka (DP)"} <span className="text-rose-500">*</span>
                                                </label>
                                                <FormSelect<ReceivingFinalizeInput>
                                                    name="cash_account_uid"
                                                    options={cashAccountOptions}
                                                    placeholder="Pilih Akun Kas..."
                                                    disabled={isPending}
                                                />
                                            </div>
                                        )}

                                        {watchedMetode === "credit" && (
                                            <div className="space-y-1 pt-1 animate-fade-in">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                                    Nominal Uang Muka (DP) <span className="text-slate-400 font-normal normal-case">(0 jika tanpa DP)</span>
                                                </label>
                                                <FormNominalInput<ReceivingFinalizeInput>
                                                    name="nominal_bayar"
                                                    placeholder="Nominal DP..."
                                                    disabled={isPending}
                                                    className="h-9 text-xs border-slate-200 focus-visible:ring-slate-800 rounded-xl font-mono"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Catatan Penyesuaian <span className="text-slate-400 font-normal normal-case">(opsional)</span>
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Tulis catatan penyesuaian/selisih..."
                                            className="h-9 text-xs border-slate-200 focus-visible:ring-slate-800 rounded-xl"
                                            disabled={isPending}
                                            {...register("catatan")}
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Reconciliation Panel (5 cols) */}
                                <div className={cn(
                                    "lg:col-span-5 rounded-2xl border p-3.5 space-y-3 transition-colors duration-200 flex flex-col justify-between h-full min-h-[220px]",
                                    hasMismatch
                                        ? "bg-amber-50/40 border-amber-200 shadow-xs"
                                        : "bg-slate-50/50 border-slate-100"
                                )}>
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                                                Kesesuaian Nilai
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {hasMismatch ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 border border-amber-200 rounded-full">
                                                        <IconAlertTriangle size={11} className="animate-pulse" /> Selisih
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-200 rounded-full">
                                                        <IconCheck size={11} /> Sesuai
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 items-center gap-1 text-center py-1">
                                            <div className="space-y-0.5 text-left">
                                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Barang</span>
                                                <span className="text-xs font-bold text-slate-800 font-mono">
                                                    {formatRupiah(totalItemsValue)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                {hasMismatch ? (
                                                    <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-extrabold text-xs">
                                                        ≠
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-extrabold text-xs">
                                                        =
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-0.5 text-right">
                                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Nilai Faktur</span>
                                                <span className={cn(
                                                    "text-xs font-bold font-mono",
                                                    hasMismatch ? "text-amber-700" : "text-slate-850"
                                                )}>
                                                    {formatRupiah(nilaiFakturNum)}
                                                </span>
                                            </div>
                                        </div>

                                        {hasMismatch ? (
                                            <div className="flex flex-col gap-2 text-amber-850 text-xs pt-2 border-t border-amber-200/50">
                                                <div className="flex items-start gap-1.5">
                                                    <IconInfoCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <p className="leading-relaxed text-[11px]">
                                                        Selisih <span className="font-bold font-mono text-amber-950 bg-amber-100 px-1 py-0.5 rounded">{formatRupiah(Math.abs(selisih))}</span> ({isOver ? "Faktur > Barang" : "Faktur < Barang"}).
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl">
                                                <IconInfoCircle size={14} className="text-emerald-600 shrink-0" />
                                                <span>Total nilai fisik barang sesuai dengan nominal faktur input.</span>
                                            </div>
                                        )}
                                    </div>

                                    {hasMismatch && (
                                        <div className="pt-2 border-t border-amber-200/50">
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

                            {/* ── Section 3: Compact Items Table (Detail Reference) ── */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>Daftar Barang Diterima ({items.length} item)</span>
                                </div>
                                <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="sticky top-0 bg-slate-50 z-10 shadow-2xs">
                                            <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                <th className="p-2 pl-3">Nama Produk</th>
                                                <th className="p-2 text-right">Harga Beli</th>
                                                <th className="p-2 text-right">Qty</th>
                                                <th className="p-2 text-right pr-3">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 font-medium">
                                            {items.map((item) => {
                                                const subtotal = item.harga_estimasi * item.kuantitas;
                                                return (
                                                    <tr key={item.temp_uid} className="hover:bg-slate-50/50">
                                                        <td className="p-2 pl-3 font-semibold text-slate-900 truncate max-w-[240px]">
                                                            {item.nama}
                                                        </td>
                                                        <td className="p-2 text-right text-slate-700 font-mono">
                                                            {formatRupiah(item.harga_estimasi)}
                                                        </td>
                                                        <td className="p-2 text-right text-slate-700 font-mono">
                                                            {item.kuantitas} pcs
                                                        </td>
                                                        <td className="p-2 pr-3 text-right text-slate-900 font-bold font-mono">
                                                            {formatRupiah(subtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-3 text-center text-slate-400">
                                                        Tidak ada item barang.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </Scrollable>

                    {/* ── Footer Actions ── */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="px-4 h-9 border-slate-200 text-slate-700 font-bold text-xs rounded-xl bg-white cursor-pointer"
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className={cn(
                                "px-5 h-9 font-bold text-xs text-white rounded-xl flex items-center gap-1.5 cursor-pointer border-none shadow-xs active:scale-[0.98] transition-all",
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
