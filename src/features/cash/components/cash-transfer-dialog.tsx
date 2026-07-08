"use client";

import { useEffect } from "react";
import { useForm, FormProvider, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconArrowsExchange, IconWallet } from "@tabler/icons-react";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/forms/form-select";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { transferSchema, type TransferSchemaInput } from "../schemas/cash-schema";
import { useTransferCashAccount, type CashAccount } from "../api/cash-api";

interface CashTransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: CashAccount[];
}

export function CashTransferDialog({
    open,
    onOpenChange,
    accounts,
}: CashTransferDialogProps) {
    const transferMutation = useTransferCashAccount();

    const methods = useForm<TransferSchemaInput>({
        resolver: zodResolver(transferSchema) as Resolver<TransferSchemaInput>,
        defaultValues: {
            from_account_uid: "",
            to_account_uid: "",
            amount: 0,
            catatan: "",
        },
    });

    const {
        handleSubmit,
        reset,
        setError,
        control,
        formState: { isSubmitting },
    } = methods;

    // Watch from_account_uid to show balance
    const fromAccountId = useWatch({ name: "from_account_uid", control });
    const fromAccount = accounts.find((a) => a.uid === fromAccountId);

    useEffect(() => {
        if (open) {
            reset({
                from_account_uid: "",
                to_account_uid: "",
                amount: 0,
                catatan: "",
            });
        }
    }, [open, reset]);

    const onSubmit = async (data: TransferSchemaInput) => {
        // Validate from/to diff
        if (data.from_account_uid === data.to_account_uid) {
            setError("to_account_uid", {
                type: "manual",
                message: "Akun asal dan tujuan transfer tidak boleh sama.",
            });
            return;
        }

        // Validate source account balance
        const sourceAcc = accounts.find((a) => a.uid === data.from_account_uid);
        if (!sourceAcc) {
            setError("from_account_uid", {
                type: "manual",
                message: "Akun asal tidak valid.",
            });
            return;
        }

        if (data.amount > sourceAcc.saldo) {
            setError("amount", {
                type: "manual",
                message: `Saldo pengirim tidak mencukupi. Saldo saat ini: ${formatRupiah(sourceAcc.saldo)}.`,
            });
            return;
        }

        try {
            await transferMutation.mutateAsync(data);
            const targetAcc = accounts.find((a) => a.uid === data.to_account_uid);
            toast.success(`Transfer saldo sebesar ${formatRupiah(data.amount)} dari ${sourceAcc.nama} ke ${targetAcc?.nama || "Tujuan"} berhasil.`);
            onOpenChange(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal memproses transfer saldo.";
            toast.error(msg);
        }
    };

    // Prepare dropdown options
    const fromOptions = accounts.map((acc) => ({
        value: String(acc.uid),
        label: `${acc.nama} (${formatRupiah(acc.saldo)})`,
    }));

    // Filter target options to avoid picking same account in UI selection
    const toOptions = accounts.map((acc) => ({
        value: String(acc.uid),
        label: `${acc.nama} (${formatRupiah(acc.saldo)})`,
    }));

    const dialogTitle = (
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-100">
                <IconArrowsExchange size={18} />
            </div>
            <span>Transfer Saldo Kas / Bank</span>
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
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Source Account */}
                        <FormSelect<TransferSchemaInput>
                            name="from_account_uid"
                            label="Dari Akun Kas (Asal) *"
                            placeholder="-- Pilih Akun Kas Asal --"
                            options={fromOptions}
                            disabled={isSubmitting}
                        />

                        {/* Balance display for source account */}
                        {fromAccount && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                    <IconWallet size={14} className="text-slate-400" />
                                    Saldo Tersedia:
                                </span>
                                <span className="font-extrabold text-slate-800">
                                    {formatRupiah(fromAccount.saldo)}
                                </span>
                            </div>
                        )}

                        {/* Target Account */}
                        <FormSelect<TransferSchemaInput>
                            name="to_account_uid"
                            label="Ke Akun Kas (Tujuan) *"
                            placeholder="-- Pilih Akun Kas Tujuan --"
                            options={toOptions}
                            disabled={isSubmitting}
                        />

                        {/* Amount */}
                        <FormNominalInput<TransferSchemaInput>
                            name="amount"
                            label="Nominal Transfer *"
                            placeholder="Masukkan nominal Rp..."
                            disabled={isSubmitting}
                        />

                        {/* Notes */}
                        <FormTextarea<TransferSchemaInput>
                            name="catatan"
                            label="Catatan / Keterangan"
                            placeholder="Keterangan transfer (misal: isi kas kecil, setoran bank, dsb)..."
                            className="min-h-[80px]"
                            disabled={isSubmitting}
                        />

                        {/* Action Buttons */}
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
                                className="h-10 text-xs font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Mentransfer..." : " Transfer"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </BaseDialog>
    );
}
