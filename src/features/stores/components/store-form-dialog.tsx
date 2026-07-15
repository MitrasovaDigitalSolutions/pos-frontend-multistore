"use client";

import { useEffect } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { storeSchema, type StoreInput } from "../schemas/store-schema";
import { useCreateStore, useUpdateStore } from "../api/stores-api";
import type { Store } from "../types";
import { ApiError } from "@/shared/errors/api-error";

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Toko" : "Tambah Toko"}</DialogTitle>
                </DialogHeader>

                <FormProvider {...formMethods}>
                    <form id="store-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormInput
                            label="Nama Toko"
                            {...register("nama")}
                            error={errors.nama?.message}
                            required
                        />

                        <FormInput
                            label="Alamat"
                            {...register("alamat")}
                            error={errors.alamat?.message}
                        />

                        <FormInput
                            label="Telepon"
                            {...register("telepon")}
                            error={errors.telepon?.message}
                        />

                        <FormSwitch
                            name="is_active"
                            label="Status"
                            description="Toko aktif dapat digunakan untuk transaksi"
                        />
                    </form>
                </FormProvider>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Batal
                    </Button>
                    <Button type="submit" form="store-form" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}