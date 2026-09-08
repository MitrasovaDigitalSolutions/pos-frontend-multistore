"use client";

import React from "react";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { NumberInput } from "@/components/ui/number-input";
import {
    IconReceipt2,
    IconBuildingBank,
    IconHistory,
    IconAlertTriangle,
    IconInfoCircle,
    IconArrowUpRight,
    IconArrowDownLeft,
    IconCheck,
    IconCoins,
} from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CreateAssetSchemaInput } from "../../../schemas/asset-schema";
import type { AssetCategoryQuota } from "../../../types";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { CashAccount } from "@/features/cash/api/cash-api";

interface AssetFundingFieldsProps {
    form: UseFormReturn<CreateAssetSchemaInput>;
    cashOptions: CommandOption[];
    flatAccounts?: ChartOfAccount[];
    selectedCashAccount: CashAccount | null;
    selectedOffsetCoa: ChartOfAccount | null;
    categoryAssetCoa: ChartOfAccount | null;
    categoryAkumulasiCoa?: ChartOfAccount | null;
    categoryQuota?: AssetCategoryQuota;
    isCashInsufficient: boolean;
    isHargaExceedingQuota?: boolean;
    isAkumulasiExceedingQuota?: boolean;
    isAkumulasiExceedingHarga?: boolean;
    maxAllowedSusutAwal?: number;
    estimatedNilaiBukuAwal?: number;
    isLoadingCash: boolean;
    isLoadingCoa: boolean;
    isPending: boolean;
    onCancel: () => void;
}

export function AssetFundingFields({
    form,
    cashOptions,
    selectedCashAccount,
    categoryAssetCoa,
    categoryAkumulasiCoa,
    categoryQuota,
    isCashInsufficient,
    isHargaExceedingQuota = false,
    isAkumulasiExceedingQuota = false,
    isAkumulasiExceedingHarga = false,
    maxAllowedSusutAwal = 0,
    estimatedNilaiBukuAwal = 0,
    isLoadingCash,
    isPending,
    onCancel,
}: AssetFundingFieldsProps) {
    const {
        control,
        setValue,
        formState: { errors },
    } = form;

    const watchedSumber = useWatch({
        control,
        name: "sumber_perolehan",
        defaultValue: "kas",
    });

    const watchedCashUid = useWatch({
        control,
        name: "cash_account_uid",
    });

    const watchedHarga = (useWatch({
        control,
        name: "harga_perolehan",
        defaultValue: 0,
    }) || 0) as number;

    const watchedNilaiResidu = (useWatch({
        control,
        name: "nilai_residu",
        defaultValue: 0,
    }) || 0) as number;

    const watchedAkumulasiAwal = (useWatch({
        control,
        name: "akumulasi_penyusutan_awal",
        defaultValue: 0,
    }) || 0) as number;

    const isExisting = watchedSumber === "existing";

    return (
        <div className="space-y-2.5 flex flex-col justify-between h-full">
            <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <IconReceipt2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {isExisting ? "Metode Jurnal Lama" : "Pembiayaan & Penjurnalan"}
                    </h4>
                </div>

                {/* Switcher Tab: Kas vs Existing (Compact) */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Metode Perolehan <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 p-0.5 bg-slate-100 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => {
                                setValue("sumber_perolehan", "kas");
                            }}
                            className={`h-7.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${watchedSumber === "kas"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
                        >
                            <IconBuildingBank className="w-3.5 h-3.5" />
                            <span>Kas / Bank</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setValue("sumber_perolehan", "existing");
                                setValue("cash_account_uid", null);
                                setValue("offset_coa_uid", null);
                            }}
                            className={`h-7.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${watchedSumber === "existing"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
                        >
                            <IconHistory className="w-3.5 h-3.5" />
                            <span>Jurnal Lama</span>
                        </button>
                    </div>
                </div>

                {/* ─── Mode 1: Pembelian Baru dari Kas / Bank ─── */}
                {watchedSumber === "kas" && (
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                Pilih Akun Kas / Bank <span className="text-rose-500">*</span>
                            </label>
                            <CommandSelect
                                options={cashOptions}
                                value={watchedCashUid || ""}
                                onChange={(val: string) => setValue("cash_account_uid", val || null)}
                                placeholder={isLoadingCash ? "Memuat kas..." : "Pilih Kas/Bank..."}
                                disabled={isPending || isLoadingCash}
                                className="h-8 text-xs rounded-lg"
                            />

                            {isCashInsufficient && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 text-[10px] text-amber-700 dark:text-amber-400">
                                    <IconAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                        Saldo kas kurang (Tersedia: {formatRupiah(Number(selectedCashAccount?.saldo) || 0)}).
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Compact Journal Preview Slip */}
                        <div className="p-2 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                <IconInfoCircle className="w-3 h-3" />
                                <span>Simulasi Jurnal Otomatis</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                                <div className="flex items-center justify-between gap-1 p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                    <div className="flex items-center gap-1 min-w-0">
                                        <span className="p-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                                            <IconArrowUpRight className="w-3 h-3" />
                                        </span>
                                        <span className="text-slate-600 dark:text-slate-300 truncate text-[10px]">
                                            [D] {categoryAssetCoa ? categoryAssetCoa.nama : "Aset"}
                                        </span>
                                    </div>
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] shrink-0">
                                        +{formatRupiah(watchedHarga)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-1 p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                    <div className="flex items-center gap-1 min-w-0">
                                        <span className="p-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 shrink-0">
                                            <IconArrowDownLeft className="w-3 h-3" />
                                        </span>
                                        <span className="text-slate-600 dark:text-slate-300 truncate text-[10px]">
                                            [K] {selectedCashAccount ? selectedCashAccount.nama : "Kas/Bank"}
                                        </span>
                                    </div>
                                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px] shrink-0">
                                        -{formatRupiah(watchedHarga)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Mode 2: Mapping Aset Saldo Awal / Jurnal Lama (Existing) ─── */}
                {watchedSumber === "existing" && (
                    <div className="space-y-2">
                        {/* Compact Quota Bar */}
                        {categoryQuota && (
                            <div className="p-2 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/70 dark:border-violet-900/40 space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1">
                                        <IconCoins className="w-3 h-3 text-violet-600" />
                                        Sisa Kuota Saldo Buku Besar
                                    </span>
                                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                                        Tersedia
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div className="px-2 py-1 rounded-md bg-white/80 dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 truncate mr-1">Akun Aset</span>
                                        <span className={`font-mono font-bold text-[11px] shrink-0 ${isHargaExceedingQuota ? "text-rose-600" : "text-slate-800 dark:text-slate-200"}`}>
                                            {formatRupiah(categoryQuota.harga_perolehan_tersedia)}
                                        </span>
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-white/80 dark:bg-slate-900/80 border border-violet-100 dark:border-violet-900/40 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 truncate mr-1">Akum. Susut</span>
                                        <span className={`font-mono font-bold text-[11px] shrink-0 ${isAkumulasiExceedingQuota ? "text-rose-600" : "text-slate-800 dark:text-slate-200"}`}>
                                            {formatRupiah(categoryQuota.akumulasi_penyusutan_tersedia)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Input Akumulasi Penyusutan Awal */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                    Akumulasi Penyusutan Awal (Rp)
                                </label>
                                <span className="text-[10px] text-slate-400">Saldo Awal</span>
                            </div>
                            <Controller
                                control={control}
                                name="akumulasi_penyusutan_awal"
                                render={({ field }) => (
                                    <NumberInput
                                        value={field.value || 0}
                                        onChange={field.onChange}
                                        disabled={isPending}
                                        placeholder="Rp 0"
                                        min={0}
                                        className={`h-8 text-xs font-semibold rounded-lg ${isAkumulasiExceedingHarga || errors.akumulasi_penyusutan_awal
                                            ? "border-rose-500 text-rose-600 focus:ring-rose-500"
                                            : ""
                                            }`}
                                    />
                                )}
                            />
                            {(isAkumulasiExceedingHarga || errors.akumulasi_penyusutan_awal) && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {isAkumulasiExceedingHarga
                                        ? `Maksimal susut: ${formatRupiah(maxAllowedSusutAwal)}`
                                        : errors.akumulasi_penyusutan_awal?.message}
                                </p>
                            )}
                        </div>

                        {/* Peringatan jika kuota buku besar terlampaui */}
                        {(isHargaExceedingQuota || isAkumulasiExceedingQuota) && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 text-[10px] text-rose-700 dark:text-rose-400">
                                <IconAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                    {isHargaExceedingQuota
                                        ? "Harga melebihi sisa saldo aset di buku besar."
                                        : "Akumulasi melebihi sisa kuota buku besar."}
                                </span>
                            </div>
                        )}

                        {/* Ringkasan Mapping Saldo Awal (Compact) */}
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-1 truncate mr-1">
                                    <IconInfoCircle className="w-3 h-3 text-indigo-500 shrink-0" />
                                    <span className="truncate">
                                        Ke Akun: <strong className="text-slate-800 dark:text-slate-200">{categoryAssetCoa ? `[${categoryAssetCoa.kode}]` : "Aset"}</strong>
                                        {categoryAkumulasiCoa && (
                                            <> & <strong className="text-slate-800 dark:text-slate-200">[{categoryAkumulasiCoa.kode}]</strong></>
                                        )}
                                    </span>
                                </div>
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                    Tanpa potong kas & jurnal
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-[10px]">
                                <div>
                                    <span className="text-[9px] text-slate-400 block">Akum. Awal:</span>
                                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                        {formatRupiah(watchedAkumulasiAwal)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-400 block">Nilai Buku Awal:</span>
                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                                        {formatRupiah(Math.max(0, estimatedNilaiBukuAwal))}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-slate-400 block">Status Awal:</span>
                                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded inline-block ${estimatedNilaiBukuAwal <= watchedNilaiResidu
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                        }`}>
                                        {estimatedNilaiBukuAwal <= watchedNilaiResidu ? "Habis Susut" : "Aktif"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Submit Action */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                    className="h-8 px-3 text-xs rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={
                        isPending ||
                        (watchedSumber === "kas" && isCashInsufficient) ||
                        (watchedSumber === "existing" && (isHargaExceedingQuota || isAkumulasiExceedingQuota || isAkumulasiExceedingHarga))
                    }
                    className="h-8 px-3.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>
                        {isPending
                            ? "Menyimpan..."
                            : isExisting
                                ? "Simpan Saldo Awal"
                                : "Catat Perolehan"}
                    </span>
                </Button>
            </div>
        </div>
    );
}
