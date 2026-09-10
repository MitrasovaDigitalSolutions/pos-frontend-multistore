"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconScale } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useCreateUnit, useUpdateUnit } from "../api/units-api";
import { UNIT_TYPES, type UnitInput } from "../schemas/unit-schema";
import type { Unit } from "../types";

interface UnitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingUnit?: Unit | null;
}

export function UnitDialog({
    open,
    onOpenChange,
    editingUnit = null,
}: UnitDialogProps) {
    const createUnit = useCreateUnit();
    const updateUnit = useUpdateUnit();
    const isEdit = !!editingUnit;

    const { handleSubmit } = useFormContext<UnitInput>();

    const isPending = createUnit.isPending || updateUnit.isPending;

    const onSubmit = (data: UnitInput) => {
        if (isEdit && editingUnit) {
            updateUnit.mutate(
                { uid: editingUnit.uid, data },
                {
                    onSuccess: () => {
                        toast.success("Satuan berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui satuan.");
                    },
                },
            );
        } else {
            createUnit.mutate(data, {
                onSuccess: () => {
                    toast.success("Satuan berhasil dibuat.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membuat satuan.");
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
                    <IconScale size={20} className="text-emerald-500" />
                    <span>
                        {isEdit ? "Ubah Satuan Produk" : "Tambah Satuan Baru"}
                    </span>
                </>
            }
            className="max-w-md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormInput<UnitInput>
                    name="nama"
                    label="Nama Satuan *"
                    placeholder="Kilogram, Meter, Pcs, Lusin..."
                    disabled={isPending}
                />

                <FormInput<UnitInput>
                    name="simbol"
                    label="Simbol / Singkatan *"
                    placeholder="kg, m, pcs, roll..."
                    disabled={isPending}
                />

                <FormSelect<UnitInput>
                    name="tipe"
                    label="Tipe Satuan *"
                    options={UNIT_TYPES.map((t) => ({
                        value: t.value,
                        label: t.label,
                    }))}
                    placeholder="Pilih Tipe Satuan..."
                    disabled={isPending}
                />

                <FormInput<UnitInput>
                    name="deskripsi"
                    label="Deskripsi"
                    placeholder="Deskripsi singkat satuan produk..."
                    disabled={isPending}
                />

                <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Satuan"}
                </Button>
            </form>
        </BaseDialog>
    );
}
