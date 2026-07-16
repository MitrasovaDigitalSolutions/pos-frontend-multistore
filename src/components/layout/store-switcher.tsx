"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { IconBuildingStore } from "@tabler/icons-react";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";

export function StoreSwitcher() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { activeStoreUid, setActiveStore } = useActiveStoreStore();
    const [mounted, setMounted] = useState(false);

    const stores = useMemo(() => session?.user?.stores ?? [], [session?.user?.stores]);

    const activeStore = useMemo(
        () => stores.find((s) => s.uid === activeStoreUid),
        [stores, activeStoreUid]
    );

    const methods = useForm<{ activeStore: string }>({
        values: { activeStore: activeStoreUid ?? "" }
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (stores.length > 0 && !activeStoreUid) {
            setActiveStore(session?.user?.store_uid ?? stores[0].uid);
        }
    }, [stores, activeStoreUid, setActiveStore, session?.user?.store_uid]);

    if (!mounted || stores.length === 0) return null;

    const handleSelectStore = (uid: string) => {
        if (uid && uid !== activeStoreUid) {
            const newStore = stores.find((s) => s.uid === uid);
            if (newStore) {
                const toastId = toast.loading(`Sedang berpindah ke ${newStore.nama}...`);
                setActiveStore(uid);
                queryClient.invalidateQueries().then(() => {
                    toast.success(`Berhasil berpindah ke ${newStore.nama}`, {
                        id: toastId,
                    });
                });
            }
        }
    };

    return (
        <FormProvider {...methods}>
            <div className="w-[195px] sm:w-[225px]">
                <FormSelect<{ activeStore: string }>
                    name="activeStore"
                    options={stores.map((s) => ({
                        value: s.uid,
                        label: s.nama,
                        description: s.is_central ? "Toko Pusat" : "Toko Cabang",
                    }))}
                    onChange={handleSelectStore}
                    size="sm"
                    className="rounded-full h-9 px-2.5 border-slate-200 shadow-sm hover:border-slate-300 focus:ring-emerald-500/20 text-xs font-bold text-slate-700 bg-white"
                    leftIcon={
                        <IconBuildingStore
                            size={15}
                            className={`shrink-0 ${
                                activeStore?.is_central ? "text-emerald-600" : "text-slate-500"
                            }`}
                        />
                    }
                    rightElement={
                        activeStore?.is_central ? (
                            <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
                                Pusat
                            </span>
                        ) : (
                            <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200/80 leading-none">
                                Cabang
                            </span>
                        )
                    }
                />
            </div>
        </FormProvider>
    );
}