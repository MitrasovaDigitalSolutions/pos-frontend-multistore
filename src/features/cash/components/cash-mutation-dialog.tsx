"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconCirclePlus, IconCircleMinus, IconWallet } from "@tabler/icons-react";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormInput } from "@/components/forms/form-input";
import { FormCoaPicker } from "@/features/accounting/components/shared";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { debitCreditSchema, type DebitCreditSchemaInput } from "../schemas/cash-schema";
import { useDebitCashAccount, useCreditCashAccount, type CashAccount } from "../api/cash-api";

interface CashMutationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: "debit" | "credit" | null;
    account: CashAccount | null;
}

export function CashMutationDialog({
    open,
    onOpenChange,
    type,
    account,
}: CashMutationDialogProps) {
    const isDebit = type === "debit";
    const debitMutation = useDebitCashAccount();
    const creditMutation = useCreditCashAccount();

    const methods = useForm<DebitCreditSchemaInput>({
        resolver: zodResolver(debitCreditSchema) as Resolver<DebitCreditSchemaInput>,
        defaultValues: {
            amount: 0,
            chart_of_account_uid: null,
            kategori: "",
            catatan: "",
        },
    });

    const {
        handleSubmit,
        reset,
        setError,
        formState: { isSubmitting },
    } = methods;

    // Reset form when dialog opens/closes/changes
    useEffect(() => {
        if (open) {
            reset({
                amount: 0,
                chart_of_account_uid: null,
                kategori: isDebit ? "debit_manual" : "credit_manual",
                catatan: "",
            });
        }
    }, [open, type, reset, isDebit]);

    if (!type || !account) return null;

    const onSubmit = async (data: DebitCreditSchemaInput) => {
        // Client-side safety check for credit amount
        if (!isDebit && data.amount > account.saldo) {
            setError("amount", {
                type: "manual",
                message: `Nominal kredit melebihi saldo kas yang tersedia (${formatRupiah(account.saldo)}).`,
            });
            return;
        }

        try {
            const payload = {
                uid: account.uid,
                data: {
                    amount: data.amount,
                    chart_of_account_uid: data.chart_of_account_uid || null,
                    kategori: data.kategori || (isDebit ? "debit_manual" : "credit_manual"),
                    catatan: data.catatan || null,
                },
            };

            if (isDebit) {
                await debitMutation.mutateAsync(payload);
                toast.success(`Debit manual sebesar ${formatRupiah(data.amount)} berhasil dicatat pada akun ${account.nama}.`);
            } else {
                await creditMutation.mutateAsync(payload);
                toast.success(`Kredit manual sebesar ${formatRupiah(data.amount)} berhasil dicatat pada akun ${account.nama}.`);
            }

            onOpenChange(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal menyimpan mutasi kas.";
            toast.error(msg);
        }
    };

    const dialogTitle = (
        <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border shrink-0 ${isDebit
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-rose-50 text-rose-600 border-rose-100"
                }`}>
                {isDebit ? <IconCirclePlus size={18} /> : <IconCircleMinus size={18} />}
            </div>
            <span className="font-extrabold text-sm text-slate-800">
                {isDebit ? "Debit Kas Manual (Uang Masuk)" : "Kredit Kas Manual (Uang Keluar)"}
            </span>
        </div>
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={dialogTitle}
            className="sm:max-w-xl max-w-lg"
        >
            <div className="space-y-3.5 pt-1">
                {/* Compact Account Details Strip */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                            <IconWallet size={13} />
                        </div>
                        <div className="min-w-0 flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 font-medium shrink-0">Akun:</span>
                            <h4 className="font-extrabold text-slate-800 truncate" title={account.nama}>
                                {account.nama}
                            </h4>
                            {account.nomor_rekening && (
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded border border-slate-300/40 shrink-0">
                                    {account.nomor_rekening}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-3 border-l border-slate-200">
                        <span className="text-[11px] text-slate-400 font-medium">Saldo:</span>
                        <span className="font-extrabold text-slate-800 tabular-nums">
                            {formatRupiah(account.saldo)}
                        </span>
                    </div>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                        {/* 2-Column Form Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Nominal Input */}
                            <FormNominalInput<DebitCreditSchemaInput>
                                name="amount"
                                label="Nominal Transaksi *"
                                placeholder="Masukkan nominal Rp..."
                                disabled={isSubmitting}
                            />

                            {/* Chart of Account / Akun CoA */}
                            <FormCoaPicker
                                name="chart_of_account_uid"
                                label="Chart of Account (CoA)"
                                placeholder="Pilih Akun CoA Lawan..."
                                dialogTitle={`Pilih Akun CoA untuk ${isDebit ? "Debit" : "Kredit"} Kas`}
                                size="md"
                                disabled={isSubmitting}
                                allowClear
                            />

                            {/* Category Input */}
                            <FormInput<DebitCreditSchemaInput>
                                name="kategori"
                                label="Kategori / Label *"
                                placeholder={isDebit ? "Misal: modal_awal, piutang..." : "Misal: biaya_operasional, utang..."}
                                disabled={isSubmitting}
                            />

                            {/* Notes Input */}
                            <FormInput<DebitCreditSchemaInput>
                                name="catatan"
                                label="Catatan / Keterangan"
                                placeholder="Keterangan singkat mutasi..."
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-9 px-4 text-xs font-bold rounded-xl cursor-pointer"
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className={`h-9 px-5 text-xs font-bold text-white rounded-xl cursor-pointer shadow-sm ${
                                    isDebit
                                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                                        : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Memproses..." : isDebit ? "Catat Debit" : "Catat Kredit"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </BaseDialog>
    );
}
