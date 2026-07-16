"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { IconBuildingStore } from "@tabler/icons-react";
import type { Store } from "@/types/auth";

interface LoginStoreDialogProps {
    open: boolean;
    stores: Store[];
    onConfirm: (data: { storeUid: string }) => void;
}

export function LoginStoreDialog({
    open,
    stores,
    onConfirm,
}: LoginStoreDialogProps) {
    const storeFormMethods = useForm<{ storeUid: string }>({
        defaultValues: { storeUid: "" },
    });

    return (
        <BaseDialog
            open={open}
            onOpenChange={() => {}}
            showCloseButton={false}
            title={
                <>
                    <IconBuildingStore size={20} className="text-emerald-500" />
                    <span>Kerja dimana hari ini?</span>
                </>
            }
            className="max-w-[400px]"
        >
            <div className="space-y-4">
                <p className="text-xs text-slate-500">
                    Anda terdaftar di beberapa toko. Silakan pilih toko tempat Anda bekerja hari ini untuk melanjutkan.
                </p>
                <FormProvider {...storeFormMethods}>
                    <form onSubmit={storeFormMethods.handleSubmit(onConfirm)} className="space-y-4">
                        <FormSelect<{ storeUid: string }>
                            name="storeUid"
                            label="Toko"
                            options={stores.map((store) => ({
                                value: store.uid,
                                label: store.nama,
                            }))}
                            placeholder="Pilih toko..."
                        />
                        <Button
                            type="submit"
                            className="w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg shadow-emerald-600/15 hover:shadow-emerald-600/25 active:scale-[0.98] transition-all duration-300"
                        >
                            Konfirmasi
                        </Button>
                    </form>
                </FormProvider>
            </div>
        </BaseDialog>
    );
}
