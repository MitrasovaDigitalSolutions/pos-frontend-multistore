"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    IconWallet,
    IconBuildingBank,
    IconReceipt,
    IconInfoCircle,
    IconLoader2,
    IconLock,
} from "@tabler/icons-react";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormRadioChips } from "@/components/forms/form-radio-chips";
import { FormSwitch } from "@/components/forms/form-switch";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    cashAccountSchema,
    type CashAccountFormValues,
} from "../schemas/cash-schema";
import {
    useCreateCashAccount,
    useUpdateCashAccount,
    type CashAccount,
} from "../api/cash-api";

interface CashAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingAccount: CashAccount | null;
    isMapped?: boolean;
}

const TYPE_OPTIONS = [
    {
        value: "cash",
        label: "Kas",
        icon: <IconWallet size={13} />,
    },
    {
        value: "bank",
        label: "Bank / Transfer",
        icon: <IconBuildingBank size={13} />,
    },
    {
        value: "register",
        label: "Laci Kasir",
        icon: <IconReceipt size={13} />,
    },
];

export function CashAccountDialog({
    open,
    onOpenChange,
    editingAccount,
    isMapped = false,
}: CashAccountDialogProps) {
    const isEdit = !!editingAccount;
    const createAccount = useCreateCashAccount();
    const updateAccount = useUpdateCashAccount();

    const isPending = createAccount.isPending || updateAccount.isPending;

    const methods = useForm<CashAccountFormValues>({
        resolver: zodResolver(cashAccountSchema) as Resolver<CashAccountFormValues>,
        defaultValues: {
            nama: "",
            tipe: "cash",
            nomor_rekening: "",
            deskripsi: "",
            saldo_awal: 0,
            is_active: true,
        },
    });

    const {
        handleSubmit,
        reset,
        control,
        formState: { isSubmitting },
    } = methods;

    const selectedType = useWatch({ control, name: "tipe" });

    // Reset values when dialog opens or editingAccount changes
    useEffect(() => {
        if (open) {
            if (editingAccount) {
                reset({
                    nama: editingAccount.nama || "",
                    tipe: (editingAccount.tipe as "cash" | "bank" | "register") || "cash",
                    nomor_rekening: editingAccount.nomor_rekening || "",
                    deskripsi: editingAccount.deskripsi || "",
                    saldo_awal: 0,
                    is_active: editingAccount.is_active ?? true,
                });
            } else {
                reset({
                    nama: "",
                    tipe: "cash",
                    nomor_rekening: "",
                    deskripsi: "",
                    saldo_awal: 0,
                    is_active: true,
                });
            }
        }
    }, [open, editingAccount, reset]);

    const onSubmit = (data: CashAccountFormValues) => {
        if (isMapped) {
            toast.warning("Akun kas ini telah dimapping untuk transaksi dan tidak dapat diubah.");
            return;
        }

        if (isEdit && editingAccount) {
            updateAccount.mutate(
                {
                    uid: editingAccount.uid,
                    data: {
                        nama: data.nama.trim(),
                        tipe: data.tipe,
                        nomor_rekening: data.nomor_rekening?.trim() || null,
                        deskripsi: data.deskripsi?.trim() || null,
                        is_active: data.is_active,
                    },
                },
                {
                    onSuccess: () => {
                        toast.success("Akun kas berhasil diperbarui");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui akun kas");
                    },
                }
            );
        } else {
            // Automatically send saldo_awal: 0 as requested
            createAccount.mutate(
                {
                    nama: data.nama.trim(),
                    tipe: data.tipe,
                    nomor_rekening: data.nomor_rekening?.trim() || null,
                    deskripsi: data.deskripsi?.trim() || null,
                    saldo_awal: 0,
                },
                {
                    onSuccess: () => {
                        toast.success("Akun kas baru berhasil dibuat");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal membuat akun kas");
                    },
                }
            );
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            scrollable={false}
            title={
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shrink-0">
                        <IconWallet size={15} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {isEdit ? "Ubah Akun Kas" : "Tambah Akun Kas Baru"}
                    </span>
                </div>
            }
            className="max-w-lg sm:max-w-lg p-4 sm:p-6"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
                    {/* Warning Callout jika Akun Dipakai Transaksi */}
                    {isMapped && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-50/80 border border-violet-200 text-violet-900 text-xs">
                            <IconLock size={16} className="text-violet-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="font-extrabold text-violet-950">Akun Kas Dipakai Transaksi (Terkunci)</p>
                                <p className="text-[11px] text-violet-800 leading-snug">
                                    Akun kas ini sedang aktif digunakan untuk transaksi operasional toko dan dikunci dari pengubahan maupun penghapusan demi konsistensi pembukuan.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tipe Akun Kas - Compact Segmented */}
                    <div className="space-y-1">
                        <label className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                            Tipe Akun Kas *
                        </label>
                        <FormRadioChips<CashAccountFormValues>
                            name="tipe"
                            options={TYPE_OPTIONS}
                            variant="segmented"
                            size="xs"
                            disabled={isPending || isSubmitting || isMapped}
                        />
                    </div>

                    {/* Nama Akun Kas & Nomor Rekening (2 Kolom Compact) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <FormInput<CashAccountFormValues>
                            name="nama"
                            label="Nama Akun Kas *"
                            placeholder={
                                selectedType === "bank"
                                    ? "BCA Operasional"
                                    : selectedType === "register"
                                        ? "Kasir Toko 1"
                                        : "Kas Toko"
                            }
                            disabled={isPending || isSubmitting || isMapped}
                            className="h-8.5 text-xs"
                        />

                        <FormInput<CashAccountFormValues>
                            name="nomor_rekening"
                            label={
                                selectedType === "bank"
                                    ? "No. Rekening *"
                                    : "No. Rekening (Opsional)"
                            }
                            placeholder={
                                selectedType === "bank"
                                    ? "Contoh: 5220304050"
                                    : "Opsional"
                            }
                            disabled={isPending || isSubmitting || isMapped}
                            className="h-8.5 text-xs font-mono"
                        />
                    </div>

                    {/* Deskripsi (Single Line Compact Input) */}
                    <FormInput<CashAccountFormValues>
                        name="deskripsi"
                        label="Deskripsi / Catatan (Opsional)"
                        placeholder="Keterangan singkat tentang peruntukan akun kas ini..."
                        disabled={isPending || isSubmitting || isMapped}
                        className="h-8.5 text-xs"
                    />

                    {/* Saldo Info Callout - Hanya saat Edit */}
                    {isEdit && editingAccount && (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px]">
                            <div className="flex items-center gap-1.5 text-blue-700">
                                <IconInfoCircle size={13} className="shrink-0" />
                                <span className="font-medium">Saldo saat ini:</span>
                            </div>
                            <span className="font-extrabold text-blue-950 font-mono text-xs">
                                {formatRupiah(editingAccount.saldo)}
                            </span>
                        </div>
                    )}

                    {/* Status Aktif - Hanya saat Edit */}
                    {isEdit && (
                        <FormSwitch<CashAccountFormValues>
                            name="is_active"
                            label="Status Akun Aktif"
                            description="Nonaktifkan jika akun kas ini sudah tidak digunakan lagi."
                            disabled={isPending || isSubmitting || isMapped}
                            className="p-2.5 rounded-lg text-xs"
                        />
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending || isSubmitting}
                            className="text-xs h-8.5 px-3.5 rounded-lg cursor-pointer text-slate-600 hover:text-slate-800"
                        >
                            {isMapped ? "Tutup" : "Batal"}
                        </Button>
                        {!isMapped && (
                            <Button
                                type="submit"
                                disabled={isPending || isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8.5 px-4 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                                {isPending || isSubmitting ? (
                                    <>
                                        <IconLoader2 size={13} className="animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>{isEdit ? "Simpan Perubahan" : "Buat Akun Kas"}</span>
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
