"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FormSelect } from "@/components/forms/form-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { useBalanceSheetStore } from "@/stores/balance-sheet-store";
import type { ChartOfAccount } from "@/features/accounting/types";
import {
    IconWallet,
    IconBuildingBank,
    IconReceipt,
    IconCoin,
    IconReportMoney,
    IconTrash,
    IconPlus,
    IconCheck,
    IconX
} from "@tabler/icons-react";

// Reusable Helper to map account icons
const getAccountIcon = (nama: string) => {
    const lowerName = nama.toLowerCase();
    if (lowerName.includes("kas") || lowerName.includes("tunai") || lowerName.includes("cash")) {
        return <IconWallet className="w-4 h-4 text-emerald-500" />;
    }
    if (lowerName.includes("bank") || lowerName.includes("giro")) {
        return <IconBuildingBank className="w-4 h-4 text-blue-500" />;
    }
    if (lowerName.includes("piutang") || lowerName.includes("receivable")) {
        return <IconReceipt className="w-4 h-4 text-sky-500" />;
    }
    if (lowerName.includes("persediaan") || lowerName.includes("stok") || lowerName.includes("inventory")) {
        return <IconReportMoney className="w-4 h-4 text-indigo-500" />;
    }
    if (lowerName.includes("utang") || lowerName.includes("hutang") || lowerName.includes("payable")) {
        return <IconCoin className="w-4 h-4 text-amber-500" />;
    }
    return <IconReportMoney className="w-4 h-4 text-slate-400" />;
};

interface BalanceSheetSectionCardProps {
    title: string;
    description: string;
    items: { uid?: string; kode: string | null; nama: string; amount: number; debit?: number; credit?: number }[];
    total: number;
    accentColor: "emerald" | "amber" | "indigo";
    totalLabel: string;
    icon: React.ReactNode;
    isEditing?: boolean;
    sectionKey?: "assets" | "liabilities" | "equity" | "revenue" | "expense";
    coaList?: ChartOfAccount[];
}

export function BalanceSheetSectionCard({
    title,
    description,
    items = [],
    total,
    accentColor,
    totalLabel,
    icon,
    isEditing = false,
    sectionKey,
    coaList = []
}: BalanceSheetSectionCardProps) {
    const { updateItemAmount, removeItem, addItem } = useBalanceSheetStore();
    const [isAdding, setIsAdding] = useState(false);

    const addMethods = useForm<{ selectedAccountUid: string }>({
        defaultValues: {
            selectedAccountUid: "",
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const watchedAccountUid = addMethods.watch("selectedAccountUid");

    const borderColors = {
        emerald: "border-t-emerald-500",
        amber: "border-t-amber-500",
        indigo: "border-t-indigo-500"
    };

    const bgTotals = {
        emerald: "bg-emerald-50/50 text-emerald-800 border-emerald-100",
        amber: "bg-amber-50/50 text-amber-800 border-amber-100",
        indigo: "bg-indigo-50/50 text-indigo-800 border-indigo-100"
    };

    const progressColors = {
        emerald: "bg-emerald-500",
        amber: "bg-amber-500",
        indigo: "bg-indigo-500"
    };

    // Filter COA for this section
    const getTargetCoaType = () => {
        if (sectionKey === "assets") return "asset";
        if (sectionKey === "liabilities") return "liability";
        if (sectionKey === "equity") return "equity";
        if (sectionKey === "revenue") return "revenue";
        if (sectionKey === "expense") return "expense";
        return "";
    };

    const targetType = getTargetCoaType();
    const availableCoas = coaList
        .filter((coa) => coa.is_active && coa.tipe === targetType)
        .filter((coa) => !items.some((item) => item.kode === coa.kode))
        .sort((a, b) => a.kode.localeCompare(b.kode));

    const handleAddAccount = () => {
        const uid = addMethods.getValues("selectedAccountUid");
        if (!uid || !sectionKey) return;
        const coa = coaList.find((c) => c.uid === uid);
        if (coa) {
            addItem(sectionKey, {
                uid: coa.uid,
                kode: coa.kode,
                nama: coa.nama,
                amount: 0,
            });
            addMethods.reset({ selectedAccountUid: "" });
            setIsAdding(false);
        }
    };

    const displayedItems = isEditing ? items : items.filter((item) => item.amount !== 0);

    const totalDebit = items.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = items.reduce((sum, item) => sum + (item.credit || 0), 0);

    const fmtLedger = (n: number) => (n ? formatRupiah(n) : "-");

    return (
        <Card className={cn("bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden border-t-2", borderColors[accentColor])}>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</CardTitle>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {description}
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-6 pb-2 divide-y divide-slate-100">
                    {!isEditing && (
                        <div className="flex justify-between items-center pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <span>Akun</span>
                            <div className="flex items-center gap-6">
                                <span>Debit</span>
                                <span>Kredit</span>
                            </div>
                        </div>
                    )}
                    {displayedItems.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                            Tidak ada item akun aktif dengan saldo non-nol untuk kategori ini.
                        </div>
                    ) : (
                        displayedItems.map((item, idx) => {
                            const percent = total > 0 ? Math.round((item.amount / total) * 100) : 0;
                            return (
                                <div key={`${item.uid || item.kode}-${idx}`} className="py-3">
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-mono text-slate-400 block">
                                                {item.kode ?? "-"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {getAccountIcon(item.nama)}
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {item.nama}
                                                </span>
                                            </div>
                                        </div>

                                        {isEditing && sectionKey ? (
                                            <div className="flex items-center gap-2">
                                                <NumberInput
                                                    value={item.amount}
                                                    onChange={(val) => updateItemAmount(sectionKey, item.uid || "", val || 0)}
                                                    allowNegative={true}
                                                    className="w-[140px] text-right font-bold text-slate-800 text-xs h-9 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                                                    placeholder="Rp 0"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(sectionKey, item.uid || "")}
                                                    className="h-9 w-9 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-5">
                                                    <span className="text-xs font-bold text-emerald-700 tabular-nums">
                                                        {fmtLedger(item.debit || 0)}
                                                    </span>
                                                    <span className="text-xs font-bold text-rose-700 tabular-nums">
                                                        {fmtLedger(item.credit || 0)}
                                                    </span>
                                                </div>
                                                {percent > 0 && (
                                                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                                        {percent}%
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {!isEditing && item.amount > 0 && total > 0 && (
                                        <div className="w-full bg-slate-50 rounded-full h-1 mt-2 overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-500", progressColors[accentColor])}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Edit Mode Inline CoA Adder */}
                {isEditing && sectionKey && (
                    <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100">
                        {isAdding ? (
                            <FormProvider {...addMethods}>
                                <div className="flex flex-col gap-2 pt-1">
                                    <div className="flex items-end gap-2">
                                        <FormSelect<{ selectedAccountUid: string }>
                                            name="selectedAccountUid"
                                            label="Pilih Akun Baru"
                                            options={availableCoas.map((coa) => ({
                                                value: coa.uid,
                                                label: `[${coa.kode}] ${coa.nama}`,
                                            }))}
                                            placeholder="Pilih Akun..."
                                            emptyMessage="Tidak ada akun tersedia."
                                            className="w-full h-9"
                                            wrapperClassName="flex-1 min-w-0"
                                            size="sm"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            disabled={!watchedAccountUid}
                                            onClick={handleAddAccount}
                                            className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white shadow-sm transition-colors shrink-0"
                                        >
                                            <IconCheck className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setIsAdding(false);
                                                addMethods.reset({ selectedAccountUid: "" });
                                            }}
                                            className="h-9 w-9 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                                        >
                                            <IconX className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </FormProvider>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAdding(true)}
                                className="w-full text-xs font-bold text-slate-600 border-dashed border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl py-2 h-9 flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <IconPlus className="w-3.5 h-3.5" />
                                Tambah Akun (CoA)
                            </Button>
                        )}
                    </div>
                )}

                {/* Total Row */}
                {!isEditing ? (
                    <div className={cn("px-6 py-4 border-t flex justify-between items-center", bgTotals[accentColor])}>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">
                            {totalLabel}
                        </span>
                        <div className="flex items-center gap-5 text-sm font-extrabold tabular-nums">
                            <span className="text-emerald-700">{fmtLedger(totalDebit)}</span>
                            <span className="text-rose-700">{fmtLedger(totalCredit)}</span>
                        </div>
                    </div>
                ) : (
                    <div className={cn("px-6 py-4 border-t flex justify-between items-center", bgTotals[accentColor])}>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">
                            {totalLabel}
                        </span>
                        <span className="text-sm font-extrabold">
                            {formatRupiah(total)}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
