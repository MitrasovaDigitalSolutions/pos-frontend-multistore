"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
    ShieldCheck,
    Package,
    BarChart3,
    Truck,
    ShoppingCart,
    Info,
    Lock,
    Unlock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AppButton } from "@/components/shared/app-button";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils";
import { SettingsTabCard } from "./settings-tab-card";
import type { StoreSettingsInput } from "../schemas/settings-schema";

interface TabBranchPolicyProps {
    isSaving: boolean;
}

interface PolicyToggleConfig {
    key: keyof StoreSettingsInput;
    label: string;
    description: string;
}

interface PolicyGroup {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    policies: PolicyToggleConfig[];
}

const POLICY_GROUPS: PolicyGroup[] = [
    {
        title: "Katalog & Master Data",
        icon: Package,
        iconColor: "text-violet-600 dark:text-violet-400",
        iconBg: "bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/50",
        policies: [
            {
                key: "branch_can_create_product",
                label: "Pembuatan Produk Cabang",
                description: "Izinkan toko cabang membuat master produk baru mandiri.",
            },
            {
                key: "branch_can_edit_product_price",
                label: "Ubah Harga Jual Cabang",
                description: "Izinkan cabang mengubah harga jual produk lokal.",
            },
            {
                key: "branch_can_edit_master_data",
                label: "Ubah Data Master Produk",
                description: "Izinkan cabang mengubah nama, barcode, atau satuan produk.",
            },
        ],
    },
    {
        title: "Stok & Inventori",
        icon: BarChart3,
        iconColor: "text-sky-600 dark:text-sky-400",
        iconBg: "bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/50",
        policies: [
            {
                key: "branch_can_manual_stock_adjustment",
                label: "Penyesuaian Stok Manual",
                description: "Izinkan penyesuaian stok bebas tanpa sesi stok opname.",
            },
            {
                key: "branch_can_stock_opname",
                label: "Sesi Stok Opname Mandiri",
                description: "Izinkan cabang membuka dan menghitung sesi stok opname.",
            },
        ],
    },
    {
        title: "Pengadaan & Transfer",
        icon: Truck,
        iconColor: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50",
        policies: [
            {
                key: "branch_can_direct_purchase",
                label: "Pembelian Langsung Supplier Luar",
                description: "Izinkan cabang membuat PO langsung ke vendor eksternal.",
            },
            {
                key: "branch_can_transfer_to_other_branch",
                label: "Transfer Antar-Cabang Langsung",
                description: "Izinkan transfer stok langsung antar cabang tanpa via pusat.",
            },
        ],
    },
    {
        title: "Kasir & Checkout",
        icon: ShoppingCart,
        iconColor: "text-rose-600 dark:text-rose-400",
        iconBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50",
        policies: [
            {
                key: "branch_can_apply_manual_discount",
                label: "Diskon Manual Kasir",
                description: "Izinkan kasir cabang memberi diskon nominal/persen manual saat checkout.",
            },
        ],
    },
];

function PolicyToggleItem({
    policy,
    isSaving,
}: {
    policy: PolicyToggleConfig;
    isSaving: boolean;
}) {
    const { control, watch } = useFormContext<StoreSettingsInput>();
    const { getSettingMeta } = useSettingsStore();
    const meta = getSettingMeta(policy.key);
    const currentValue = watch(policy.key);
    const isEnabled = currentValue === "true";

    return (
        <div
            id={`form-settings-${policy.key}`}
            className={cn(
                "flex items-center justify-between gap-3.5 p-3 sm:p-3.5 rounded-xl border transition-all duration-150",
                isEnabled
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60"
                    : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 hover:border-slate-300"
            )}
        >
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div
                    className={cn(
                        "mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                        isEnabled
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                    )}
                >
                    {isEnabled ? <Unlock size={13} /> : <Lock size={13} />}
                </div>

                <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {meta?.label || policy.label}
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AppButton
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    className="p-0 border-none bg-transparent cursor-help text-slate-400 hover:text-slate-500 transition-colors flex items-center h-auto w-auto"
                                >
                                    <Info size={11} />
                                </AppButton>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800"
                            >
                                {meta?.description || policy.description}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {policy.description}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 pl-2">
                <span
                    className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                        isEnabled
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}
                >
                    {isEnabled ? "Aktif" : "Nonaktif"}
                </span>

                <Controller
                    control={control}
                    name={policy.key}
                    render={({ field }) => (
                        <Switch
                            checked={field.value === "true"}
                            onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                            disabled={isSaving}
                        />
                    )}
                />
            </div>
        </div>
    );
}

export function TabBranchPolicy({ isSaving }: TabBranchPolicyProps) {
    return (
        <TooltipProvider delayDuration={150}>
            <SettingsTabCard
                icon={ShieldCheck}
                title="Kebijakan Cabang"
                subtitle="Aturan kontrol wewenang operasional yang berlaku untuk semua outlet toko cabang"
                iconBgClassName="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50"
                badge={
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Pusat Only
                    </span>
                }
            >
                <div className="space-y-4">
                    {POLICY_GROUPS.map((group) => {
                        const GroupIcon = group.icon;
                        return (
                            <div key={group.title} className="space-y-2">
                                <div className="flex items-center gap-2 px-0.5">
                                    <div
                                        className={cn(
                                            "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border",
                                            group.iconBg,
                                            group.iconColor
                                        )}
                                    >
                                        <GroupIcon size={11} />
                                    </div>
                                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                        {group.title}
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    {group.policies.map((policy) => (
                                        <PolicyToggleItem
                                            key={policy.key}
                                            policy={policy}
                                            isSaving={isSaving}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SettingsTabCard>
        </TooltipProvider>
    );
}
