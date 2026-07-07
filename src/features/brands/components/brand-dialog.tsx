"use client";

import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconTag } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useCreateBrand, useUpdateBrand } from "../api/brands-api";
import {
    type BrandInput,
} from "../schemas/brand-schema";
import type { Brand } from "../types";

interface BrandDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingBrand?: Brand | null;
}

export function BrandDialog({
    open,
    onOpenChange,
    editingBrand = null,
}: BrandDialogProps) {
    const createBrand = useCreateBrand();
    const updateBrand = useUpdateBrand();
    const isEdit = !!editingBrand;

    const {
        handleSubmit,
    } = useFormContext<BrandInput>();

    const isPending = createBrand.isPending || updateBrand.isPending;

    const onSubmit = (data: BrandInput) => {
        if (isEdit && editingBrand) {
            updateBrand.mutate(
                { uid: editingBrand.uid, data },
                {
                    onSuccess: () => {
                        toast.success("Brand berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui brand.");
                    },
                },
            );
        } else {
            createBrand.mutate(data, {
                onSuccess: () => {
                    toast.success("Brand berhasil dibuat.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membuat brand.");
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
                    <IconTag
                        size={20}
                        className="text-emerald-500"
                    />
                    <span>
                        {isEdit ? "Ubah Brand / Merek" : "Tambah Brand Baru"}
                    </span>
                </>
            }
            className="max-w-md"
        >

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 pt-4"
            >
                {/* Nama */}
                <FormInput<BrandInput>
                    name="nama"
                    label="Nama Brand / Merek *"
                    placeholder="Samsung, Indofood, Unilever..."
                    disabled={isPending}
                />

                {/* Deskripsi
                    <FormTextarea
                        name="deskripsi"
                        label="Deskripsi"
                        placeholder="Deskripsi singkat brand/merek produk..."
                        className="text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl min-h-20"
                        disabled={isPending}
                    /> */}

                <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Brand"}
                </Button>
            </form>
        </BaseDialog>
    );
}
