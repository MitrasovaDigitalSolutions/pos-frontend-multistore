"use client";

import React from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { CoaPickerTrigger } from "@/features/accounting/components/shared";
import {
    IconReceipt2,
    IconBuildingBank,
    IconCoin,
    IconAlertTriangle,
    IconInfoCircle,
    IconArrowUpRight,
    IconArrowDownLeft,
} from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CreateAssetSchemaInput } from "../../../schemas/asset-schema";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { CashAccount } from "@/features/cash/api/cash-api";

interface AssetFundingFieldsProps {
    form: UseFormReturn<CreateAssetSchemaInput>;
    cashOptions: CommandOption[];
    flatAccounts?: ChartOfAccount[];
    selectedCashAccount: CashAccount | null;
    selectedOffsetCoa: ChartOfAccount | null;
    categoryAssetCoa: ChartOfAccount | null;
    isCashInsufficient: boolean;
    isLoadingCash: boolean;
    isLoadingCoa: boolean;
    isPending: boolean;
    onCancel: () => void;
}

export function AssetFundingFields({
    form,
    cashOptions,
    flatAccounts = [],
    selectedCashAccount,
    categoryAssetCoa,
    isCashInsufficient,
    isLoadingCash,
    isLoadingCoa,
    isPending,
    onCancel,
}: AssetFundingFieldsProps) {
    const { control, setValue } = form;

    const watchedSumber = useWatch({
        control,
        name: "sumber_perolehan",
        defaultValue: "kas",
    });

    const watchedCashUid = useWatch({
        control,
        name: "cash_account_uid",
    });

    const watchedOffsetCoaUid = useWatch({
        control,
        name: "offset_coa_uid",
    });

    const watchedHarga = (useWatch({
        control,
        name: "harga_perolehan",
        defaultValue: 0,
    }) || 0) as number;

    return (
        <div className="space-y-3.5 flex flex-col justify-between h-full">
            <div className="space-y-3.5">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <IconReceipt2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Pembiayaan & Penjurnalan
                    </h4>
                </div>

                {/* Switcher Tab Sumber Dana */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Sumber Dana Perolehan <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setValue("sumber_perolehan", "kas")}
                            className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${watchedSumber === "kas"
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
                        >
                            <IconBuildingBank className="w-3.5 h-3.5" />
                            <span>Kas / Bank</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue("sumber_perolehan", "non_kas")}
                            className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${watchedSumber === "non_kas"
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
                        >
                            <IconCoin className="w-3.5 h-3.5" />
                            <span>Non-Kas (Modal/Utang)</span>
                        </button>
                    </div>
                </div>

                {/* Pilihan Kas / Bank */}
                {watchedSumber === "kas" && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Pilih Akun Kas / Bank <span className="text-rose-500">*</span>
                        </label>
                        <CommandSelect
                            options={cashOptions}
                            value={watchedCashUid || ""}
                            onChange={(val: string) => setValue("cash_account_uid", val || null)}
                            placeholder={isLoadingCash ? "Memuat kas/bank..." : "Pilih Akun Kas/Bank..."}
                            disabled={isPending || isLoadingCash}
                            className="h-8.5 text-xs rounded-xl"
                        />

                        {isCashInsufficient && (
                            <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-400">
                                <IconAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>
                                    Saldo kas tidak mencukupi untuk pembelian ini (Tersedia: {formatRupiah(Number(selectedCashAccount?.saldo) || 0)}).
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Pilihan Non-Kas (Offset CoA) */}
                {watchedSumber === "non_kas" && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Akun Penyeimbang CoA (Ekuitas / Utang) <span className="text-rose-500">*</span>
                        </label>
                        <CoaPickerTrigger
                            accounts={flatAccounts}
                            allowedTypes={["equity", "liability"]}
                            value={watchedOffsetCoaUid || ""}
                            onChange={(val: string) => setValue("offset_coa_uid", val || null)}
                            placeholder={isLoadingCoa ? "Memuat CoA..." : "Pilih Akun Ekuitas / Kewajiban..."}
                            dialogTitle="Pilih Akun Penyeimbang Non-Kas"
                            disabled={isPending || isLoadingCoa}
                            size="md"
                            allowClear
                        />
                        <p className="text-[10px] text-slate-500">
                            Pilih akun Modal Pemilik, Hutang Usaha, atau Hibah jika tidak dibayar tunai.
                        </p>
                    </div>
                )}

                {/* Live Journal Preview Slip */}
                <div className="p-3 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        <IconInfoCircle className="w-3.5 h-3.5" />
                        <span>Simulasi Jurnal Otomatis</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                        {/* Debit */}
                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="p-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                                    <IconArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                                <span className="text-slate-600 dark:text-slate-300 truncate">
                                    [D] {categoryAssetCoa ? `${categoryAssetCoa.nama}` : "Akun Aset Kategori"}
                                </span>
                            </div>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                +{formatRupiah(watchedHarga)}
                            </span>
                        </div>

                        {/* Kredit */}
                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="p-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 shrink-0">
                                    <IconArrowDownLeft className="w-3.5 h-3.5" />
                                </span>
                                <span className="text-slate-600 dark:text-slate-300 truncate">
                                    [K] {watchedSumber === "kas"
                                        ? (selectedCashAccount ? selectedCashAccount.nama : "Akun Kas/Bank")
                                        : "Akun Ekuitas / Utang Terpilih"}
                                </span>
                            </div>
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                                -{formatRupiah(watchedHarga)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                    className="h-9 px-3 text-xs rounded-xl border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isPending || isCashInsufficient}
                    className="h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                    {isPending ? "Menyimpan..." : "Catat Perolehan Aset"}
                </Button>
            </div>
        </div>
    );
}
