"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    IconArrowsExchange,
    IconCheck,
    IconChevronDown,
    IconChevronUp,
    IconEdit,
    IconLoader2,
    IconPlus,
    IconRefresh,
    IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoaPickerTrigger } from "../shared/coa-picker-trigger";
import {
    useCreateCoaCounterpartMapping,
    useUpdateCoaCounterpartMapping,
} from "../../api/counterpart-mapping-api";
import type { ChartOfAccount, CoaCounterpartMapping } from "../../types";

interface CounterpartQuickAddProps {
    accounts: ChartOfAccount[];
    existingMappings: CoaCounterpartMapping[];
    editingMapping: CoaCounterpartMapping | null;
    onCancelEdit: () => void;
    onSuccess?: () => void;
}

export function CounterpartQuickAdd({
    accounts,
    existingMappings,
    editingMapping,
    onCancelEdit,
    onSuccess,
}: CounterpartQuickAddProps) {
    const isEditMode = !!editingMapping;

    // Direct initialization from props (key-based reset managed by parent)
    const [coaUid, setCoaUid] = useState<string>(() => editingMapping?.coa_uid || "");
    const [counterpartCoaUid, setCounterpartCoaUid] = useState<string>(
        () => editingMapping?.counterpart_coa_uid || ""
    );
    const [keterangan, setKeterangan] = useState<string>(() => editingMapping?.keterangan || "");
    const [isExpandedMobile, setIsExpandedMobile] = useState<boolean>(true);

    const createMutation = useCreateCoaCounterpartMapping();
    const updateMutation = useUpdateCoaCounterpartMapping();

    const isPending = createMutation.isPending || updateMutation.isPending;

    const isDuplicate = useMemo(() => {
        if (!coaUid || !counterpartCoaUid) return false;
        return existingMappings.some((m) => {
            if (isEditMode && m.uid === editingMapping?.uid) return false;
            return m.coa_uid === coaUid && m.counterpart_coa_uid === counterpartCoaUid;
        });
    }, [coaUid, counterpartCoaUid, existingMappings, isEditMode, editingMapping]);

    const canSubmit = coaUid && counterpartCoaUid && !isDuplicate && !isPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            if (isEditMode && editingMapping) {
                await updateMutation.mutateAsync({
                    uid: editingMapping.uid,
                    data: {
                        coa_uid: coaUid,
                        counterpart_coa_uid: counterpartCoaUid,
                        keterangan: keterangan.trim() || null,
                    },
                });
                toast.success("Mapping lawan akun berhasil diperbarui.");
                onCancelEdit();
            } else {
                await createMutation.mutateAsync({
                    coa_uid: coaUid,
                    counterpart_coa_uid: counterpartCoaUid,
                    keterangan: keterangan.trim() || null,
                });
                toast.success("Mapping lawan akun berhasil ditambahkan.");
                setCoaUid("");
                setCounterpartCoaUid("");
                setKeterangan("");
            }
            onSuccess?.();
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(
                error.message ||
                    (isEditMode
                        ? "Gagal memperbarui mapping."
                        : "Gagal menambahkan mapping.")
            );
        }
    };

    const handleReset = () => {
        if (isEditMode) {
            onCancelEdit();
        } else {
            setCoaUid("");
            setCounterpartCoaUid("");
            setKeterangan("");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                isEditMode
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-800"
            } space-y-3`}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                            isEditMode
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-blue-600 text-white"
                        }`}
                    >
                        {isEditMode ? <IconEdit size={14} /> : <IconPlus size={14} />}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isEditMode ? "Ubah Mapping Lawan Akun" : "Tambah Mapping Lawan Akun"}
                    </span>
                    {isEditMode && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            Mode Edit
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isDuplicate && (
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                            Pasangan ini sudah ada!
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsExpandedMobile(!isExpandedMobile)}
                        className="md:hidden text-slate-500 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                        title="Toggle Form"
                    >
                        {isExpandedMobile ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {isExpandedMobile && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                    {/* Akun Utama */}
                    <div className="md:col-span-4 min-w-0">
                        <label className="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Akun Utama (CoA) *
                        </label>
                        <CoaPickerTrigger
                            value={coaUid}
                            onChange={(val) => {
                                setCoaUid(val);
                                if (val === counterpartCoaUid) {
                                    setCounterpartCoaUid("");
                                }
                            }}
                            accounts={accounts}
                            placeholder="Pilih Akun Utama..."
                            dialogTitle="Pilih Akun Utama (CoA)"
                            size="md"
                        />
                    </div>

                    {/* Arrow Connector Indicator - Desktop */}
                    <div className="hidden md:flex md:col-span-1 items-center justify-center text-slate-400">
                        <div
                            className={`w-7 h-7 rounded-full bg-white dark:bg-slate-900 border flex items-center justify-center shadow-xs ${
                                isEditMode
                                    ? "border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400"
                                    : "border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400"
                            }`}
                        >
                            <IconArrowsExchange size={14} />
                        </div>
                    </div>

                    {/* Arrow Connector Indicator - Mobile */}
                    <div className="flex md:hidden items-center justify-center gap-1.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <IconArrowsExchange size={14} />
                        <span className="text-[11px]">Diseimbangkan dengan</span>
                    </div>

                    {/* Akun Lawan */}
                    <div className="md:col-span-3 min-w-0">
                        <label className="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Akun Lawan (Penyeimbang) *
                        </label>
                        <CoaPickerTrigger
                            value={counterpartCoaUid}
                            onChange={setCounterpartCoaUid}
                            accounts={accounts}
                            excludeUid={coaUid}
                            disabled={!coaUid}
                            placeholder="Pilih Akun Lawan..."
                            dialogTitle="Pilih Akun Lawan (Penyeimbang)"
                            size="md"
                        />
                    </div>

                    {/* Keterangan */}
                    <div className="md:col-span-2 min-w-0">
                        <label className="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Keterangan / Catatan
                        </label>
                        <Input
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder="Catatan (opsional)..."
                            className="h-10 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex items-center gap-1.5 justify-end pt-1 md:pt-0">
                        {isEditMode && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                disabled={isPending}
                                className="h-10 sm:h-9 px-2.5 rounded-lg border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                                title="Batal Edit"
                            >
                                <IconX size={14} />
                                <span>Batal</span>
                            </Button>
                        )}

                        {!isEditMode && (coaUid || counterpartCoaUid || keterangan) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-10 sm:h-9 px-2 rounded-lg text-slate-500 text-xs font-semibold cursor-pointer"
                                title="Reset Form"
                            >
                                <IconRefresh size={14} />
                            </Button>
                        )}

                        <Button
                            type="submit"
                            size="sm"
                            disabled={!canSubmit}
                            className={`h-10 sm:h-9 px-3 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 flex-1 md:flex-initial ${
                                isEditMode
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {isPending ? (
                                <IconLoader2 size={14} className="animate-spin" />
                            ) : isEditMode ? (
                                <IconCheck size={14} stroke={2.5} />
                            ) : (
                                <IconPlus size={14} />
                            )}
                            <span>{isEditMode ? "Simpan" : "Tambah"}</span>
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}
