"use client";

import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormRadioChips } from "@/components/forms/form-radio-chips";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconTags } from "@tabler/icons-react";
import {
    useCreateBomComponentType,
    useUpdateBomComponentType,
} from "../api/bom-component-types-api";
import {
    BOM_BUSINESS_CATEGORIES,
    type BomComponentTypeInput,
} from "../schemas/bom-component-type-schema";
import type { BomComponentType } from "../types";

interface BomComponentTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingType?: BomComponentType | null;
}

export function BomComponentTypeDialog({
    open,
    onOpenChange,
    editingType = null,
}: BomComponentTypeDialogProps) {
    const createMutation = useCreateBomComponentType();
    const updateMutation = useUpdateBomComponentType();
    const isEdit = !!editingType;

    const { handleSubmit } = useFormContext<BomComponentTypeInput>();

    const isPending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (data: BomComponentTypeInput) => {
        if (isEdit && editingType) {
            updateMutation.mutate(
                { uid: editingType.uid, data },
                {
                    onSuccess: () => {
                        toast.success("Tipe komponen BoM berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui tipe komponen BoM.");
                    },
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Tipe komponen BoM berhasil ditambahkan.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menambahkan tipe komponen BoM.");
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
                    <IconTags size={20} className="text-emerald-500" />
                    <span>
                        {isEdit ? "Ubah Tipe Komponen BoM" : "Tambah Tipe Komponen BoM"}
                    </span>
                </>
            }
            className="sm:max-w-xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
                {/* 2-Column Grid for Input Fields: Ultra Compact, No Scroll */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nama Tipe */}
                    <FormInput<BomComponentTypeInput>
                        name="nama"
                        label="Nama Tipe Komponen *"
                        placeholder="cth: Kain Utama, Kancing, Saus..."
                        disabled={isPending}
                    />

                    {/* Kode Tipe */}
                    <FormInput<BomComponentTypeInput>
                        name="kode"
                        label="Kode Tipe *"
                        placeholder="cth: kain_utama"
                        disabled={isEdit || isPending}
                    />

                    {/* Kategori Bisnis */}
                    <FormSelect<BomComponentTypeInput>
                        name="kategori_bisnis"
                        label="Kategori Bisnis *"
                        options={BOM_BUSINESS_CATEGORIES.map((c) => ({
                            value: c.value,
                            label: c.label,
                        }))}
                        placeholder="Pilih Kategori..."
                        disabled={isPending}
                    />

                    {/* Deskripsi */}
                    <FormInput<BomComponentTypeInput>
                        name="deskripsi"
                        label="Deskripsi (Opsional)"
                        placeholder="Catatan tambahan komponen..."
                        disabled={isPending}
                    />
                </div>

                {/* Klasifikasi Peran Manufaktur: Radio Bullets with Informative Tooltips */}
                <div className="p-2.5 px-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1.5">
                    <FormRadioChips<BomComponentTypeInput>
                        name="is_main_driver"
                        label="Klasifikasi Peran Bahan Manufaktur *"
                        variant="radio"
                        disabled={isPending}
                        options={[
                            {
                                value: "true",
                                label: "Bahan Baku Utama (Primary)",
                                badge: "Utama",
                                tooltip:
                                    "Jika dipilih Bahan Baku Utama: Merupakan material inti pembentuk produk (misal: Kain Dasar, Kayu Rangka, Tepung Pokok). Pemakaian bahan ini menjadi acuan basis pembagian alokasi biaya/HPP ke setiap varian ukuran atau tipe barang jadi.",
                            },
                            {
                                value: "false",
                                label: "Bahan Pendukung (Supporting / Pelengkap)",
                                badge: "Pendukung",
                                tooltip:
                                    "Jika dipilih Bahan Pendukung: Merupakan material pendukung/pelengkap (misal: Kancing, Benang Jahit, Label, Plastik Kemasan). Alokasi biayanya akan mengikuti proporsi dari bahan baku utama.",
                            },
                        ]}
                    />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    disabled={isPending}
                >
                    {isPending
                        ? "Menyimpan..."
                        : isEdit
                            ? "Simpan Perubahan Tipe"
                            : "Buat Tipe Komponen"}
                </Button>
            </form>
        </BaseDialog>
    );
}
