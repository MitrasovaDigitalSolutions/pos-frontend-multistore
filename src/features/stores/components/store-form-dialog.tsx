"use client";

import { useEffect, useState, useRef } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
    const [showConfirmCentral, setShowConfirmCentral] = useState(false);
    const hasConfirmedRef = useRef(false);
    const isInitialized = useRef(false);

    const formMethods = useForm<StoreInput>({
        resolver: zodResolver(storeSchema) as Resolver<StoreInput>,
        defaultValues: {
            nama: "",
            alamat: "",
            telepon: "",
            is_active: true,
            is_central: false,
        },
    });

    const {
        handleSubmit,
        reset,
        setError,
        setValue,
        control,
    } = formMethods;

    const isCentral = useWatch({ control, name: "is_central" });

    const createMutation = useCreateStore();
    const updateMutation = useUpdateStore();

    useEffect(() => {
        if (open) {
            isInitialized.current = false;
            if (editingStore) {
                reset({
                    nama: editingStore.nama,
                    alamat: editingStore.alamat ?? "",
                    telepon: editingStore.telepon ?? "",
                    is_active: editingStore.is_active,
                    is_central: editingStore.is_central ?? false,
                });
            } else {
                reset({
                    nama: "",
                    alamat: "",
                    telepon: "",
                    is_active: true,
                    is_central: false,
                });
            }
            setTimeout(() => {
                isInitialized.current = true;
            }, 0);
        }
    }, [open, editingStore, reset]);

    useEffect(() => {
        if (isCentral && isInitialized.current) {
            hasConfirmedRef.current = false;
            setShowConfirmCentral(true);
        }
    }, [isCentral]);

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
        <>
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
                        <FormInput<StoreInput>
                            name="nama"
                            label="Nama Toko"
                            placeholder="Nama cabang toko..."
                            disabled={isPending}
                            required
                        />

                        {/* Alamat */}
                        <FormInput<StoreInput>
                            name="alamat"
                            label="Alamat"
                            placeholder="Alamat lengkap cabang..."
                            disabled={isPending}
                        />

                        {/* Telepon */}
                        <FormInput<StoreInput>
                            name="telepon"
                            label="Telepon"
                            placeholder="Nomor kontak cabang..."
                            disabled={isPending}
                        />

                        {/* Status */}
                        <FormSelect<StoreInput>
                            name="is_active"
                            label="Status"
                            options={[
                                { value: "true", label: "Aktif" },
                                { value: "false", label: "Nonaktif" },
                            ]}
                            disabled={isPending}
                        />

                        {/* Toko Pusat Switch */}
                        <FormSwitch<StoreInput>
                            name="is_central"
                            label="Toko Pusat"
                            description="Jadikan toko ini sebagai cabang pusat operasional."
                            disabled={isPending}
                        />

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

            <ConfirmDialog
                open={showConfirmCentral}
                onOpenChange={(open) => {
                    setShowConfirmCentral(open);
                    if (!open && !hasConfirmedRef.current) {
                        setValue("is_central", false);
                    }
                }}
                title="Konfirmasi Toko Pusat"
                description={
                    <div className="space-y-2 text-slate-600 dark:text-slate-400">
                        <p>Toko yang dibuat akan menjadi toko pusat dan toko pusat yang sebelumnya akan berpindah ke toko yang baru dibuat ini.</p>
                        <p className="font-semibold text-amber-600 dark:text-amber-500">Apakah Anda yakin ingin melanjutkan?</p>
                    </div>
                }
                confirmText="Ya, Lanjutkan"
                cancelText="Batal"
                onConfirm={() => {
                    hasConfirmedRef.current = true;
                    setShowConfirmCentral(false);
                }}
            />
        </>
    );
}