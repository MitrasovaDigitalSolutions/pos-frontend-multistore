"use client";

import { type StoreSettingsInput } from "../schemas/settings-schema";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Coins, Vault, Landmark, Info, ArrowRightLeft } from "lucide-react";
import { FormSelect } from "@/components/forms/form-select";
import { Scrollable } from "@/components/ui/scrollable";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AppButton } from "@/components/shared/app-button";
import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

import { useSettingsStore } from "@/stores/settings-store";

interface TabCashProps {
    isSaving: boolean;
    cashAccountOptions: { value: string; label: string }[] | undefined;
}

export function TabCash({ isSaving, cashAccountOptions = [] }: TabCashProps) {
    const { control } = useFormContext<StoreSettingsInput>();
    const { getSettingMeta } = useSettingsStore();

    const registerMeta = getSettingMeta("cash_account_register_uid");
    const mainMeta = getSettingMeta("cash_account_main_uid");
    const bankMeta = getSettingMeta("cash_account_bank_uid");
    const cashInOutMeta = getSettingMeta("cash_in_out_enabled");

    return (
        <TooltipProvider delayDuration={150}>
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col w-full min-h-[460px]">
                {/* Header (pinned) */}
                <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                            <Wallet size={15} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Kas & Operasional Kasir</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Pemetaan akun kas default dan hak operasional sesi laci kasir</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <Scrollable className="flex-1 min-h-0 w-full">
                    <CardContent className="p-5 space-y-4">
                        <div className="space-y-4">
                            {/* Row 1: Kas Kasir */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30 gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100/50 dark:border-amber-900/50 mt-0.5">
                                        <Coins size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                                {registerMeta?.label || "Kas Kasir"}
                                            </h4>
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
                                                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                                                    {registerMeta?.description || "Akun kas yang dipakai untuk transaksi penjualan tunai dan split."}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-400 max-w-md">
                                            {registerMeta?.description || "Akun kas yang dipakai untuk transaksi penjualan tunai dan split."}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full md:w-64 shrink-0">
                                    <FormSelect<StoreSettingsInput>
                                        name="cash_account_register_uid"
                                        options={cashAccountOptions}
                                        placeholder="Pilih Akun Kasir"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            {/* Row 2: Kas Utama */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30 gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100/50 dark:border-emerald-900/50 mt-0.5">
                                        <Vault size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                                {mainMeta?.label || "Kas Utama"}
                                            </h4>
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
                                                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                                                    {mainMeta?.description || "Akun kas utama untuk penampungan saldo internal."}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-400 max-w-md">
                                            {mainMeta?.description || "Akun kas utama untuk penampungan saldo internal."}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full md:w-64 shrink-0">
                                    <FormSelect<StoreSettingsInput>
                                        name="cash_account_main_uid"
                                        options={cashAccountOptions}
                                        placeholder="Pilih Akun Utama"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            {/* Row 3: Kas Bank */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30 gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100/50 dark:border-blue-900/50 mt-0.5">
                                        <Landmark size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                                {bankMeta?.label || "Saldo Bank"}
                                            </h4>
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
                                                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                                                    {bankMeta?.description || "Akun bank untuk dana yang sudah dipindahkan dari kas fisik."}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-400 max-w-md">
                                            {bankMeta?.description || "Akun bank untuk dana yang sudah dipindahkan dari kas fisik."}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full md:w-64 shrink-0">
                                    <FormSelect<StoreSettingsInput>
                                        name="cash_account_bank_uid"
                                        options={cashAccountOptions}
                                        placeholder="Pilih Akun Bank"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            {/* Row 4: Cash In / Cash Out di Kasir Toggle */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30 gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 shrink-0 border border-violet-100/50 dark:border-violet-900/50 mt-0.5">
                                        <ArrowRightLeft size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                                {cashInOutMeta?.label || "Cash In / Cash Out di Kasir"}
                                            </h4>
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
                                                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                                                    {cashInOutMeta?.description || "Apakah kasir dapat mencatat cash in / cash out pada sesi laci kas (true/false)."}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-400 max-w-md">
                                            {cashInOutMeta?.description || "Izinkan kasir mencatat pengeluaran atau penambahan uang kas fisik selama sesi kasir berlangsung."}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-3">
                                    <Controller
                                        control={control}
                                        name="cash_in_out_enabled"
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
                        </div>
                    </CardContent>
                </Scrollable>
            </Card>
        </TooltipProvider>
    );
}
