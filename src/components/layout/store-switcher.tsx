"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { IconBuildingStore, IconChevronDown } from "@tabler/icons-react";
import { useActiveStoreStore } from "@/stores/active-store-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function StoreSwitcher() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { activeStoreUid, setActiveStore } = useActiveStoreStore();
    const [mounted, setMounted] = useState(false);

    const stores = session?.user?.stores ?? [];

    useEffect(() => {
        setMounted(true);
        if (stores.length > 0 && !activeStoreUid) {
            setActiveStore(session?.user?.store_uid ?? stores[0].uid);
        }
    }, [stores, activeStoreUid, setActiveStore, session?.user?.store_uid]);

    if (!mounted || stores.length <= 1) return null;

    const currentStore = stores.find((s) => s.uid === activeStoreUid) ?? stores[0];

    const handleSelectStore = (uid: string) => {
        if (uid !== activeStoreUid) {
            setActiveStore(uid);
            queryClient.invalidateQueries();
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors outline-none focus:ring-2 focus:ring-brand-500/20">
                <IconBuildingStore size={14} className="text-slate-500" />
                <span className="max-w-[120px] truncate">
                    {currentStore?.nama ?? "Pilih Toko"}
                </span>
                <IconChevronDown size={14} className="text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                {stores.map((store) => (
                    <DropdownMenuItem
                        key={store.uid}
                        onClick={() => handleSelectStore(store.uid)}
                        className={`text-sm ${
                            store.uid === activeStoreUid
                                ? "bg-brand-50 text-brand-700 font-medium"
                                : ""
                        }`}
                    >
                        {store.nama}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}