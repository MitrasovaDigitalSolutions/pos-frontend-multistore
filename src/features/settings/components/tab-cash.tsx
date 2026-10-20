"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Wallet, Coins, Vault, Landmark, Info, ArrowRightLeft } from "lucide-react";
import { FormSelect } from "@/components/forms/form-select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AppButton } from "@/components/shared/app-button";
import { useSettingsStore } from "@/stores/settings-store";
import { SettingsTabCard } from "./settings-tab-card";
import type { StoreSettingsInput } from "../schemas/settings-schema";

interface TabCashProps {
    isSaving: boolean;
    cashAccountOptions: { value: string; label: string }[] | undefined;
}

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5 select-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
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
                        <Info size={11} />
                    </AppButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
    );
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
            <SettingsTabCard
                icon={Wallet}
                title="Kas & Operasional Kasir"
                subtitle="Pemetaan akun buku kas default dan hak operasional sesi laci kasir toko aktif"
                iconBgClassName="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
            >
                <div className="space-y-3">
                    {/* Row 1: Kas Kasir */}
                    <div
                        id="form-settings-cash-register"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 gap-3"
                    >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100/60 dark:border-amber-900/50">
                                <Coins size={15} />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <LabelWithTooltip
                                    label={registerMeta?.label || "Akun Kas Kasir (Drawer)"}
                                    tooltip={registerMeta?.description || "Akun penampung uang tunai fisik yang ada di laci kasir."}
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                    Digunakan otomatis untuk transaksi tunai kasir POS dan saldo modal awal sesi.
                                </p>
                            </div>
                        </div>
                        <div className="w-full sm:w-64 shrink-0">
                            <FormSelect<StoreSettingsInput>
                                name="cash_account_register_uid"
                                options={cashAccountOptions}
                                placeholder="Pilih Akun Kas Kasir"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Row 2: Kas Utama */}
                    <div
                        id="form-settings-cash-main"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 gap-3"
                    >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100/60 dark:border-emerald-900/50">
                                <Vault size={15} />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <LabelWithTooltip
                                    label={mainMeta?.label || "Akun Kas Utama / Brankas"}
                                    tooltip={mainMeta?.description || "Akun brankas toko untuk penampungan hasil setoran tutup kasir."}
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                    Tujuan transfer uang saat penutupan sesi kasir atau penyerahan modal kerja.
                                </p>
                            </div>
                        </div>
                        <div className="w-full sm:w-64 shrink-0">
                            <FormSelect<StoreSettingsInput>
                                name="cash_account_main_uid"
                                options={cashAccountOptions}
                                placeholder="Pilih Akun Kas Utama"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Row 3: Kas Bank */}
                    <div
                        id="form-settings-cash-bank"
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 gap-3"
                    >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100/60 dark:border-blue-900/50">
                                <Landmark size={15} />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <LabelWithTooltip
                                    label={bankMeta?.label || "Akun Rekening Bank"}
                                    tooltip={bankMeta?.description || "Akun rekening perbankan untuk transaksi non-tunai (transfer/QRIS)."}
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                    Penerimaan pembayaran digital non-tunai dan setoran hasil penjualan ke bank.
                                </p>
                            </div>
                        </div>
                        <div className="w-full sm:w-64 shrink-0">
                            <FormSelect<StoreSettingsInput>
                                name="cash_account_bank_uid"
                                options={cashAccountOptions}
                                placeholder="Pilih Rekening Bank"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Row 4: Cash In / Out Switch */}
                    <div
                        id="form-settings-cash-inout-toggle"
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 gap-3"
                    >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shrink-0 border border-purple-100/60 dark:border-purple-900/50">
                                <ArrowRightLeft size={15} />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <LabelWithTooltip
                                    label={cashInOutMeta?.label || "Fitur Cash In / Cash Out di Kasir"}
                                    tooltip={cashInOutMeta?.description || "Izinkan kasir mencatat pengeluaran kecil (biaya) atau penambahan uang laci kas."}
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                    Bila aktif, kasir dapat memasukkan uang receh atau mengeluarkan biaya operasional kecil.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0">
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
            </SettingsTabCard>
        </TooltipProvider>
    );
}
