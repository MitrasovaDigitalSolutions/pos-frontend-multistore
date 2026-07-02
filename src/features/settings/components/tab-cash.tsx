"use client";

import { type StoreSettingsInput } from "../schemas/settings-schema";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Coins, Vault, Landmark, Info } from "lucide-react";
import { FormSelect } from "@/components/forms/form-select";
import { Scrollable } from "@/components/ui/scrollable";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface TabCashProps {
    isSaving: boolean;
    cashAccountOptions: { value: string; label: string }[] | undefined;
}

export function TabCash({ isSaving, cashAccountOptions = [] }: TabCashProps) {
    return (
        <TooltipProvider delayDuration={150}>
            <Card className="border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] bg-white overflow-hidden h-[500px] flex flex-col w-full">
                {/* Header (pinned) */}
                <div className="p-5 pb-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60 shadow-sm">
                            <Wallet size={15} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Pemetaan Kas Default</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Akun kas default untuk transaksi dan operasional</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <Scrollable className="flex-1 min-h-0 w-full">
                    <CardContent className="p-5 space-y-4">
                        <div className="space-y-4">
                            {/* Row 1: Kas Kasir */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/30 gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0 border border-amber-100/50 mt-0.5">
                                        <Coins size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Kas Kasir (Register)</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button type="button" className="p-0 border-none bg-transparent cursor-help text-slate-400 hover:text-slate-500 transition-colors flex items-center">
                                                        <Info size={11} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                                                    Akun kas penampung utama uang tunai hasil transaksi kasir harian.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-xs text-slate-400  max-w-md">
                                            Digunakan untuk menampung pendapatan uang tunai langsung dari meja kasir selama shift berjalan.
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
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/30 gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100/50 mt-0.5">
                                        <Vault size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Kas Utama (Brankas)</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button type="button" className="p-0 border-none bg-transparent cursor-help text-slate-400 hover:text-slate-500 transition-colors flex items-center">
                                                        <Info size={11} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                                                    Akun kas pusat untuk menampung pemindahan saldo kasir harian.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-xs text-slate-400  max-w-md">
                                            Brankas utama toko untuk menyimpan uang cash cadangan dan menerima setoran akhir dari kasir.
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
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/30 gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 border border-blue-100/50 mt-0.5">
                                        <Landmark size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Kas Bank (Transfer / QRIS)</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button type="button" className="p-0 border-none bg-transparent cursor-help text-slate-400 hover:text-slate-500 transition-colors flex items-center">
                                                        <Info size={11} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                                                    Akun bank penampung utama pembayaran non-tunai (Qris, debit, transfer).
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <p className="text-xs text-slate-400  max-w-md">
                                            Digunakan untuk pencatatan transaksi non-tunai seperti kartu debit/kredit, transfer bank, dan QRIS.
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
                        </div>
                    </CardContent>
                </Scrollable>
            </Card>
        </TooltipProvider>
    );
}
