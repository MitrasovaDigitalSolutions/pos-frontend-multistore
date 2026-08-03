"use client";

import { useState, useMemo, useEffect, useDeferredValue } from "react";
import { useForm } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterForm } from "@/components/forms/filter-form";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { useTransactionsList } from "@/features/transactions/api/transactions-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { db, type OfflineTransactionRecord } from "@/lib/db";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    IconPrinter,
    IconInfoCircle,
} from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable } from "@/components/ui/data-table";

export interface PastTransactionDisplayItem {
    uid: string;
    nomor_transaksi: string;
    nama_transaksi: string | null;
    kasirName: string;
    created_at: string;
    metode_pembayaran: string;
    total: number;
    cash_amount: number;
    card_amount: number;
    debt_amount: number;
    status: string;
    isOffline?: boolean;
}

interface TransactionFilterValues {
    search: string;
    status: string;
    payment_method: string;
    from: string;
    to: string;
}

interface PastTransactionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReprint: (uid?: string) => void;
    lastTransactionId?: string | null;
}

export function PastTransactionsDialog({
    open,
    onOpenChange,
    onReprint,
    lastTransactionId,
}: PastTransactionsDialogProps) {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<TransactionFilterValues>({
        search: "",
        status: "all",
        payment_method: "all",
        from: "",
        to: "",
    });

    const deferredFilters = useDeferredValue(filters);
    const [offlineList, setOfflineList] = useState<OfflineTransactionRecord[]>([]);

    const filterMethods = useForm<TransactionFilterValues>({
        defaultValues: {
            search: "",
            status: "all",
            payment_method: "all",
            from: "",
            to: "",
        },
    });

    const handleFilterSubmit = (data: TransactionFilterValues) => {
        setFilters({
            search: data.search,
            status: data.status,
            payment_method: data.payment_method,
            from: data.from,
            to: data.to,
        });
        setPage(1);
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            status: "all",
            payment_method: "all",
            from: "",
            to: "",
        });
        setFilters({
            search: "",
            status: "all",
            payment_method: "all",
            from: "",
            to: "",
        });
        setPage(1);
    };

    // API Params
    const apiParams = useMemo(() => {
        const p: {
            page: number;
            per_page: number;
            search?: string;
            status?: string;
            payment_method?: string;
            from?: string;
            to?: string;
            sort_by?: string;
            sort_order?: "asc" | "desc";
        } = {
            page,
            per_page: 10,
            sort_by: "created_at",
            sort_order: "desc",
        };

        if (deferredFilters.search.trim()) p.search = deferredFilters.search;
        if (deferredFilters.status !== "all") p.status = deferredFilters.status;
        if (deferredFilters.payment_method !== "all") p.payment_method = deferredFilters.payment_method;
        if (deferredFilters.from) p.from = deferredFilters.from;
        if (deferredFilters.to) p.to = deferredFilters.to;

        return p;
    }, [page, deferredFilters]);

    const { data: transactionsData, isLoading, isFetching, refetch } = useTransactionsList(apiParams);

    // Fetch offline transactions when opened
    useEffect(() => {
        if (open) {
            db.offlineTransactions.toArray().then((items) => {
                setOfflineList(items || []);
            }).catch((err) => {
                console.error("Gagal memuat transaksi offline:", err);
            });
        }
    }, [open]);

    // Combine online + offline records into PastTransactionDisplayItem format
    const transactions = useMemo<PastTransactionDisplayItem[]>(() => {
        const onlineList: PastTransactionDisplayItem[] = (transactionsData?.data || []).map((tx) => ({
            uid: String(tx.uid),
            nomor_transaksi: tx.nomor_transaksi || `TRX-${tx.uid}`,
            nama_transaksi: tx.member?.nama || tx.nama_transaksi || null,
            kasirName: tx.user?.name || "Kasir",
            created_at: tx.created_at,
            metode_pembayaran: tx.metode_pembayaran || "cash",
            total: tx.total || 0,
            cash_amount: tx.cash_amount || 0,
            card_amount: tx.card_amount || 0,
            debt_amount: tx.debt_amount || 0,
            status: tx.status || "completed",
            isOffline: false,
        }));

        if (page === 1 && offlineList.length > 0) {
            const formattedOffline: PastTransactionDisplayItem[] = offlineList.map((off) => ({
                uid: `OFFLINE-${off.uid}`,
                nomor_transaksi: `OFFLINE-${off.uid.slice(-8)}`,
                nama_transaksi: off.receiptData?.member?.nama || off.receiptData?.nama_transaksi || "Offline TRX",
                kasirName: "Kasir Offline",
                created_at: off.timestamp || new Date().toISOString(),
                metode_pembayaran: off.receiptData?.metode_pembayaran || "cash",
                total: off.receiptData?.total || 0,
                cash_amount: off.receiptData?.cash_received || off.receiptData?.total || 0,
                card_amount: 0,
                debt_amount: off.receiptData?.debt_amount || 0,
                status: "completed",
                isOffline: true,
            }));

            const filteredOffline = formattedOffline.filter((tx) => {
                if (deferredFilters.search.trim()) {
                    return tx.nomor_transaksi.toLowerCase().includes(deferredFilters.search.toLowerCase()) ||
                        (tx.nama_transaksi && tx.nama_transaksi.toLowerCase().includes(deferredFilters.search.toLowerCase()));
                }
                return true;
            });

            return [...filteredOffline, ...onlineList];
        }
        return onlineList;
    }, [transactionsData, offlineList, page, deferredFilters.search]);

    const statusLabels: Record<string, string> = {
        completed: "Selesai",
        void: "Dibatalkan",
        draft: "Draft",
    };

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "completed", label: "Selesai" },
        { value: "void", label: "Void / Batal" },
        { value: "draft", label: "Draft" },
    ];

    const paymentMethodOptions = [
        { value: "all", label: "Semua Pembayaran" },
        { value: "cash", label: "Tunai (Cash)" },
        { value: "card", label: "Non-Tunai (Card)" },
        { value: "split", label: "Split Payment" },
        { value: "debt", label: "Hutang / Kasbon" },
    ];

    // Columns config identical to Admin Transactions List
    const columns: ColumnDef<PastTransactionDisplayItem>[] = [
        {
            accessorKey: "nomor_transaksi",
            header: "No. Transaksi",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 font-mono text-xs">
                        {row.original.nomor_transaksi}
                    </span>
                    {row.original.isOffline && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded w-fit mt-0.5 border border-amber-200">
                            OFFLINE
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "nama_transaksi",
            header: "Pelanggan / Keterangan",
            cell: ({ row }) => {
                const customer = row.original.nama_transaksi || "-";
                return (
                    <span className="text-slate-700 font-semibold truncate max-w-[140px] inline-block text-xs" title={customer}>
                        {customer}
                    </span>
                );
            },
        },
        {
            accessorKey: "kasirName",
            header: "Kasir",
            cell: ({ row }) => (
                <span className="font-semibold text-slate-700 text-xs">
                    {row.original.kasirName}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Waktu Transaksi",
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return (
                    <span className="text-slate-500 text-xs whitespace-nowrap font-medium">
                        {format(date, "dd MMM yyyy, HH:mm", { locale: id })}
                    </span>
                );
            },
        },
        {
            accessorKey: "metode_pembayaran",
            header: "Pembayaran",
            cell: ({ row }) => {
                const method = row.original.metode_pembayaran?.toLowerCase() || "cash";
                return <StatusBadge status={method} />;
            },
        },
        {
            accessorKey: "total",
            header: "Total",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right font-bold text-slate-900 tabular-nums align-middle text-xs",
            },
            cell: ({ row }) => {
                const totalFormatted = formatRupiah(row.original.total);
                const method = row.original.metode_pembayaran?.toLowerCase();
                const isDebt = method === "debt";

                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <span className="font-mono font-bold text-xs">{totalFormatted}</span>
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="text-slate-400 hover:text-indigo-500 cursor-help transition-colors">
                                        <IconInfoCircle size={14} className="stroke-[2.5]" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="end" className="text-[11px] space-y-1 p-2.5 min-w-[150px] shadow-lg border-slate-700 bg-slate-900 text-white">
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-slate-300">{isDebt ? "DP Tunai" : "Tunai"}</span>
                                        <span className="font-bold text-emerald-400 tabular-nums">{formatRupiah(row.original.cash_amount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-slate-300">{isDebt ? "DP Non-Tunai" : "Non-Tunai"}</span>
                                        <span className="font-bold text-blue-400 tabular-nums">{formatRupiah(row.original.card_amount || 0)}</span>
                                    </div>
                                    {isDebt && (
                                        <>
                                            <div className="border-t border-slate-700 my-1.5"></div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-slate-300">Sisa Utang</span>
                                                <span className="font-bold text-rose-400 tabular-nums">{formatRupiah(row.original.debt_amount || 0)}</span>
                                            </div>
                                        </>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status?.toLowerCase() || "completed";
                const label = statusLabels[status] || row.original.status;
                return <StatusBadge status={status} label={label} />;
            },
        },
    ];

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconPrinter size={20} className="text-emerald-600" />
                    <span>Daftar Transaksi Kasir (Cetak Struk)</span>
                </div>
            }
            className="sm:max-w-5xl max-h-[90vh] flex flex-col"
        >
            <div className="space-y-3 pt-3 flex-1 flex flex-col min-h-0">
                {/* Header Top Quick Actions & FilterForm */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3 shrink-0">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-800">Filter & Pencarian Transaksi</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                refetch();
                                if (lastTransactionId) onReprint(lastTransactionId);
                            }}
                            className="h-8 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-white font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                            <IconPrinter size={15} className="text-emerald-600" />
                            <span>Cetak Terakhir</span>
                        </Button>
                    </div>

                    <FilterForm
                        methods={filterMethods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                    >
                        <FormInput<TransactionFilterValues>
                            name="search"
                            label="Cari Transaksi"
                            placeholder="Cari nomor transaksi..."
                        />

                        <FormDatePicker<TransactionFilterValues>
                            name="from"
                            label="Tanggal Awal"
                            placeholder="Dari Tanggal"
                        />

                        <FormDatePicker<TransactionFilterValues>
                            name="to"
                            label="Tanggal Akhir"
                            placeholder="Sampai Tanggal"
                        />

                        <FormSelect<TransactionFilterValues>
                            name="status"
                            label="Status"
                            options={statusOptions}
                            placeholder="Semua Status"
                        />

                        <FormSelect<TransactionFilterValues>
                            name="payment_method"
                            label="Pembayaran"
                            options={paymentMethodOptions}
                            placeholder="Semua Pembayaran"
                        />
                    </FilterForm>
                </div>

                {/* Data Table */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <DataTable
                        columns={columns}
                        data={transactions}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        page={page}
                        perPage={10}
                        onPageChange={(p: number) => setPage(p)}
                        meta={transactionsData?.meta}
                        extraActions={(row: PastTransactionDisplayItem) => (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => onReprint(row.uid)}
                                className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg shadow-2xs cursor-pointer border-none flex items-center gap-1 active:scale-95 transition-all"
                                title="Cetak Struk"
                            >
                                <IconPrinter size={13} />
                                <span>Cetak</span>
                            </Button>
                        )}
                    />
                </div>
            </div>
        </BaseDialog>
    );
}
