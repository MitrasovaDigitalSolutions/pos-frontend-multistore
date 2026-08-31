"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import {
    IconLayersLinked,
    IconCheck,
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

export function AssetBulkPenyusutanDialog({
    open,
    onOpenChange,
    activeAssets,
}: AssetBulkPenyusutanDialogProps) {
    const bulkMutation = useBulkAssetPenyusutan();

    // Only assets with remaining depreciable value
    const depreciableAssets = useMemo(() => {
        return activeAssets.filter((a) => {
            const maxSusut = (Number(a.nilai_buku) || 0) - (Number(a.nilai_residu) || 0);
            return a.status === "aktif" && maxSusut > 0;
        });
    }, [activeAssets]);

    const [rows, setRows] = useState<Record<string, BulkRowState>>({});

    const {
        handleSubmit,
        control,
        reset,
    } = useForm<{ tanggal: string }>({
        defaultValues: {
            tanggal: new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                tanggal: new Date().toISOString().split("T")[0],
            });

            const initialRows: Record<string, BulkRowState> = {};
            depreciableAssets.forEach((a) => {
                initialRows[a.uid] = {
                    selected: true,
                    asset_uid: a.uid,
                    nominal: 0,
                    keterangan: `Penyusutan masal ${a.nama}`,
                };
            });
            setRows(initialRows);
        }
    }, [open, depreciableAssets, reset]);

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
                const processed = (res as unknown as { total_processed?: number })?.total_processed || selectedItems.length;
                toast.success(`Berhasil mencatat penyusutan masal untuk ${processed} aset.`);
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal mengeksekusi penyusutan masal.");
            },
        });
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconLayersLinked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Penyusutan Masal Aset (Bulk Depreciation)</span>
                </div>
            }
            className="max-w-4xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Tanggal Penyusutan Masal <span className="text-rose-500">*</span>
                        </label>
                        <div className="w-48">
                            <Controller
                                control={control}
                                name="tanggal"
                                render={({ field }) => (
                                    <DatePicker
                                        value={field.value}
                                        onChange={(val) => field.onChange(val)}
                                        placeholder="Pilih tanggal..."
                                        disabled={isPending}
                                        size="sm"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-500 font-semibold mr-1">
                            Alokasi Otomatis Terpilih:
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoFillPercent(100)}
                            className="h-7 px-2 text-[11px] rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                            100% Sisa Susut
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoFillPercent(50)}
                            className="h-7 px-2 text-[11px] rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                            50% Sisa
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoFillPercent(10)}
                            className="h-7 px-2 text-[11px] rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                            10% Sisa
                        </Button>
                    </div>
                </div>

                {/* Table of Assets */}
                <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-2.5 text-center w-10">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={(checked: boolean) => handleToggleSelectAll(checked)}
                                    />
                                </th>
                                <th className="p-2.5 text-left">Nama & Nomor Aset</th>
                                <th className="p-2.5 text-right w-28">Nilai Buku</th>
                                <th className="p-2.5 text-right w-28">Maks Susut</th>
                                <th className="p-2.5 text-right w-44">Nominal Susut</th>
                                <th className="p-2.5 text-left w-52">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {depreciableAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        Tidak ada aset aktif yang memerlukan alokasi penyusutan.
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
                                            className={`transition-colors ${rowState.selected
                                                    ? "bg-indigo-50/20 dark:bg-indigo-950/10"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-900/30"
                                                }`}
                                        >
                                            <td className="p-2.5 text-center">
                                                <Checkbox
                                                    checked={rowState.selected}
                                                    onCheckedChange={(checked: boolean) =>
                                                        handleRowSelect(asset.uid, checked)
                                                    }
                                                />
                                            </td>
                                            <td className="p-2.5">
                                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                                    {asset.nama}
                                                </div>
                                                <span className="font-mono text-[10px] text-slate-400">
                                                    {asset.nomor_aset}
                                                </span>
                                            </td>
                                            <td className="p-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                                                {formatRupiah(Number(asset.nilai_buku) || 0)}
                                            </td>
                                            <td className="p-2.5 text-right font-bold text-amber-600 dark:text-amber-400">
                                                {formatRupiah(maxSusut)}
                                            </td>
                                            <td className="p-2.5 text-right">
                                                <NumberInput
                                                    value={rowState.nominal}
                                                    onChange={(val) =>
                                                        handleRowNominal(
                                                            asset.uid,
                                                            Math.min(val || 0, maxSusut)
                                                        )
                                                    }
                                                    disabled={!rowState.selected || isPending}
                                                    placeholder="Rp 0"
                                                    min={0}
                                                    max={maxSusut}
                                                    className="h-8 text-xs font-bold text-amber-600 dark:text-amber-400 text-right rounded-lg"
                                                />
                                            </td>
                                            <td className="p-2.5">
                                                <Input
                                                    value={rowState.keterangan}
                                                    onChange={(e) =>
                                                        handleRowKeterangan(asset.uid, e.target.value)
                                                    }
                                                    disabled={!rowState.selected || isPending}
                                                    placeholder="Keterangan..."
                                                    className="h-8 text-xs rounded-lg"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-xl shadow-xs">
                    <div className="flex items-center gap-4 text-xs">
                        <div>
                            <span className="text-slate-400 text-[10px] block">Aset Dipilih</span>
                            <span className="font-extrabold text-indigo-300">
                                {totalSelectedCount} Unit ({selectedItems.length} dialokasikan)
                            </span>
                        </div>
                        <div className="border-l border-slate-700 pl-4">
                            <span className="text-slate-400 text-[10px] block">
                                Total Nominal Disusutkan
                            </span>
                            <span className="font-extrabold text-amber-400 text-sm">
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
                            className="h-8 px-3 text-xs text-slate-300 border-slate-700 hover:bg-slate-800 rounded-xl cursor-pointer"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || selectedItems.length === 0}
                            className="h-8 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            <IconCheck className="w-3.5 h-3.5 mr-1" />
                            {isPending ? "Mengeksekusi..." : "Eksekusi Penyusutan Masal"}
                        </Button>
                    </div>
                </div>
            </form>
        </BaseDialog>
    );
}
