"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Scrollable } from "@/components/ui/scrollable";
import { Button } from "@/components/ui/button";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormSelect } from "@/components/forms/form-select";
import { Input } from "@/components/ui/input";
import { IconCash, IconLoader2, IconReceipt } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { todayStr, toLocalISOString } from "@/lib/date-utils";
import { getErrorMessage } from "@/shared/errors/api-error";
import { useCashAccounts, useBulkCreatePayment } from "@/features/purchase/api/purchase-api";
import { bulkPaymentSchema, type BulkPaymentInput } from "@/features/purchase/schemas/payment-schema";
import type { Receiving } from "@/features/purchase/types";

interface BulkPayDebtDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierName?: string;
    selectedReceivings: Receiving[];
    onSuccess?: () => void;
}

export function BulkPayDebtDialog({
    open,
    onOpenChange,
    supplierName,
    selectedReceivings,
    onSuccess,
}: BulkPayDebtDialogProps) {
    const { data: cashAccounts = [], isLoading: cashAccountsLoading } = useCashAccounts();
    const bulkPaymentMutation = useBulkCreatePayment();

    const methods = useForm<BulkPaymentInput>({
        resolver: zodResolver(bulkPaymentSchema) as unknown as Resolver<BulkPaymentInput>,
        defaultValues: {
            receiving_uids: [],
            tanggal_bayar: todayStr(),
            cash_account_uid: "",
            metode_pembayaran: "cash",
            catatan: "Pelunasan Sekaligus",
        },
    });

    const { handleSubmit, reset, register, formState: { errors } } = methods;

    // Synchronize selected receiving UIDs whenever open or selectedReceivings changes
    useEffect(() => {
        if (open) {
            const uids = selectedReceivings.map((r) => r.uid);
            reset({
                receiving_uids: uids,
                tanggal_bayar: todayStr(),
                cash_account_uid: cashAccounts.length > 0 ? String(cashAccounts[0].uid) : "",
                metode_pembayaran: "cash",
                catatan: "Pelunasan Sekaligus",
            });
        }
    }, [open, selectedReceivings, cashAccounts, reset]);

    // Calculate total sisa hutang across selected receivings
    const totalSisaHutang = selectedReceivings.reduce((sum, r) => {
        const sisa = r.sisa_hutang !== undefined
            ? r.sisa_hutang
            : Math.max(0, (r.nilai_faktur || 0) - (r.total_dibayar || 0));
        return sum + sisa;
    }, 0);

    const cashAccountOptions = cashAccounts.map((account) => ({
        value: String(account.uid),
        label: account.nama,
        description: `Saldo: ${formatRupiah(account.saldo || 0)} • (${account.tipe === "register" ? "Kas Kasir" : account.tipe === "bank" ? "Bank" : "Kas Utama"})`,
    }));

    const paymentMethodOptions = [
        { value: "cash", label: "Tunai / Cash" },
        { value: "bank_transfer", label: "Transfer Bank" },
        { value: "giro", label: "Giro / Cek" },
        { value: "other", label: "Lainnya" },
    ];

    const onSubmit = handleSubmit((data) => {
        if (!data.receiving_uids || data.receiving_uids.length === 0) {
            toast.error("Minimal pilih 1 transaksi penerimaan untuk dibayar.");
            return;
        }

        const payload = {
            ...data,
            tanggal_bayar: toLocalISOString(data.tanggal_bayar),
        };

        bulkPaymentMutation.mutate(payload, {
            onSuccess: (res) => {
                toast.success(res?.message || "Pelunasan hutang sekaligus berhasil disimpan.");
                onOpenChange(false);
                if (onSuccess) onSuccess();
            },
            onError: (err) => {
                toast.error(getErrorMessage(err) || "Gagal melakukan pelunasan hutang sekaligus.");
            },
        });
    });

    const dialogTitle = (
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <IconCash size={18} stroke={2.5} />
            </div>
            <div>
                <span className="text-sm font-bold text-slate-800 block leading-tight">
                    Pelunasan Hutang Sekaligus
                </span>
                <span className="text-[10px] text-slate-400 font-normal block leading-tight">
                    {supplierName ? `Supplier: ${supplierName}` : "Pelunasan beberapa faktur penerimaan sekaligus"}
                </span>
            </div>
        </div>
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={dialogTitle}
            className="sm:max-w-3xl"
            scrollable={false}
        >
            <FormProvider {...methods}>
                <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-2">
                    {/* 2-Column Compact Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Left Side: Form Inputs (7 cols) */}
                        <div className="md:col-span-7 space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                {/* Payment Date */}
                                <div className="space-y-1">
                                    <FormDatePicker<BulkPaymentInput>
                                        name="tanggal_bayar"
                                        label="Tanggal Bayar *"
                                        disabled={bulkPaymentMutation.isPending}
                                    />
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                        Metode Bayar *
                                    </label>
                                    <FormSelect<BulkPaymentInput>
                                        name="metode_pembayaran"
                                        options={paymentMethodOptions}
                                        placeholder="Pilih Metode"
                                        disabled={bulkPaymentMutation.isPending}
                                    />
                                </div>
                            </div>

                            {/* Cash Account */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Bayar Dari Akun / Kas *
                                </label>
                                <FormSelect<BulkPaymentInput>
                                    name="cash_account_uid"
                                    options={cashAccountOptions}
                                    placeholder={cashAccountsLoading ? "Memuat akun kas..." : "-- Pilih Akun Kas --"}
                                    disabled={bulkPaymentMutation.isPending || cashAccountsLoading}
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Catatan Pembayaran
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Catatan (misal: Pelunasan Sekaligus Bulan Juni)..."
                                    className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                    disabled={bulkPaymentMutation.isPending}
                                    {...register("catatan")}
                                />
                                {errors.catatan && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.catatan.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Selected Receivings & Total Summary (5 cols) */}
                        <div className="md:col-span-5 flex flex-col gap-3 justify-between bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl">
                            <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-200/60">
                                    <span className="text-slate-600 font-bold flex items-center gap-1.5">
                                        <IconReceipt size={14} className="text-slate-400" />
                                        Faktur Terpilih
                                    </span>
                                    <span className="font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                                        {selectedReceivings.length} Faktur
                                    </span>
                                </div>

                                {/* Scrollable List of Selected Receivings */}
                                <Scrollable className="max-h-40 flex-1 pr-1">
                                    <div className="space-y-1">
                                        {selectedReceivings.map((rec) => {
                                            const sisa = rec.sisa_hutang !== undefined
                                                ? rec.sisa_hutang
                                                : Math.max(0, (rec.nilai_faktur || 0) - (rec.total_dibayar || 0));
                                            return (
                                                <div
                                                    key={rec.uid}
                                                    className="flex justify-between items-center text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60 shadow-2xs"
                                                >
                                                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                                                        {rec.nomor_penerimaan}
                                                    </span>
                                                    <span className="font-bold text-rose-600 tabular-nums">
                                                        {formatRupiah(sisa)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Scrollable>
                            </div>

                            {/* Clear Summary Stat Box */}
                            <div className="bg-white border border-emerald-200/80 p-3 rounded-xl flex items-center justify-between shadow-2xs shrink-0">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Total Pelunasan
                                    </span>
                                    <p className="font-black text-emerald-600 text-base leading-none tabular-nums">
                                        {formatRupiah(totalSisaHutang)}
                                    </p>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                                    <IconCash size={16} stroke={2.5} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Always Fixed Bottom Actions */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="px-5 h-10 border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer bg-white"
                            disabled={bulkPaymentMutation.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="px-6 h-10 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20"
                            disabled={bulkPaymentMutation.isPending || selectedReceivings.length === 0}
                        >
                            {bulkPaymentMutation.isPending ? (
                                <>
                                    <IconLoader2 size={16} className="animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <IconCash size={16} />
                                    <span>Pelunasan Sekaligus ({formatRupiah(totalSisaHutang)})</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
