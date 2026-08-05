"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { IconFolder, IconLoader2 } from "@tabler/icons-react";
import { type ParentCategory, useCreateParentCategory, useUpdateParentCategory } from "../../api/parent-categories-api";
import { toast } from "sonner";

const parentCategorySchema = z.object({
    nama: z.string().min(1, "Nama Kategori Induk wajib diisi").max(255, "Maksimal 255 karakter"),
});

export type ParentCategoryInput = z.infer<typeof parentCategorySchema>;

interface ParentCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentCategory?: ParentCategory | null;
}

export function ParentCategoryDialog({
    open,
    onOpenChange,
    parentCategory,
}: ParentCategoryDialogProps) {
    const isEditing = !!parentCategory;

    const methods = useForm<ParentCategoryInput>({
        resolver: zodResolver(parentCategorySchema),
        defaultValues: {
            nama: "",
        },
    });

    const createMutation = useCreateParentCategory();
    const updateMutation = useUpdateParentCategory();

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            methods.reset({
                nama: parentCategory?.nama ?? "",
            });
        }
    }, [open, parentCategory, methods]);

    const onSubmit = async (values: ParentCategoryInput) => {
        try {
            if (isEditing && parentCategory) {
                await updateMutation.mutateAsync({
                    uid: parentCategory.uid,
                    data: values,
                });
                toast.success("Kategori Induk berhasil diperbarui");
            } else {
                await createMutation.mutateAsync(values);
                toast.success("Kategori Induk berhasil ditambahkan");
            }
            onOpenChange(false);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(errorMsg);
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconFolder size={20} className="text-emerald-500" />
                    <span>
                        {isEditing ? "Ubah Kategori Induk" : "Tambah Kategori Induk Baru"}
                    </span>
                </>
            }
            className="max-w-md"
        >
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 pt-1">
                    <FormInput<ParentCategoryInput>
                        name="nama"
                        label="Nama Kategori Induk *"
                        placeholder="Contoh: Makanan & Minuman, Operasional..."
                        disabled={isSubmitting}
                    />

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="h-10 px-4 text-xs font-bold border-slate-200 hover:bg-slate-50 dark:border-slate-800 rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2 size={14} className="animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>{isEditing ? "Simpan Perubahan" : "Buat Kategori Induk"}</span>
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
