"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    useCoaMappings,
    useUpdateCoaMappings,
    type CoaMappingUpdate,
} from "@/features/accounting/api/coa-mapping-api";
import {
    useLedgerBackfill,
    useLedgerBackfillStatus,
} from "@/features/accounting/api/ledger-api";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { queryKeys } from "@/lib/query-keys";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconDeviceFloppy, IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";

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
    const backfillMutation = useLedgerBackfill();

    const queryClient = useQueryClient();
    const backfillStatus = useLedgerBackfillStatus(true);
    const bfState = backfillStatus.data?.status ?? "idle";
    const isBackfilling = bfState === "queued" || bfState === "running";

    // ponytail: toast only on transition into completed/failed, never on initial load.
    const prevBfState = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (prevBfState.current && prevBfState.current !== bfState) {
            if (bfState === "completed") {
                toast.success("General ledger berhasil di-backfill ulang.");
                queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
            } else if (bfState === "failed") {
                toast.error(
                    backfillStatus.data?.message || "Backfill general ledger gagal."
                );
            }
        }
        prevBfState.current = bfState;
    }, [bfState, backfillStatus.data?.message, queryClient]);

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

    const handleBackfill = () => {
        backfillMutation.mutate(undefined, {
            onError: (e) =>
                toast.error(
                    e.message || "Gagal memulai backfill general ledger."
                ),
        });
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
                    menerapkan ke data historis, gunakan tombol{" "}
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                        Backfill Historis
                    </span>{" "}
                    di bawah.
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

            <div className="flex flex-wrap items-center gap-3">
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

                <Button
                    variant="outline"
                    onClick={handleBackfill}
                    disabled={backfillMutation.isPending || isBackfilling}
                >
                    <IconRefresh className="mr-2 h-4 w-4" />
                    {isBackfilling ? "Memproses..." : "Backfill Historis"}
                </Button>
                {isBackfilling && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Sedang memproses, jangan tutup halaman…
                    </span>
                )}
                {bfState === "failed" && (
                    <span className="text-sm text-rose-600 dark:text-rose-400">
                        Gagal backfill.
                    </span>
                )}
            </div>
        </div>
    );
}
