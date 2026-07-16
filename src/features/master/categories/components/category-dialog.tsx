"use client";

import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconFolder } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useCreateCategory, useUpdateCategory } from "../api/categories-api";
import {
    type CategoryInput,
} from "../schemas/category-schema";
import type { Category } from "../types";

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCategory?: Category | null;
}

export function CategoryDialog({
    open,
    onOpenChange,
    editingCategory = null,
}: CategoryDialogProps) {
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();
    const isEdit = !!editingCategory;

    const {
        handleSubmit,
    } = useFormContext<CategoryInput>();

    const isPending = createCategory.isPending || updateCategory.isPending;

    const onSubmit = (data: CategoryInput) => {
        if (isEdit && editingCategory) {
            updateCategory.mutate(
                { uid: editingCategory.uid, data },
                {
                    onSuccess: () => {
                        toast.success("Kategori berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui kategori.");
                    },
                },
            );
        } else {
            createCategory.mutate(data, {
                onSuccess: () => {
                    toast.success("Kategori berhasil dibuat.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membuat kategori.");
                },
            });
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconFolder
                        size={20}
                        className="text-emerald-500"
                    />
                    <span>
                        {isEdit ? "Ubah Kategori Produk" : "Tambah Kategori Baru"}
                    </span>
                </>
            }
            className="max-w-md"
        >

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
            >
                {/* Nama */}
                <FormInput<CategoryInput>
                    name="nama"
                    label="Nama Kategori *"
                    placeholder="Makanan, Minuman, Elektronik..."
                    disabled={isPending}
                />

                {/* Deskripsi
                    <FormTextarea
                        name="deskripsi"
                        label="Deskripsi"
                        placeholder="Deskripsi singkat kategori produk..."
                        className="text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl min-h-20"
                        disabled={isPending}
                    /> */}

                <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Kategori"}
                </Button>
            </form>
        </BaseDialog>
    );
}
