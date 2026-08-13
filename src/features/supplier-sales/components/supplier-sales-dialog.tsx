"use client";

import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { IconTag } from "@tabler/icons-react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { useCreateSupplierSale, useUpdateSupplierSale } from "../api/supplier-sales-api";
import type { SupplierSalesInput } from "../schemas/supplier-sales-schema";
import type { SupplierSale } from "../types";

interface SupplierSalesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingSale?: SupplierSale | null;
}

export function SupplierSalesDialog({
    open,
    onOpenChange,
    editingSale = null,
}: SupplierSalesDialogProps) {
    const createSale = useCreateSupplierSale();
    const updateSale = useUpdateSupplierSale();
    const isEdit = !!editingSale;

    const { data: suppliers, isLoading: isLoadingSuppliers } = useAllSuppliers();

    const { handleSubmit, reset } = useFormContext<SupplierSalesInput>();

    const isPending = createSale.isPending || updateSale.isPending;

    const onSubmit = (data: SupplierSalesInput) => {
        if (isEdit && editingSale) {
            updateSale.mutate(
                { uid: editingSale.uid, data },
                {
                    onSuccess: () => {
                        toast.success("Sales berhasil diperbarui.");
                        onOpenChange(false);
                        reset({ supplier_uid: "", nama: "", keterangan: "", status: "active" });
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui sales.");
                    },
                },
            );
        } else {
            createSale.mutate(data, {
                onSuccess: () => {
                    toast.success("Sales berhasil dibuat.");
                    onOpenChange(false);
                    reset({ supplier_uid: "", nama: "", keterangan: "", status: "active" });
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membuat sales.");
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
                    <IconTag size={20} className="text-emerald-500" />
                    <span>{isEdit ? "Ubah Sales " : "Tambah Sales Baru"}</span>
                </>
            }
            className="max-w-md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormSelect<SupplierSalesInput>
                    name="supplier_uid"
                    label="Supplier *"
                    placeholder="Pilih supplier..."
                    searchPlaceholder="Cari supplier..."
                    isLoading={isLoadingSuppliers}
                    options={(suppliers || []).map((s) => ({ value: s.uid, label: s.nama }))}
                    disabled={isPending || isEdit}
                />

                <FormInput<SupplierSalesInput>
                    name="nama"
                    label="Nama Sales *"
                    placeholder="Contoh: Sales Bulan Ini"
                    disabled={isPending}
                />

                <FormTextarea
                    name="keterangan"
                    label="Keterangan"
                    placeholder="Catatan singkat sales..."
                    disabled={isPending}
                />

                <FormSelect<SupplierSalesInput>
                    name="status"
                    label="Status"
                    options={[
                        { value: "active", label: "Aktif" },
                        { value: "inactive", label: "Nonaktif" },
                    ]}
                    disabled={isPending}
                />

                <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Sales"}
                </Button>
            </form>
        </BaseDialog>
    );
}
