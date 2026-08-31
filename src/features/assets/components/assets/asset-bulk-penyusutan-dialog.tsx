"use client";

import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import {
    IconLayersLinked,
    IconCheck,
    IconFlame,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
    type BulkAssetPenyusutanSchemaInput,
} from "../../schemas/asset-penyusutan-schema";
import { useBulkAssetPenyusutan } from "../../api/assets-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Asset } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";

interface BulkRowState {
    selected: boolean;
    asset_uid: string;
    nominal: number;
    keterangan: string;
}

interface AssetBulkPenyusutanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeAssets: Asset[];
}

interface BulkPenyusutanFormContentProps {
    depreciableAssets: Asset[];
    onOpenChange: (open: boolean) => void;
}

function BulkPenyusutanFormContent({
    depreciableAssets,
    onOpenChange,
}: BulkPenyusutanFormContentProps) {
    const bulkMutation = useBulkAssetPenyusutan();

    // Initial rows computed directly on mount with zero useEffect setState
    const [rows, setRows] = useState<Record<string, BulkRowState>>(() => {
        const initialRows: Record<string, BulkRowState> = {};
        depreciableAssets.forEach((a) => {
            initialRows[a.uid] = {
                selected: true,
                asset_uid: a.uid,
                nominal: 0,
                keterangan: `Penyusutan multiple ${a.nama}`,
            };
        });
        return initialRows;
    });

    const {
        handleSubmit,
        control,
    } = useForm<{ tanggal: string }>({
        defaultValues: {
            tanggal: new Date().toISOString().split("T")[0],
        },
    });

    const handleToggleSelectAll = (checked: boolean) => {
        setRows((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((uid) => {
                next[uid] = { ...next[uid], selected: checked };
            });
            return next;
        });
    };

    const handleRowSelect = (uid: string, checked: boolean) => {
        setRows((prev) => ({
            ...prev,
            [uid]: { ...prev[uid], selected: checked },
        }));
    };

    const handleRowNominal = (uid: string, val: number) => {
        setRows((prev) => ({
            ...prev,
            [uid]: { ...prev[uid], nominal: val },
        }));
    };

    const handleRowKeterangan = (uid: string, text: string) => {
        setRows((prev) => ({
            ...prev,
            [uid]: { ...prev[uid], keterangan: text },
        }));
    };

    const handleAutoFillPercent = (pct: number) => {
        setRows((prev) => {
            const next = { ...prev };
            depreciableAssets.forEach((a) => {
                if (next[a.uid]?.selected) {
                    const maxSusut = Math.max(
                        0,
                        (Number(a.nilai_buku) || 0) - (Number(a.nilai_residu) || 0)
                    );
                    next[a.uid].nominal = Math.round((maxSusut * pct) / 100);
                }
            });
            return next;
        });
    };

    const selectedItems = useMemo(() => {
        return Object.values(rows).filter((r) => r.selected && r.nominal > 0);
    }, [rows]);

    const totalSelectedCount = useMemo(() => {
        return Object.values(rows).filter((r) => r.selected).length;
    }, [rows]);

    const totalNominalBulk = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + item.nominal, 0);
    }, [selectedItems]);

    const isAllSelected =
        depreciableAssets.length > 0 && totalSelectedCount === depreciableAssets.length;

    const isPending = bulkMutation.isPending;

    const onSubmit = (formValues: { tanggal: string }) => {
        if (selectedItems.length === 0) {
            toast.error("Pilih minimal 1 aset dengan nominal penyusutan lebih dari 0.");
            return;
        }

        const payload: BulkAssetPenyusutanSchemaInput = {
            tanggal: formValues.tanggal,
            items: selectedItems.map((item) => ({
                asset_uid: item.asset_uid,
                nominal: item.nominal,
                keterangan: item.keterangan || null,
            })),
        };

        bulkMutation.mutate(payload, {
            onSuccess: (res) => {
                const processed =
                    (res as unknown as { total_processed?: number })
                        ?.total_processed || selectedItems.length;
                toast.success(
                    `Berhasil mencatat penyusutan multiple untuk ${processed} aset.`
                );
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal mengeksekusi penyusutan multiple.");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
            {/* Top Toolbar: Date picker & quick auto-fill pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        Tgl Penyusutan:
                    </span>
                    <div className="w-40 sm:w-44">
                        <Controller
                            control={control}
                            name="tanggal"
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value}
                                    onChange={(val) => field.onChange(val)}
                                    placeholder="Pilih tgl..."
                                    disabled={isPending}
                                    size="sm"
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5 flex items-center gap-1">
                        <IconFlame className="w-3 h-3 text-amber-500" />
                        Alokasi Cepat:
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoFillPercent(100)}
                        className="h-6.5 px-2 text-[11px] font-bold rounded-lg border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 cursor-pointer"
                    >
                        100% Sisa
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoFillPercent(50)}
                        className="h-6.5 px-2 text-[11px] font-bold rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                        50%
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoFillPercent(25)}
                        className="h-6.5 px-2 text-[11px] font-bold rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                        25%
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoFillPercent(10)}
                        className="h-6.5 px-2 text-[11px] font-bold rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                        10%
                    </Button>
                </div>
            </div>

            {/* Scrollable Table of Assets */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto max-h-[50dvh]">
                <table className="w-full text-xs">
                    <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 backdrop-blur-xs">
                        <tr>
                            <th className="p-2 text-center w-10">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={(checked: boolean) =>
                                        handleToggleSelectAll(checked)
                                    }
                                />
                            </th>
                            <th className="p-2 text-left min-w-[180px]">Aset & Kategori</th>
                            <th className="p-2 text-right w-24">Nilai Buku</th>
                            <th className="p-2 text-right w-24">Maks Susut</th>
                            <th className="p-2 text-right w-36">Nominal Susut</th>
                            <th className="p-2 text-left min-w-[160px]">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {depreciableAssets.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-8 text-center text-slate-400 text-xs"
                                >
                                    Tidak ada aset aktif yang memiliki sisa nilai susut.
                                </td>
                            </tr>
                        ) : (
                            depreciableAssets.map((asset) => {
                                const rowState = rows[asset.uid] || {
                                    selected: false,
                                    nominal: 0,
                                    keterangan: "",
                                };
                                const maxSusut = Math.max(
                                    0,
                                    (Number(asset.nilai_buku) || 0) -
                                        (Number(asset.nilai_residu) || 0)
                                );

                                return (
                                    <tr
                                        key={asset.uid}
                                        className={`transition-colors ${
                                            rowState.selected
                                                ? "bg-indigo-50/30 dark:bg-indigo-950/20"
                                                : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                        }`}
                                    >
                                        <td className="p-2 text-center">
                                            <Checkbox
                                                checked={rowState.selected}
                                                onCheckedChange={(
                                                    checked: boolean
                                                ) =>
                                                    handleRowSelect(
                                                        asset.uid,
                                                        checked
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="p-2">
                                            <div
                                                className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px]"
                                                title={asset.nama}
                                            >
                                                {asset.nama}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                                                    {asset.nomor_aset}
                                                </span>
                                                <span>•</span>
                                                <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[100px]">
                                                    {asset.category?.nama || "-"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-2 text-right font-medium text-slate-600 dark:text-slate-300">
                                            {formatRupiah(
                                                Number(asset.nilai_buku) || 0
                                            )}
                                        </td>
                                        <td className="p-2 text-right font-bold text-amber-600 dark:text-amber-400">
                                            {formatRupiah(maxSusut)}
                                        </td>
                                        <td className="p-2 text-right">
                                            <NumberInput
                                                value={rowState.nominal}
                                                onChange={(val) =>
                                                    handleRowNominal(
                                                        asset.uid,
                                                        Math.min(
                                                            val || 0,
                                                            maxSusut
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    !rowState.selected || isPending
                                                }
                                                placeholder="Rp 0"
                                                min={0}
                                                max={maxSusut}
                                                className="h-7 text-xs font-bold text-amber-600 dark:text-amber-400 text-right rounded-lg"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                value={rowState.keterangan}
                                                onChange={(e) =>
                                                    handleRowKeterangan(
                                                        asset.uid,
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    !rowState.selected || isPending
                                                }
                                                placeholder="Keterangan..."
                                                className="h-7 text-xs rounded-lg"
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bottom Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                            {totalSelectedCount} Unit
                        </span>
                        <div className="leading-tight">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                Aset Terpilih
                            </span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {selectedItems.length} dialokasikan
                            </span>
                        </div>
                    </div>

                    <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Total Nominal Penyusutan
                        </span>
                        <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm sm:text-base">
                            {formatRupiah(totalNominalBulk)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="h-8.5 px-3.5 text-xs rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || selectedItems.length === 0}
                        className="h-8.5 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <IconCheck className="w-4 h-4" />
                        <span>{isPending ? "Mengeksekusi..." : "Eksekusi Penyusutan Multiple"}</span>
                    </Button>
                </div>
            </div>
        </form>
    );
}

export function AssetBulkPenyusutanDialog({
    open,
    onOpenChange,
    activeAssets,
}: AssetBulkPenyusutanDialogProps) {
    // Only assets with remaining depreciable value
    const depreciableAssets = useMemo(() => {
        return activeAssets.filter((a) => {
            const maxSusut =
                (Number(a.nilai_buku) || 0) - (Number(a.nilai_residu) || 0);
            return a.status === "aktif" && maxSusut > 0;
        });
    }, [activeAssets]);

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/40">
                        <IconLayersLinked className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 block">
                            Penyusutan Multiple Aset (Bulk Depreciation)
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal block">
                            Alokasikan nilai penyusutan ke beberapa unit aset sekaligus secara efisien
                        </span>
                    </div>
                </div>
            }
            className="w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl"
        >
            {open && (
                <BulkPenyusutanFormContent
                    key={depreciableAssets.map((a) => a.uid).join("-")}
                    depreciableAssets={depreciableAssets}
                    onOpenChange={onOpenChange}
                />
            )}
        </BaseDialog>
    );
}
