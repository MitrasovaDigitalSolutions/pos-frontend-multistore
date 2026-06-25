"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconCirclePlus, IconCircleMinus } from "@tabler/icons-react";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
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
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${isDebit
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-rose-50 text-rose-600 border-rose-100"
                }`}>
                {isDebit ? <IconCirclePlus size={18} /> : <IconCircleMinus size={18} />}
            </div>
            <span>
                {isDebit ? "Debit Kas Manual (Uang Masuk)" : "Kredit Kas Manual (Uang Keluar)"}
            </span>
        </div>
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={dialogTitle}
            className="max-w-md"
        >
            <div className="space-y-4 pt-2">
                {/* Account Details Info */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                        <span className="text-slate-400 font-medium">Akun Kas</span>
                        <h4 className="font-extrabold text-slate-800 mt-0.5">{account.nama}</h4>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-400 font-medium">Saldo Saat Ini</span>
                        <h4 className="font-bold text-slate-800 mt-0.5">{formatRupiah(account.saldo)}</h4>
                    </div>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Nominal Input */}
                        <FormNominalInput<DebitCreditSchemaInput>
                            name="amount"
                            label="Nominal Transaksi *"
                            placeholder="Masukkan nominal Rp..."
                            disabled={isSubmitting}
                        />

                        {/* Category Input */}
                        <FormInput<DebitCreditSchemaInput>
                            name="kategori"
                            label="Kategori / Label *"
                            placeholder={isDebit ? "Misal: modal_awal, piutang..." : "Misal: biaya_operasional, utang..."}
                            disabled={isSubmitting}
                        />

                        {/* Notes Input */}
                        <FormTextarea<DebitCreditSchemaInput>
                            name="catatan"
                            label="Catatan / Keterangan"
                            placeholder="Keterangan lebih lengkap mengenai penyesuaian kas ini..."
                            className="min-h-[80px]"
                            disabled={isSubmitting}
                        />

                        {/* Action buttons */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-10 text-xs font-bold rounded-xl"
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className={`h-10 text-xs font-bold text-white rounded-xl ${isDebit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
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
