"use client";

import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { IconCheck, IconScale } from "@tabler/icons-react";
import { toast } from "sonner";

import { FormSelect } from "@/components/forms/form-select";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import type { CommandOption } from "@/components/ui/command-select";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { useBalanceEntry } from "@/features/accounting/api/reports-api";
import type { GeneralLedgerEntry } from "@/features/accounting/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface BalanceEntryDialogProps {
    selectedEntry: GeneralLedgerEntry | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface BalanceEntryFormValues {
    chartOfAccountUid: string;
}

export function BalanceEntryDialog({
    selectedEntry,
    onClose,
    onSuccess,
}: BalanceEntryDialogProps) {
    const { data: coaData, isLoading: isLoadingCoas } = useFlatChartOfAccounts();
    const balanceMutation = useBalanceEntry();

    const dialogMethods = useForm<BalanceEntryFormValues>({
        defaultValues: {
            chartOfAccountUid: "",
        },
    });

    const coaOptions = useMemo<CommandOption[]>(() => {
        if (!coaData) return [];
        return coaData
            .filter((c) => c.is_active)
            .map((c) => ({
                value: c.uid,
                label: `[${c.kode}] ${c.nama}`,
                description: `${c.tipe.toUpperCase()} — ${c.saldo_normal === "debit" ? "Debit" : "Kredit"}`,
            }));
    }, [coaData]);

    const selectedDiff = selectedEntry
        ? Math.abs(Number(selectedEntry.debit) - Number(selectedEntry.credit))
        : 0;

    const onSubmitBalanceEntry = dialogMethods.handleSubmit((values) => {
        if (!selectedEntry) return;

        balanceMutation.mutate(
            {
                unbalanced_uid: selectedEntry.uid,
                chart_of_account_uid: values.chartOfAccountUid,
            },
            {
                onSuccess: (res) => {
                    toast.success(res.message || "Entry balancing berhasil dibuat.");
                    onClose();
                    onSuccess();
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membuat entry balancing.");
                },
            }
        );
    });

    return (
        <BaseDialog
            open={!!selectedEntry}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            title={
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <IconScale size={18} className="text-amber-500" />
                    <span>Pilih Akun Penyeimbang COA</span>
                </div>
            }
            className="max-w-lg"
        >
            {selectedEntry && (
                <FormProvider {...dialogMethods}>
                    <form onSubmit={onSubmitBalanceEntry} className="space-y-5 pt-3">
                        {/* Selected Entry Detail Summary */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                            <div className="flex justify-between items-center text-xs border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Akun Saat Ini</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                                    [{selectedEntry.kode ?? "-"}] {selectedEntry.nama}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-400 block">Debit</span>
                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {Number(selectedEntry.debit) > 0 ? formatRupiah(Number(selectedEntry.debit)) : "-"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block">Kredit</span>
                                    <span className="font-extrabold text-rose-600 dark:text-rose-400">
                                        {Number(selectedEntry.credit) > 0 ? formatRupiah(Number(selectedEntry.credit)) : "-"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block">Selisih Penyeimbang</span>
                                    <span className="font-extrabold text-amber-600 dark:text-amber-400">
                                        {formatRupiah(selectedDiff)}
                                    </span>
                                </div>
                            </div>

                            {selectedEntry.description && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">Keterangan: </span>
                                    {selectedEntry.description}
                                </div>
                            )}
                        </div>

                        {/* COA Selection Form Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Akun COA Penyeimbang <span className="text-rose-500">*</span>
                            </label>
                            <FormSelect
                                name="chartOfAccountUid"
                                options={coaOptions}
                                placeholder="Pilih akun COA penyeimbang..."
                                searchPlaceholder="Cari berdasarkan kode atau nama..."
                                emptyMessage="Akun COA tidak ditemukan."
                                isLoading={isLoadingCoas}
                                className="w-full dark:bg-slate-900"
                            />
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                                Sistem akan membuat entri balancing jurnal dengan akun COA di atas untuk menetralkan selisih sebesar{" "}
                                <strong className="text-slate-700 dark:text-slate-300">{formatRupiah(selectedDiff)}</strong>.
                            </p>
                        </div>

                        {/* Dialog Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={balanceMutation.isPending}
                                className="rounded-xl text-xs font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={balanceMutation.isPending || !dialogMethods.watch("chartOfAccountUid")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                            >
                                {balanceMutation.isPending ? (
                                    "Menyimpan..."
                                ) : (
                                    <>
                                        <IconCheck size={16} />
                                        Simpan Entry Penyeimbang
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            )}
        </BaseDialog>
    );
}
