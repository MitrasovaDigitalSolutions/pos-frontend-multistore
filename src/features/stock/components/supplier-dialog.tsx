"use client";

import { useEffect } from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/forms/form-textarea";
import { IconBuildingStore } from "@tabler/icons-react";
import { toast } from "sonner";
import {
    supplierSchema,
    type SupplierInput,
} from "../schemas/supplier-schema";
import { useCreateSupplier, useUpdateSupplier } from "../api/stock-api";
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

    const methods = useForm<SupplierInput>({
        resolver: zodResolver(supplierSchema) as Resolver<SupplierInput>,
        defaultValues: {
            nama: "",
            email: "",
            nomor_telepon: "",
            alamat: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    useEffect(() => {
        if (open) {
            if (editingSupplier) {
                reset({
                    nama: editingSupplier.nama,
                    email: editingSupplier.email || "",
                    nomor_telepon: editingSupplier.nomor_telepon || "",
                    alamat: editingSupplier.alamat || "",
                });
            } else {
                reset({
                    nama: "",
                    email: "",
                    nomor_telepon: "",
                    alamat: "",
                });
            }
        }
    }, [open, editingSupplier, reset]);

    const isPending = createSupplier.isPending || updateSupplier.isPending;

    const onSubmit = (data: SupplierInput) => {
        if (isEdit && editingSupplier) {
            updateSupplier.mutate(
                { id: editingSupplier.id, data },
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white rounded-2xl border-slate-100 p-6">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconBuildingStore
                            size={20}
                            className="text-indigo-500"
                        />
                        <span>
                            {isEdit ? "Ubah Data Supplier" : "Tambah Supplier Baru"}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 pt-4"
                    >
                        {/* Nama */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Nama Supplier *
                            </label>
                            <Input
                                type="text"
                                placeholder="PT. Distributor Sembako..."
                                className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
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
                                    className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
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
                                    className="h-10 text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl"
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
                                className="text-xs border-slate-200 focus-visible:ring-indigo-600 rounded-xl min-h-16"
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
                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                            disabled={isPending}
                        >
                            {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Daftarkan Supplier"}
                        </Button>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
