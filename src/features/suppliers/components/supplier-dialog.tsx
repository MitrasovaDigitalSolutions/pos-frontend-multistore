"use client";

import { useFormContext } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/forms/form-textarea";
import { IconBuildingStore } from "@tabler/icons-react";
import { toast } from "sonner";
import {
    type SupplierInput,
} from "../schemas/supplier-schema";
import { useCreateSupplier, useUpdateSupplier } from "../api/suppliers-api";
import type { Supplier } from "../types";

interface SupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingSupplier?: Supplier | null;
}

export function SupplierDialog({
    open,
    onOpenChange,
    editingSupplier = null,
}: SupplierDialogProps) {
    const createSupplier = useCreateSupplier();
    const updateSupplier = useUpdateSupplier();
    const isEdit = !!editingSupplier;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useFormContext<SupplierInput>();

    const isPending = createSupplier.isPending || updateSupplier.isPending;

    const onSubmit = (data: SupplierInput) => {
        if (isEdit && editingSupplier) {
            updateSupplier.mutate(
                { uid: editingSupplier.uid, data },
                {
                    onSuccess: () => {
                        toast.success("Supplier berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui supplier.");
                    },
                },
            );
        } else {
            createSupplier.mutate(data, {
                onSuccess: () => {
                    toast.success("Supplier berhasil didaftarkan.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mendaftarkan supplier.");
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
                    <IconBuildingStore
                        size={20}
                        className="text-emerald-500"
                    />
                    <span>
                        {isEdit ? "Ubah Data Supplier" : "Tambah Supplier Baru"}
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
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Nama Supplier *
                    </label>
                    <Input
                        type="text"
                        placeholder="PT. Distributor Sembako..."
                        className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                        disabled={isPending}
                        {...register("nama")}
                    />
                    {errors.nama && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.nama.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* No Telepon */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            No. Telepon / HP
                        </label>
                        <Input
                            type="text"
                            placeholder="0812XXXXXXXX..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("nomor_telepon")}
                        />
                        {errors.nomor_telepon && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.nomor_telepon.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Email
                        </label>
                        <Input
                            type="text"
                            placeholder="supplier@mail.com..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Alamat */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Alamat Kantor / Gudang
                    </label>
                    <FormTextarea
                        name="alamat"
                        placeholder="Alamat lengkap distributor..."
                        className="text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl min-h-16"
                        disabled={isPending}
                    />
                    {errors.alamat && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.alamat.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    disabled={isPending}
                >
                    {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Daftarkan Supplier"}
                </Button>
            </form>
        </BaseDialog>
    );
}
