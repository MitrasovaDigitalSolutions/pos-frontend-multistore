"use client";

import { useEffect, useMemo, useState } from "react";
import {
    useCoaMappings,
    useUpdateCoaMappings,
    type CoaMapping,
    type CoaMappingUpdate,
} from "@/features/accounting/api/coa-mapping-api";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconDeviceFloppy } from "@tabler/icons-react";

const TYPE_LABELS: Record<string, string> = {
    sale: "Penjualan",
    stock_receiving: "Penerimaan Barang",
    supplier_payment: "Pembayaran Supplier",
    expense: "Pengeluaran",
    member_payment: "Pembayaran Member",
    purchase_return: "Retur Pembelian",
    cash_ledger: "Cash Ledger (Kas / Bank)",
};

const SLOT_LABELS: Record<string, string> = {
    sale_cash: "Kas (Tunai)",
    sale_card: "Bank (Kartu)",
    sale_receivable: "Piutang Usaha",
    sale_revenue: "Pendapatan Penjualan",
    sale_residual: "Diskon / Pajak",
    sale_cogs: "HPP (COGS)",
    sale_inventory: "Persediaan",
    receiving_inventory: "Persediaan",
    receiving_ap: "Hutang Usaha",
    payment_ap: "Hutang Usaha",
    payment_cash: "Kas (Tunai)",
    payment_bank: "Bank",
    expense_account: "Beban",
    expense_cash: "Kas (Tunai)",
    expense_bank: "Bank",
    memberpayment_receivable: "Piutang Usaha",
    return_ap: "Hutang Usaha",
    return_inventory: "Persediaan",
    cashledger_cash: "Kas (Tunai)",
    cashledger_bank: "Bank",
};

const TYPE_ORDER = [
    "sale",
    "stock_receiving",
    "supplier_payment",
    "expense",
    "member_payment",
    "purchase_return",
    "cash_ledger",
];

export default function CoaMappingPage() {
    const { data: mappings, isLoading } = useCoaMappings();
    const { data: coas } = useFlatChartOfAccounts();
    const updateMutation = useUpdateCoaMappings();

    const [selected, setSelected] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!mappings) return;
        const init: Record<string, string> = {};
        mappings.forEach((m) => {
            init[`${m.transaction_type}:${m.slot}`] = m.chart_of_account_uid;
        });
        setSelected(init);
    }, [mappings]);

    const grouped = useMemo(() => {
        if (!mappings) return [];
        return TYPE_ORDER.map((type) => ({
            type,
            label: TYPE_LABELS[type] ?? type,
            items: mappings
                .filter((m) => m.transaction_type === type)
                .sort((a, b) =>
                    (SLOT_LABELS[a.slot] ?? a.slot).localeCompare(
                        SLOT_LABELS[b.slot] ?? b.slot
                    )
                ),
        })).filter((g) => g.items.length > 0);
    }, [mappings]);

    const dirty = useMemo(() => {
        if (!mappings) return false;
        return mappings.some(
            (m) => selected[`${m.transaction_type}:${m.slot}`] !== m.chart_of_account_uid
        );
    }, [mappings, selected]);

    const handleSave = () => {
        if (!mappings) return;
        const payload: CoaMappingUpdate[] = mappings.map((m) => ({
            transaction_type: m.transaction_type,
            slot: m.slot,
            chart_of_account_uid:
                selected[`${m.transaction_type}:${m.slot}`] ?? m.chart_of_account_uid,
        }));
        updateMutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    Mapping COA
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Tentukan akun COA tujuan untuk setiap jenis posting otomatis dari
                    transaksi operasional. Perubahan berlaku untuk transaksi baru. Untuk
                    menerapkan ke data historis, jalankan{" "}
                    <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
                        php artisan ledger:backfill
                    </code>{" "}
                    di backend.
                </p>
            </div>

            {grouped.map((group) => (
                <Card key={group.type} className="p-4">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        {group.label}
                    </h2>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {group.items.map((m) => {
                            const key = `${m.transaction_type}:${m.slot}`;
                            return (
                                <div
                                    key={key}
                                    className="flex items-center justify-between gap-4 py-2"
                                >
                                    <span className="text-sm text-slate-700 dark:text-slate-200">
                                        {SLOT_LABELS[m.slot] ?? m.slot}
                                    </span>
                                    <select
                                        value={selected[key] ?? ""}
                                        onChange={(e) =>
                                            setSelected((s) => ({
                                                ...s,
                                                [key]: e.target.value,
                                            }))
                                        }
                                        className="w-72 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    >
                                        {coas?.map((c) => (
                                            <option key={c.uid} value={c.uid}>
                                                {c.kode} — {c.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            ))}

            <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={!dirty || updateMutation.isPending}>
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                {updateMutation.isSuccess && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                        Tersimpan.
                    </span>
                )}
                {updateMutation.isError && (
                    <span className="text-sm text-rose-600 dark:text-rose-400">
                        Gagal menyimpan.
                    </span>
                )}
            </div>
        </div>
    );
}
