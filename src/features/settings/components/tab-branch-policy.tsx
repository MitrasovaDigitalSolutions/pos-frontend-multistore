"use client";

import { type StoreSettingsInput } from "../schemas/settings-schema";
import { Card, CardContent } from "@/components/ui/card";
import { Scrollable } from "@/components/ui/scrollable";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { AppButton } from "@/components/shared/app-button";
import { useSettingsStore } from "@/stores/settings-store";
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

interface TabBranchPolicyProps {
    isSaving: boolean;
}

/** Metadata for each policy toggle */
interface PolicyToggleConfig {
    key: keyof StoreSettingsInput;
    label: string;
    description: string;
    iconColor: string;
}

/** Policy group definition */
interface PolicyGroup {
    title: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    policies: PolicyToggleConfig[];
}

/** All 8 branch policies organized into 4 groups matching backend settings */
const POLICY_GROUPS: PolicyGroup[] = [
    {
        title: "Katalog & Master Data",
        icon: Package,
        iconBg: "bg-violet-50 dark:bg-violet-950/40",
        iconColor: "text-violet-600 dark:text-violet-400",
        borderColor: "border-violet-100 dark:border-violet-900/50",
        policies: [
            {
                key: "branch_can_create_product",
                label: "Pembuatan Barang di Toko Cabang",
                description: "Apakah toko cabang diizinkan membuat master produk baru. Toko pusat selalu diizinkan.",
                iconColor: "text-violet-500",
            },
            {
                key: "branch_can_edit_product_price",
                label: "Ubah Harga Jual di Cabang",
                description: "Apakah cabang diizinkan mengubah harga jual produk. Jika nonaktif, harga paten dari pusat.",
                iconColor: "text-violet-500",
            },
            {
                key: "branch_can_edit_master_data",
                label: "Ubah Data Master di Cabang",
                description: "Apakah cabang diizinkan mengubah nama, barcode, satuan, atau kategori produk.",
                iconColor: "text-violet-500",
            },
        ],
    },
    {
        title: "Stok & Inventori",
        icon: BarChart3,
        iconBg: "bg-sky-50 dark:bg-sky-950/40",
        iconColor: "text-sky-600 dark:text-sky-400",
        borderColor: "border-sky-100 dark:border-sky-900/50",
        policies: [
            {
                key: "branch_can_manual_stock_adjustment",
                label: "Penyesuaian Stok Manual di Cabang",
                description: "Apakah cabang diizinkan melakukan penyesuaian stok manual bebas tanpa sesi opname.",
                iconColor: "text-sky-500",
            },
            {
                key: "branch_can_stock_opname",
                label: "Stok Opname Mandiri di Cabang",
                description: "Apakah cabang diizinkan membuka sesi stok opname mandiri.",
                iconColor: "text-sky-500",
            },
        ],
    },
    {
        title: "Pengadaan & Transfer",
        icon: Truck,
        iconBg: "bg-amber-50 dark:bg-amber-950/40",
        iconColor: "text-amber-600 dark:text-amber-400",
        borderColor: "border-amber-100 dark:border-amber-900/50",
        policies: [
            {
                key: "branch_can_direct_purchase",
                label: "Pembelian Langsung ke Supplier Luar",
                description: "Apakah cabang diizinkan membuat PO atau penerimaan barang langsung dari supplier luar.",
                iconColor: "text-amber-500",
            },
            {
                key: "branch_can_transfer_to_other_branch",
                label: "Transfer Antar-Cabang Langsung",
                description: "Apakah cabang diizinkan mentransfer stok langsung ke cabang lain tanpa via pusat.",
                iconColor: "text-amber-500",
            },
        ],
    },
    {
        title: "Kasir & Checkout",
        icon: ShoppingCart,
        iconBg: "bg-rose-50 dark:bg-rose-950/40",
        iconColor: "text-rose-600 dark:text-rose-400",
        borderColor: "border-rose-100 dark:border-rose-900/50",
        policies: [
            {
                key: "branch_can_apply_manual_discount",
                label: "Diskon Manual Kasir di Cabang",
                description: "Apakah kasir cabang diizinkan memberikan diskon manual saat transaksi checkout.",
                iconColor: "text-rose-500",
            },
        ],
    },
];

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5 select-none">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {label}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AppButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="p-0 border-none bg-transparent cursor-help text-slate-400 hover:text-slate-500 transition-colors flex items-center h-auto w-auto"
                    >
                        <Info size={12} />
                    </AppButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

function PolicyToggleItem({ policy, isSaving }: { policy: PolicyToggleConfig; isSaving: boolean }) {
    const { control, watch } = useFormContext<StoreSettingsInput>();
    const { getSettingMeta } = useSettingsStore();
    const meta = getSettingMeta(policy.key);
    const currentValue = watch(policy.key);
    const isEnabled = currentValue === "true";

    return (
        <div
            id={`form-settings-${policy.key}`}
            className="flex items-center justify-between gap-4 border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900/60 transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-700"
        >
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`mt-0.5 shrink-0 ${isEnabled ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} transition-colors duration-200`}>
                    {isEnabled ? <Unlock size={16} /> : <Lock size={16} />}
                </div>
                <div className="space-y-0.5 min-w-0">
                    <LabelWithTooltip
                        label={meta?.label || policy.label}
                        tooltip={meta?.description || policy.description}
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-snug">
                        {policy.description}
                    </p>
                </div>
            </div>
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
    );
}

export function TabBranchPolicy({ isSaving }: TabBranchPolicyProps) {
    return (
        <TooltipProvider delayDuration={150}>
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col w-full min-h-[460px]">
                {/* Header (pinned) */}
                <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                            <ShieldCheck size={15} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Kebijakan Cabang</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Aturan wewenang operasional yang berlaku untuk semua toko cabang</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <Scrollable className="flex-1 min-h-0 w-full">
                    <CardContent className="p-5 space-y-6">
                        {/* Policy Groups */}
                        {POLICY_GROUPS.map((group) => {
                            const GroupIcon = group.icon;
                            return (
                                <div key={group.title} className="space-y-3">
                                    {/* Group Header */}
                                    <div className="flex items-center gap-2.5 px-1">
                                        <div className={`w-7 h-7 rounded-lg ${group.iconBg} ${group.iconColor} flex items-center justify-center border ${group.borderColor} shadow-sm`}>
                                            <GroupIcon size={13} />
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                            {group.title}
                                        </h4>
                                    </div>

                                    {/* Policy Toggles */}
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
                    </CardContent>
                </Scrollable>
            </Card>
        </TooltipProvider>
    );
}
