"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { IconLoader2, IconX } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { formatDate, formatToTime } from "@/lib/date-utils";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useCashFlow, type CashLedger, type CashAccount } from "../api/cash-api";

interface CashLedgerTableProps {
    cashAccountUid?: string;
    onClearSelection: () => void;
    accounts: CashAccount[];
}

interface LedgerFilterValues {
    search: string;
    tipe: string;
    from: string;
    to: string;
}

export function CashLedgerTable({
    cashAccountUid,
    onClearSelection,
    accounts
}: CashLedgerTableProps) {
    // Ledger filter states
    const [ledgerFilters, setLedgerFilters] = useState({
        page: 1,
        per_page: 15,
        cash_account_uid: cashAccountUid,
        tipe: "" as string,
        search: "" as string,
        from: "" as string,
        to: "" as string,
    });

    const filterMethods = useForm<LedgerFilterValues>({
        defaultValues: {
            search: "",
            tipe: "",
            from: "",
            to: "",
        },
    });

    const handleFilterSubmit = (data: LedgerFilterValues) => {
        setLedgerFilters(prev => ({
            ...prev,
            page: 1,
            search: data.search,
            tipe: data.tipe,
            from: data.from,
            to: data.to,
        }));
    };

    const handleFilterReset = () => {
        filterMethods.reset({
            search: "",
            tipe: "",
            from: "",
            to: "",
        });
        setLedgerFilters(prev => ({
            ...prev,
            page: 1,
            search: "",
            tipe: "",
            from: "",
            to: "",
        }));
    };

    const tipeOptions = [
        { value: "", label: "Semua Tipe" },
        { value: "inflow", label: "Inflow (Masuk)" },
        { value: "outflow", label: "Outflow (Keluar)" },
        { value: "transfer", label: "Transfer" },
    ];

    const { data: ledgerData, isLoading: ledgerLoading, isFetching: ledgerFetching } = useCashFlow({
        page: ledgerFilters.page,
        per_page: ledgerFilters.per_page,
        cash_account_uid: ledgerFilters.cash_account_uid || undefined,
        tipe: ledgerFilters.tipe || undefined,
        search: ledgerFilters.search || undefined,
        from: ledgerFilters.from || undefined,
        to: ledgerFilters.to || undefined,
    });

    const renderReference = (movement: CashLedger) => {
        const sale = movement.sale;
        const supplierPayment = movement.supplierPayment || movement.supplier_payment;
        const purchaseReturnSettlement = movement.purchaseReturnSettlement || movement.purchase_return_settlement;
        const expense = movement.expense;
        const drawerMovement = movement.cashDrawerMovement || movement.cash_drawer_movement;

        if (sale) {
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Penjualan</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{sale.nomor_transaksi}</span>
                </div>
            );
        }
        if (supplierPayment) {
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Pembayaran Supplier</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{supplierPayment.nomor_pembayaran}</span>
                    {supplierPayment.catatan && <span className="text-[10px] italic text-slate-400 max-w-xs truncate">{supplierPayment.catatan}</span>}
                </div>
            );
        }
        if (purchaseReturnSettlement) {
            const pr = purchaseReturnSettlement.purchaseReturn || purchaseReturnSettlement.purchase_return;
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Penyelesaian Retur</span>
                    {pr?.nomor_transaksi && <span className="text-[10px] text-slate-400 font-mono">Retur: #{pr.nomor_transaksi}</span>}
                </div>
            );
        }
        if (expense) {
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Pengeluaran: {expense.nama || "Operasional"}</span>
                    {expense.nomor_pengeluaran && <span className="text-[10px] text-slate-400 font-mono">#{expense.nomor_pengeluaran}</span>}
                    {expense.category && <span className="text-[10px] text-slate-505 font-semibold">Kat: {expense.category.nama}</span>}
                    {expense.catatan && <span className="text-[10px] italic text-slate-400 max-w-xs truncate">{expense.catatan}</span>}
                </div>
            );
        }
        if (drawerMovement) {
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Mutasi Laci Kas</span>
                    {drawerMovement.note && <span className="text-[10px] text-slate-400">{drawerMovement.note}</span>}
                </div>
            );
        }

        return (
            <div className="flex flex-col">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">{movement.kategori.replace(/_/g, ' ')}</span>
            </div>
        );
    };

    const columns: ColumnDef<CashLedger>[] = [
        {
            id: "created_at",
            header: "Tanggal & Waktu",
            accessorKey: "created_at",
            cell: ({ row }) => {
                const value = row.original.created_at;
                return (
                    <div className="text-xs font-medium text-slate-500">
                        {formatDate(value, "dd MMM yyyy")}
                        <span className="text-[10px] text-slate-400 ml-1.5 block sm:inline font-mono">
                            {formatToTime(value)}
                        </span>
                    </div>
                );
            }
        },
        {
            id: "cash_account",
            header: "Akun Kas",
            cell: ({ row }) => {
                const movement = row.original;
                const accountName = movement.cashAccount?.nama || movement.cash_account?.nama || "Akun Kas";
                return <span className="text-xs font-bold text-slate-800">{accountName}</span>;
            }
        },
        {
            id: "reference",
            header: "Referensi / Kategori",
            cell: ({ row }) => {
                const movement = row.original;
                return (
                    <div className="text-xs font-medium">
                        {renderReference(movement)}
                        {movement.sale?.nomor_transaksi && (
                            <span className="block text-[10px] text-slate-500 mt-1 italic">
                                {movement.kategori === 'sales' && movement.tipe === 'outflow' ? 'Void Reversal' : ''}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            id: "tipe",
            header: "Tipe",
            meta: {
                headerClassName: "text-center",
                cellClassName: "text-center",
            },
            cell: ({ row }) => {
                const movement = row.original;
                const amount = movement.amount;
                const isTransfer = movement.tipe === "transfer";
                const isOutflow = movement.tipe === "outflow" || (isTransfer && amount < 0);
                const isInflow = movement.tipe === "inflow" || (isTransfer && amount > 0);
                return (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isInflow
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : isOutflow
                                ? "bg-rose-50 text-rose-700 border border-rose-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}>
                        {movement.tipe}
                    </span>
                );
            }
        },
        {
            id: "amount",
            header: "Nominal",
            meta: {
                headerClassName: "text-right",
                cellClassName: "text-right",
            },
            cell: ({ row }) => {
                const movement = row.original;
                const amount = movement.amount;
                const isTransfer = movement.tipe === "transfer";
                const isInflow = movement.tipe === "inflow" || (isTransfer && amount > 0);
                return (
                    <span className={`text-xs font-extrabold tabular-nums ${isInflow ? "text-emerald-600" : "text-rose-600"}`}>
                        {isInflow ? "+" : ""}
                        {formatRupiah(amount)}
                    </span>
                );
            }
        }
    ];

    const selectedAccountName = accounts.find(a => a.uid === cashAccountUid)?.nama;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {cashAccountUid
                            ? `Jurnal Arus Kas: ${selectedAccountName || ""}`
                            : "Semua Jurnal Arus Kas"
                        }
                    </h3>
                    {cashAccountUid && (
                        <button
                            onClick={onClearSelection}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors flex items-center gap-1.5 border border-slate-200"
                        >
                            Tampilkan Semua
                            <IconX size={10} />
                        </button>
                    )}
                </div>
                {ledgerFetching && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <IconLoader2 className="animate-spin" size={12} />
                        Sinkronisasi...
                    </span>
                )}
            </div>

            {/* Filter Bar */}
            <FilterForm
                methods={filterMethods}
                onSubmit={handleFilterSubmit}
                onReset={handleFilterReset}
                cols={3}
                className="my-4"
            >
                <FormInput<LedgerFilterValues>
                    name="search"
                    label="Cari Transaksi"
                    placeholder="Cari referensi, catatan..."
                />
                <FormSelect<LedgerFilterValues>
                    name="tipe"
                    label="Tipe Transaksi"
                    options={tipeOptions}
                    placeholder="Semua Tipe"
                />
                <div className="flex gap-2 items-end w-full">
                    <FormDatePicker<LedgerFilterValues>
                        name="from"
                        label="Tanggal Mulai"
                        placeholder="Tanggal Mulai"
                    />
                    <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0 mb-3">s/d</span>
                    <FormDatePicker<LedgerFilterValues>
                        name="to"
                        label="Tanggal Akhir"
                        placeholder="Tanggal Akhir"
                    />
                </div>
            </FilterForm>

            {/* DataTable View */}
            <DataTable
                columns={columns}
                data={ledgerData?.data || []}
                isLoading={ledgerLoading}
                isFetching={ledgerFetching}
                emptyMessage="Tidak ada data arus kas yang ditemukan."
                paginationMode="server"
                page={ledgerFilters.page}
                perPage={ledgerFilters.per_page}
                onPageChange={(page) => setLedgerFilters(prev => ({ ...prev, page }))}
                meta={ledgerData?.meta ? {
                    current_page: ledgerData.meta.current_page,
                    last_page: ledgerData.meta.last_page,
                    per_page: ledgerData.meta.per_page,
                    total: ledgerData.meta.total
                } : undefined}
            />
        </div>
    );
}
