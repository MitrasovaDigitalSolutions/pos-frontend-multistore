"use client";

import { useEffect } from "react";
import { useForm, FormProvider, Controller, useFieldArray, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconLoader2, IconInfoCircle, IconAlertCircle } from "@tabler/icons-react";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { CommandSelect } from "@/components/ui/command-select";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { FormSelect } from "@/components/forms/form-select";
import {
    manualJournalSchema,
    type ManualJournalSchemaInput,
} from "../../schemas/manual-journal-schema";
import {
    useCreateManualJournal,
    useUpdateManualJournal,
    useManualJournalDetail,
} from "../../api/manual-journal-api";
import { useFlatChartOfAccounts } from "../../api/coa-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { ManualJournal } from "../../types/manual-journal";

interface JournalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    journal: ManualJournal | null; // null means create mode
}

export function JournalDialog({
    open,
    onOpenChange,
    journal,
}: JournalDialogProps) {
    const isEdit = !!journal;
    const createMutation = useCreateManualJournal();
    const updateMutation = useUpdateManualJournal();
    const { data: flatAccounts, isLoading: isLoadingAccounts } = useFlatChartOfAccounts();

    // In edit mode, fetch the detail with lines
    const { data: detailData, isLoading: isLoadingDetail } = useManualJournalDetail(
        isEdit && journal ? journal.uid : null
    );

    const methods = useForm<ManualJournalSchemaInput>({
        resolver: zodResolver(manualJournalSchema) as Resolver<ManualJournalSchemaInput>,
        defaultValues: {
            transaction_date: new Date().toISOString().substring(0, 10),
            description: "",
            status: "draft",
            lines: [
                { chart_of_account_uid: "", description: "", debit: 0, credit: 0 },
                { chart_of_account_uid: "", description: "", debit: 0, credit: 0 },
            ],
        },
    });

    const {
        handleSubmit,
        reset,
        control,
        setValue,
        getValues,
        formState: { errors, isSubmitting },
    } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines",
    });

    // Populate or reset form values
    useEffect(() => {
        if (open) {
            if (isEdit && detailData) {
                reset({
                    transaction_date: detailData.transaction_date,
                    description: detailData.description,
                    status: detailData.status === "voided" ? "draft" : detailData.status,
                    lines: detailData.lines?.map((l) => ({
                        chart_of_account_uid: l.chart_of_account_uid,
                        description: l.description,
                        debit: l.debit,
                        credit: l.credit,
                    })) || [],
                });
            } else if (!isEdit) {
                reset({
                    transaction_date: new Date().toISOString().substring(0, 10),
                    description: "",
                    status: "draft",
                    lines: [
                        { chart_of_account_uid: "", description: "", debit: 0, credit: 0 },
                        { chart_of_account_uid: "", description: "", debit: 0, credit: 0 },
                    ],
                });
            }
        }
    }, [open, isEdit, detailData, reset]);

    const onSubmit = async (data: ManualJournalSchemaInput) => {
        try {
            if (isEdit && journal) {
                await updateMutation.mutateAsync({
                    uid: journal.uid,
                    data,
                });
                toast.success(`Jurnal manual ${journal.reference_number} berhasil diperbarui.`);
            } else {
                await createMutation.mutateAsync(data);
                toast.success("Jurnal manual berhasil dibuat.");
            }
            onOpenChange(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal menyimpan jurnal.";
            toast.error(msg);
        }
    };

    // Watch lines for real-time totals computation
    const watchedLines = useWatch({
        control,
        name: "lines",
    });

    const totalDebit = watchedLines?.reduce((sum, l) => sum + (Number(l?.debit) || 0), 0) || 0;
    const totalCredit = watchedLines?.reduce((sum, l) => sum + (Number(l?.credit) || 0), 0) || 0;
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference < 0.01;

    // Build COA options
    const coaOptions = (flatAccounts || [])
        .filter((a) => a.is_active)
        .map((a) => ({
            value: a.uid,
            label: `[${a.kode}] ${a.nama}`,
        }));

    const statusOptions = [
        { value: "draft", label: "Draft (Belum di-posting)" },
        { value: "posted", label: "Posted (Langsung masuk buku besar)" },
    ];

    const isLoading = isLoadingAccounts || (isEdit && isLoadingDetail);

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Edit Jurnal Manual" : "Buat Jurnal Manual"}
            className="w-full max-w-5xl"
            scrollable={true}
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                    <IconLoader2 className="animate-spin text-emerald-600" size={32} />
                    <span className="text-xs font-semibold">Memuat Data...</span>
                </div>
            ) : (
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
                        {/* Header Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Controller
                                control={control}
                                name="transaction_date"
                                render={({ field: { onChange, value } }) => (
                                    <DatePicker
                                        value={value}
                                        onChange={onChange}
                                        label="Tanggal Transaksi"
                                        error={errors.transaction_date?.message}
                                    />
                                )}
                            />

                            <div className="md:col-span-2">
                                <FormSelect
                                    name="status"
                                    label="Status Jurnal"
                                    options={statusOptions}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <FormTextarea
                            name="description"
                            label="Keterangan Jurnal"
                            placeholder="Masukkan keterangan umum atau tujuan dibuatnya jurnal ini..."
                            className="min-h-16"
                        />

                        {/* Lines Section */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Daftar Entri Transaksi (Debit & Kredit)
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const mainDesc = getValues("description") || "";
                                        append({
                                            chart_of_account_uid: "",
                                            description: mainDesc,
                                            debit: 0,
                                            credit: 0,
                                        });
                                    }}
                                    className="h-8 rounded-lg text-[10px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50/20 hover:bg-emerald-50 hover:text-emerald-800"
                                >
                                    <IconPlus size={12} className="mr-1" /> Tambah Baris
                                </Button>
                            </div>

                            {errors.lines?.root && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl flex items-start gap-2 text-xs font-semibold">
                                    <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>{errors.lines.root.message}</span>
                                </div>
                            )}

                            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                            <th className="py-2.5 px-3 w-1/3">Akun</th>
                                            <th className="py-2.5 px-3 w-5/12">Keterangan Baris</th>
                                            <th className="py-2.5 px-3 w-2/12 text-right">Debit</th>
                                            <th className="py-2.5 px-3 w-2/12 text-right">Kredit</th>
                                            <th className="py-2.5 px-2 w-[48px] text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {fields.map((field, index) => {
                                            const rowError = errors.lines?.[index];
                                            return (
                                                <tr key={field.id} className="align-top hover:bg-slate-50/20">
                                                    {/* Account Selection */}
                                                    <td className="py-3 px-3">
                                                        <Controller
                                                            control={control}
                                                            name={`lines.${index}.chart_of_account_uid`}
                                                            render={({ field: { onChange, value } }) => (
                                                                <CommandSelect
                                                                    options={coaOptions}
                                                                    value={value}
                                                                    onChange={onChange}
                                                                    placeholder="Pilih Akun..."
                                                                    searchPlaceholder="Cari akun..."
                                                                    className="h-9 text-xs"
                                                                />
                                                            )}
                                                        />
                                                        {rowError?.chart_of_account_uid && (
                                                            <p className="text-[9px] text-rose-500 mt-1 font-medium">
                                                                {rowError.chart_of_account_uid.message}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Row Description */}
                                                    <td className="py-3 px-3">
                                                        <Controller
                                                            control={control}
                                                            name={`lines.${index}.description`}
                                                            render={({ field: { onChange, value } }) => (
                                                                <Input
                                                                    value={value || ""}
                                                                    onChange={onChange}
                                                                    placeholder="Keterangan baris..."
                                                                    className="h-9 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                                                />
                                                            )}
                                                        />
                                                        {rowError?.description && (
                                                            <p className="text-[9px] text-rose-500 mt-1 font-medium">
                                                                {rowError.description.message}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Debit Input */}
                                                    <td className="py-3 px-3 text-right">
                                                        <FormNominalInput
                                                            name={`lines.${index}.debit`}
                                                            onValueChange={(val) => {
                                                                if (val && val > 0) {
                                                                    // Auto reset credit of the same line to 0
                                                                    setValue(`lines.${index}.credit`, 0);
                                                                }
                                                            }}
                                                            className="h-9 text-right font-mono text-xs text-emerald-600"
                                                        />
                                                        {rowError?.debit && (
                                                            <p className="text-[9px] text-rose-500 mt-1 font-medium text-left">
                                                                {rowError.debit.message}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Credit Input */}
                                                    <td className="py-3 px-3 text-right">
                                                        <FormNominalInput
                                                            name={`lines.${index}.credit`}
                                                            onValueChange={(val) => {
                                                                if (val && val > 0) {
                                                                    // Auto reset debit of the same line to 0
                                                                    setValue(`lines.${index}.debit`, 0);
                                                                }
                                                            }}
                                                            className="h-9 text-right font-mono text-xs text-rose-600"
                                                        />
                                                    </td>

                                                    {/* Remove Button */}
                                                    <td className="py-3 px-2 text-center align-middle">
                                                        <button
                                                            type="button"
                                                            disabled={fields.length <= 2}
                                                            onClick={() => remove(index)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none transition-colors border-none bg-transparent outline-none cursor-pointer mt-0.5"
                                                        >
                                                            <IconTrash size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        {/* Total Row */}
                                        <tr className="bg-slate-50 font-bold border-t border-slate-100">
                                            <td colSpan={2} className="py-3 px-3 text-xs font-bold text-slate-700 text-right">
                                                TOTAL
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-emerald-600">
                                                {formatRupiah(totalDebit)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-rose-600">
                                                {formatRupiah(totalCredit)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Balance Warnings / Info */}
                            <div className="flex flex-col md:flex-row justify-between gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <IconInfoCircle size={16} className="text-slate-400 shrink-0" />
                                    <span>Debit dan Kredit harus seimbang agar transaksi dapat dicatat.</span>
                                </div>
                                <div className="flex flex-col md:items-end">
                                    {isBalanced ? (
                                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                                            ✓ Balanced (Debit = Kredit)
                                        </span>
                                    ) : (
                                        <span className="text-rose-600 font-bold flex items-center gap-1 animate-pulse">
                                            ✗ Unbalanced (Selisih: {formatRupiah(difference)})
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className="h-10 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isBalanced}
                                className="h-10 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting && <IconLoader2 className="animate-spin" size={16} />}
                                {isEdit ? "Simpan Perubahan" : "Posting Jurnal"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            )}
        </BaseDialog>
    );
}
