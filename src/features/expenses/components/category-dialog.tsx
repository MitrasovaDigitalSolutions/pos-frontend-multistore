"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconCategory } from "@tabler/icons-react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useCreateExpenseCategory, useUpdateExpenseCategory } from "../api/expenses-api";
import type { ExpenseCategoryInput } from "../schemas/expense-schema";
import type { ExpenseCategory } from "../types";

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCategory?: ExpenseCategory | null;
}

export function CategoryDialog({
    open,
    onOpenChange,
    editingCategory = null,
}: CategoryDialogProps) {
    const createCategory = useCreateExpenseCategory();
    const updateCategory = useUpdateExpenseCategory();
    const isEdit = !!editingCategory;

    const { handleSubmit, setValue, control } = useFormContext<ExpenseCategoryInput>();
    const isPending = createCategory.isPending || updateCategory.isPending;

    // Watch is_recurring value to conditionally render due day field
    const isRecurring = useWatch({
        control,
        name: "is_recurring",
    });

    const onSubmit = (data: ExpenseCategoryInput) => {
        const payload = {
            ...data,
            // Convert hari_jatuh_tempo to number if it's a string, or null
            hari_jatuh_tempo: data.is_recurring && data.hari_jatuh_tempo
                ? Number(data.hari_jatuh_tempo)
                : null,
        };

        if (isEdit && editingCategory) {
            updateCategory.mutate(
                { uid: editingCategory.uid, data: payload },
                {
                    onSuccess: () => {
                        toast.success("Kategori pengeluaran berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui kategori.");
                    },
                },
            );
        } else {
            createCategory.mutate(payload, {
                onSuccess: () => {
                    toast.success("Kategori pengeluaran berhasil dibuat.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membuat kategori.");
                },
            });
        }
    };

    const recurringOptions = [
        { value: "true", label: "Ya (Pengeluaran Rutin)" },
        { value: "false", label: "Tidak (Pengeluaran Sekali/Insidentil)" },
    ];

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconCategory size={20} className="text-emerald-500" />
                    <span>{isEdit ? "Ubah Kategori Pengeluaran" : "Tambah Kategori Pengeluaran Baru"}</span>
                </>
            }
            className="max-w-md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                {/* Nama Kategori */}
                <FormInput<ExpenseCategoryInput>
                    name="nama"
                    label="Nama Kategori *"
                    placeholder="Gaji, Listrik & Air, Sewa Ruko..."
                    disabled={isPending}
                />

                {/* Apakah Berulang / Recurring */}
                <FormSelect<ExpenseCategoryInput>
                    name="is_recurring"
                    label="Pengeluaran Rutin / Berulang?"
                    options={recurringOptions}
                    placeholder="Pilih pengeluaran berulang..."
                    disabled={isPending}
                    onChange={(val) => {
                        setValue("is_recurring", val === "true");
                    }}
                />

                {/* Hari Jatuh Tempo - Only shown if is_recurring is true */}
                {isRecurring && (
                    <FormNumberInput<ExpenseCategoryInput>
                        name="hari_jatuh_tempo"
                        label="Tanggal Jatuh Tempo Bulanan (1 - 31) *"
                        placeholder="Contoh: 10 (Setiap tanggal 10)"
                        disabled={isPending}
                        min={1}
                        max={31}
                    />
                )}

                {/* Keterangan */}
                <FormTextarea<ExpenseCategoryInput>
                    name="keterangan"
                    label="Keterangan / Deskripsi"
                    placeholder="Tulis deskripsi singkat mengenai kategori pengeluaran ini..."
                    disabled={isPending}
                />

                <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4 border-none"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Kategori"}
                </Button>
            </form>
        </BaseDialog>
    );
}
