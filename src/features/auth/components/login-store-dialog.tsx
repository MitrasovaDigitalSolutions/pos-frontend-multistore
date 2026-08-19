"use client";

import { useMemo } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/forms/form-select";
import { IconBuildingStore } from "@tabler/icons-react";
import { useStores } from "@/features/stores/api/stores-api";
import { STORE_BADGE_HQ, STORE_LABEL_HQ, STORE_LABEL_BRANCH } from "@/constants/store";
import type { Store } from "@/types/auth";

interface LoginStoreDialogProps {
    open: boolean;
    stores: Store[];
    onConfirm: (data: { storeUid: string }) => void;
}

export function LoginStoreDialog({
    open,
    stores: initialStores,
    onConfirm,
}: LoginStoreDialogProps) {
    const { data: storesRes } = useStores({ per_page: 1000 });
    const apiStores = storesRes?.data;

    // Merge session stores with live API data so names/central status are always up-to-date
    const stores = useMemo(() => {
        if (apiStores && apiStores.length > 0) {
            if (initialStores && initialStores.length > 0) {
                return initialStores.map((sessStore) => {
                    const found = apiStores.find((apiS) => apiS.uid === sessStore.uid);
                    return found
                        ? { ...sessStore, nama: found.nama, is_central: found.is_central }
                        : sessStore;
                });
            }
            return apiStores;
        }
        return initialStores || [];
    }, [apiStores, initialStores]);

    const methods = useForm<{ storeUid: string }>({
        defaultValues: { storeUid: initialStores[0]?.uid ?? "" },
        values: { storeUid: initialStores[0]?.uid ?? "" },
    });

    const selectedStoreUid = useWatch({ control: methods.control, name: "storeUid" });
    const selectedStore = useMemo(
        () => stores.find((s) => s.uid === selectedStoreUid) || stores[0],
        [stores, selectedStoreUid]
    );

    const storeOptions = useMemo(() => {
        return stores.map((store) => ({
            value: store.uid,
            label: store.nama,
            description: store.is_central ? STORE_LABEL_HQ : STORE_LABEL_BRANCH,
        }));
    }, [stores]);

    const dialogTitle = (
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <IconBuildingStore size={18} stroke={2.5} />
            </div>
            <div>
                <span className="text-sm font-bold text-slate-800 block leading-tight">
                    Kerja Di Mana Hari Ini?
                </span>
                <span className="text-[10px] text-slate-400 font-normal block leading-tight">
                    Pilih toko aktif untuk sesi kerja Anda
                </span>
            </div>
        </div>
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={() => {}}
            showCloseButton={false}
            title={dialogTitle}
            className="sm:max-w-[400px]"
        >
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onConfirm)} className="space-y-4 pt-1">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Anda terdaftar di beberapa toko. Silakan pilih toko tempat Anda bekerja hari ini untuk melanjutkan.
                    </p>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Toko Tempat Bertugas <span className="text-rose-500">*</span>
                        </label>
                        <FormSelect<{ storeUid: string }>
                            name="storeUid"
                            options={storeOptions}
                            placeholder="Pilih toko..."
                            searchPlaceholder="Cari nama toko..."
                            size="md"
                            leftIcon={
                                <IconBuildingStore
                                    size={15}
                                    className={`shrink-0 ${
                                        selectedStore?.is_central ? "text-emerald-600" : "text-slate-500"
                                    }`}
                                />
                            }
                            rightElement={
                                selectedStore?.is_central ? (
                                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
                                        {STORE_BADGE_HQ}
                                    </span>
                                ) : selectedStore ? (
                                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200/80 leading-none">
                                        Cabang
                                    </span>
                                ) : null
                            }
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-9.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] transition-all mt-2"
                    >
                        Konfirmasi & Lanjutkan
                    </Button>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}


