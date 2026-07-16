"use client";

import { useEffect, useState } from "react";
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const stores = session?.user?.stores ?? [];

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
            <div className="relative flex items-center bg-white border border-slate-200 rounded-full pl-3 pr-1 py-0.5 shadow-sm hover:border-slate-300 transition-all gap-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 w-[180px] sm:w-[200px] h-9">
                <IconBuildingStore size={14} className="text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <FormSelect<{ activeStore: string }>
                        name="activeStore"
                        options={stores.map((s) => ({
                            value: s.uid,
                            label: s.nama,
                        }))}
                        onChange={handleSelectStore}
                        size="sm"
                        className="border-none bg-transparent hover:bg-transparent focus:ring-0 focus:border-none p-0 h-7 text-xs font-semibold text-slate-700 w-full shadow-none"
                    />
                </div>
            </div>
        </FormProvider>
    );
}