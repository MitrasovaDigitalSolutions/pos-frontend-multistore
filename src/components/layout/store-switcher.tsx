"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { IconBuildingStore } from "@tabler/icons-react";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useStores } from "@/features/stores/api/stores-api";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { STORE_BADGE_HQ, STORE_LABEL_HQ, STORE_LABEL_BRANCH } from "@/constants/store";

export function StoreSwitcher() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { activeStoreUid, setActiveStore } = useActiveStoreStore();
    const [mounted, setMounted] = useState(false);

    const { data: storesRes } = useStores({ per_page: 1000 });
    const sessionStores = useMemo(() => session?.user?.stores ?? [], [session?.user?.stores]);
    const apiStores = storesRes?.data;
    const settingsAppName = useSettingsStore((state) => state.settings?.app_name);

    // Merge session stores with live API data & current store settings app_name
    const stores = useMemo(() => {
        let list = sessionStores;
        if (apiStores && apiStores.length > 0) {
            if (sessionStores.length > 0) {
                list = sessionStores.map((sessStore) => {
                    const foundInApi = apiStores.find((apiS) => apiS.uid === sessStore.uid);
                    return foundInApi || sessStore;
                });
            } else {
                list = apiStores;
            }
        }

        return list.map((s) => {
            if (s.uid === activeStoreUid && settingsAppName && settingsAppName.trim() !== "") {
                return { ...s, nama: settingsAppName };
            }
            return s;
        });
    }, [apiStores, sessionStores, activeStoreUid, settingsAppName]);

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
                Promise.all([
                    queryClient.invalidateQueries({
                        predicate: (query) =>
                            !(
                                [
                                    queryKeys.stores.all[0],
                                    queryKeys.categories.all[0],
                                    queryKeys.brands.all[0],
                                ] as string[]
                            ).includes(query.queryKey[0] as string),
                    }),
                    useSettingsStore.getState().fetchSettings(),
                ]).then(() => {
                    toast.success(`Berhasil berpindah ke ${newStore.nama}`, {
                        id: toastId,
                    });
                });
            }
        }
    };

    return (
        <FormProvider {...methods}>
            <div className="w-[125px] xs:w-[155px] sm:w-[225px] shrink-0">
                <FormSelect<{ activeStore: string }>
                    name="activeStore"
                    options={stores.map((s) => ({
                        value: s.uid,
                        label: s.nama,
                        description: s.is_central ? STORE_LABEL_HQ : STORE_LABEL_BRANCH,
                    }))}
                    onChange={handleSelectStore}
                    size="sm"
                    className="rounded-full h-8 sm:h-9 px-2 sm:px-2.5 border-slate-200 shadow-sm hover:border-slate-300 focus:ring-emerald-500/20 text-[11px] sm:text-xs font-bold text-slate-700 bg-white min-w-0"
                    leftIcon={
                        <IconBuildingStore
                            size={14}
                            className={`shrink-0 ${
                                activeStore?.is_central ? "text-emerald-600" : "text-slate-500"
                            }`}
                        />
                    }
                    rightElement={
                        activeStore?.is_central ? (
                            <span className="hidden xs:inline-flex shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
                                {STORE_BADGE_HQ}
                            </span>
                        ) : (
                            <span className="hidden xs:inline-flex shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200/80 leading-none">
                                Cabang
                            </span>
                        )
                    }
                />
            </div>
        </FormProvider>
    );
}