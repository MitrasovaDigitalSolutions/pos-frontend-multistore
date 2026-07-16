"use client";

import { useEffect } from "react";
import { FormProvider, useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommandSelect } from "@/components/ui/command-select";
import { storeSchema, type StoreInput } from "../schemas/store-schema";
import { useCreateStore, useUpdateStore } from "../api/stores-api";
import type { Store } from "../types";
import { ApiError } from "@/shared/errors/api-error";
import { IconPlus, IconEdit } from "@tabler/icons-react";

interface StoreFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingStore: Store | null;
}

export function StoreFormDialog({ open, onOpenChange, editingStore }: StoreFormDialogProps) {
    const isEdit = !!editingStore;

    const formMethods = useForm<StoreInput>({
        resolver: zodResolver(storeSchema) as Resolver<StoreInput>,
        defaultValues: {
            nama: "",
            alamat: "",
            telepon: "",
            is_active: true,
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = formMethods;

    const createMutation = useCreateStore();
    const updateMutation = useUpdateStore();

    useEffect(() => {
        if (open) {
            if (editingStore) {
                reset({
                    nama: editingStore.nama,
                    alamat: editingStore.alamat ?? "",
                    telepon: editingStore.telepon ?? "",
                    is_active: editingStore.is_active,
                });
            } else {
                reset({
                    nama: "",
                    alamat: "",
                    telepon: "",
                    is_active: true,
                });
            }
        }
    }, [open, editingStore, reset]);

    const onSubmit = (data: StoreInput) => {
        const action = isEdit
            ? updateMutation.mutateAsync({ uid: editingStore.uid, data })
            : createMutation.mutateAsync(data);

        action
            .then(() => {
                toast.success(isEdit ? "Toko berhasil diperbarui" : "Toko berhasil ditambahkan");
                onOpenChange(false);
            })
            .catch((error) => {
                if (error instanceof ApiError && error.errors) {
                    Object.entries(error.errors).forEach(([field, messages]) => {
                        setError(field as keyof StoreInput, {
                            type: "server",
                            message: messages[0],
                        });
                    });
                } else {
                    toast.error(error.message || "Terjadi kesalahan");
                }
            });
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    {isEdit ? (
                        <IconEdit size={20} className="text-emerald-500" />
                    ) : (
                        <IconPlus size={20} className="text-emerald-500" />
                    )}
                    <span>{isEdit ? "Ubah Informasi Toko" : "Tambah Cabang Toko Baru"}</span>
                </div>
            }
            className="max-w-[425px]"
        >
            <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nama Toko */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Nama Toko <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="Nama cabang toko..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("nama")}
                        />
                        {errors.nama && (
                            <p className="text-[10px] text-rose-500 font-medium mt-1">
                                {errors.nama.message}
                            </p>
                        )}
                    </div>

                    {/* Alamat */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Alamat
                        </label>
                        <Input
                            type="text"
                            placeholder="Alamat lengkap cabang..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("alamat")}
                        />
                        {errors.alamat && (
                            <p className="text-[10px] text-rose-500 font-medium mt-1">
                                {errors.alamat.message}
                            </p>
                        )}
                    </div>

                    {/* Telepon */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Telepon
                        </label>
                        <Input
                            type="text"
                            placeholder="Nomor kontak cabang..."
                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isPending}
                            {...register("telepon")}
                        />
                        {errors.telepon && (
                            <p className="text-[10px] text-rose-500 font-medium mt-1">
                                {errors.telepon.message}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Status
                        </label>
                        <Controller
                            name="is_active"
                            control={formMethods.control}
                            render={({ field }) => (
                                <CommandSelect
                                    options={[
                                        { value: "true", label: "Aktif" },
                                        { value: "false", label: "Nonaktif" },
                                    ]}
                                    value={String(field.value)}
                                    onChange={(val) => field.onChange(val === "true")}
                                    disabled={isPending}
                                />
                            )}
                        />
                        {errors.is_active && (
                            <p className="text-[10px] text-rose-500 font-medium mt-1">
                                {errors.is_active.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                        disabled={isPending}
                    >
                        {isPending ? "Menyimpan..." : "Simpan Toko"}
                    </Button>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}