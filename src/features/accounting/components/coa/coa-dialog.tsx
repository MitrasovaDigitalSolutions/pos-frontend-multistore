"use client";

import { useEffect } from "react";
import { useForm, FormProvider, Controller, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IconPlus, IconEdit, IconLoader2 } from "@tabler/icons-react";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Switch } from "@/components/ui/switch";
import { coaSchema, type CoaSchemaInput } from "../../schemas/coa-schema";
import { useCreateChartOfAccount, useUpdateChartOfAccount, useFlatChartOfAccounts } from "../../api/coa-api";
import type { ChartOfAccount } from "../../types";

interface CoaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    account: ChartOfAccount | null; // null means create mode
    parentAccount?: ChartOfAccount | null; // preselected parent when creating a sub-account
}

export function CoaDialog({
    open,
    onOpenChange,
    account,
    parentAccount,
}: CoaDialogProps) {
    const isEdit = !!account;
    const createMutation = useCreateChartOfAccount();
    const updateMutation = useUpdateChartOfAccount();
    const { data: flatAccounts, isLoading: isLoadingAccounts } = useFlatChartOfAccounts();

    const methods = useForm<CoaSchemaInput>({
        resolver: zodResolver(coaSchema) as Resolver<CoaSchemaInput>,
        defaultValues: {
            kode: "",
            nama: "",
            tipe: "asset",
            saldo_normal: "debit",
            parent_uid: "",
            is_active: true,
            keterangan: "",
        },
    });

    const {
        handleSubmit,
        reset,
        setValue,
        getValues,
        control,
        formState: { isSubmitting },
    } = methods;

    const watchedParentUid = useWatch({
        control,
        name: 'parent_uid'
    });
    const watchedTipe = useWatch({
        control,
        name: 'tipe'
    });

    // Reset/populate form values when dialog opens or changes
    useEffect(() => {
        if (open) {
            if (isEdit && account) {
                reset({
                    kode: account.kode,
                    nama: account.nama,
                    tipe: account.tipe,
                    saldo_normal: account.saldo_normal || "",
                    parent_uid: account.parent_uid || "",
                    is_active: account.is_active,
                    keterangan: account.keterangan || "",
                });
            } else {
                reset({
                    kode: "",
                    nama: "",
                    tipe: parentAccount ? parentAccount.tipe : "asset",
                    saldo_normal: parentAccount ? (parentAccount.saldo_normal || "") : "debit",
                    parent_uid: parentAccount ? parentAccount.uid : "",
                    is_active: true,
                    keterangan: "",
                });
            }
        }
    }, [open, isEdit, account, parentAccount, reset]);

    // Auto-set Tipe when Parent is selected (must match parent type)
    useEffect(() => {
        if (watchedParentUid && flatAccounts) {
            const parent = flatAccounts.find((a) => a.uid === watchedParentUid);
            if (parent) {
                setValue("tipe", parent.tipe);
            }
        }
    }, [watchedParentUid, flatAccounts, setValue]);

    // Auto-set default Debit / Kredit when Tipe changes
    useEffect(() => {
        if (watchedTipe) {
            const currentSaldo = getValues("saldo_normal");
            if (!currentSaldo) {
                if (watchedTipe === "asset" || watchedTipe === "expense") {
                    setValue("saldo_normal", "debit");
                } else {
                    setValue("saldo_normal", "kredit");
                }
            }
        }
    }, [watchedTipe, setValue, getValues]);

    const onSubmit = async (data: CoaSchemaInput) => {
        try {
            if (isEdit && account) {
                await updateMutation.mutateAsync({
                    uid: account.uid,
                    data,
                });
                toast.success(`Akun ${data.kode} - ${data.nama} berhasil diperbarui.`);
            } else {
                await createMutation.mutateAsync(data);
                toast.success(`Akun ${data.kode} - ${data.nama} berhasil dibuat.`);
            }
            onOpenChange(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal menyimpan akun.";
            toast.error(msg);
        }
    };

    // Filter parents options: can't select self as parent when in edit mode
    const parentOptions = (flatAccounts || [])
        .filter((a) => !isEdit || a.uid !== account?.uid)
        .map((a) => ({
            value: a.uid,
            label: `[${a.kode}] ${a.nama}`,
        }));

    const typeOptions = [
        { value: "asset", label: "Aset (Asset)" },
        { value: "liability", label: "Kewajiban / Liabilitas (Liability)" },
        { value: "equity", label: "Ekuitas / Modal (Equity)" },
        { value: "revenue", label: "Pendapatan / Omset (Revenue)" },
        { value: "expense", label: "Beban / Pengeluaran (Expense)" },
    ];

    const normalBalanceOptions = [
        { value: "debit", label: "Debit" },
        { value: "kredit", label: "Kredit" },
    ];

    const dialogTitle = (
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50">
                {isEdit ? <IconEdit size={18} /> : <IconPlus size={18} />}
            </div>
            <span>{isEdit ? "Ubah Akun" : "Tambah Akun Baru"}</span>
        </div>
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={dialogTitle}
            className="sm:max-w-lg"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    {/* Parent selection */}
                    <FormSelect<CoaSchemaInput>
                        name="parent_uid"
                        label="Akun Induk (Parent Account)"
                        placeholder="Pilih Akun Induk (Kosongkan jika akun utama/level 1)"
                        options={parentOptions}
                        isLoading={isLoadingAccounts}
                        emptyMessage="Tidak ada akun induk lain."
                        disabled={isSubmitting}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        {/* Kode Akun */}
                        <FormInput<CoaSchemaInput>
                            name="kode"
                            label="Kode Akun *"
                            placeholder="Contoh: 1-1000, 1101, dll."
                            disabled={isSubmitting}
                        />

                        {/* Nama Akun */}
                        <FormInput<CoaSchemaInput>
                            name="nama"
                            label="Nama Akun *"
                            placeholder="Contoh: Kas Kecil, Piutang Dagang"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Tipe Akun */}
                        <FormSelect<CoaSchemaInput>
                            name="tipe"
                            label="Tipe Akun *"
                            placeholder="Pilih Tipe Akun"
                            options={typeOptions}
                            disabled={isSubmitting || !!watchedParentUid}
                        />

                        {/* Debit / Kredit */}
                        <FormSelect<CoaSchemaInput>
                            name="saldo_normal"
                            label="Debit / Kredit (Default)"
                            placeholder="Pilih Debit / Kredit"
                            options={normalBalanceOptions}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Status Aktif */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Akun Aktif
                            </span>
                            <p className="text-[10px] text-slate-500">
                                Nonaktifkan jika akun ini tidak digunakan lagi dalam transaksi.
                            </p>
                        </div>
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                    </div>

                    {/* Keterangan */}
                    <FormTextarea<CoaSchemaInput>
                        name="keterangan"
                        label="Keterangan / Deskripsi"
                        placeholder="Masukkan deskripsi mengenai penggunaan akun ini (opsional)..."
                        className="min-h-[80px]"
                        disabled={isSubmitting}
                    />

                    {/* Submit & Cancel Buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                            className="h-10 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl flex items-center gap-1.5"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2 size={14} className="animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>{isEdit ? "Simpan Perubahan" : "Tambah Akun"}</span>
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
