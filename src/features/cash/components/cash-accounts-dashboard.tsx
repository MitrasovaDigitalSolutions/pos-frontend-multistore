"use client";

import {
    IconArrowsExchange,
    IconCheck,
    IconLoader2,
    IconMinus,
    IconPlus,
    IconWallet,
    IconX
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FilterForm } from "@/components/forms/filter-form";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { hasPermission, hasRole } from "@/constants/roles";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useCashAccounts, useCashFlow, type CashAccount, type CashLedger } from "../api/cash-api";
import { CashMutationDialog } from "./cash-mutation-dialog";
import { CashTransferDialog } from "./cash-transfer-dialog";

export function CashAccountsDashboard() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const canManageCash =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_cash_accounts");

    // Queries
    const { data: accounts = [], isLoading: accountsLoading, isFetching: accountsFetching } = useCashAccounts();

    // Dialogue states
    const [mutationType, setMutationType] = useState<"debit" | "credit" | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<CashAccount | null>(null);
    const [isMutationOpen, setIsMutationOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    // Ledger filter states
    const [ledgerFilters, setLedgerFilters] = useState({
        page: 1,
        per_page: 15,
        cash_account_uid: undefined as string | undefined,
        tipe: "" as string,
        search: "" as string,
        from: "" as string,
        to: "" as string,
    });

    interface LedgerFilterValues {
        search: string;
        tipe: string;
        from: string;
        to: string;
    }

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

    const handleOpenMutation = (account: CashAccount, type: "debit" | "credit") => {
        setSelectedAccount(account);
        setMutationType(type);
        setIsMutationOpen(true);
    };

    const renderPaginationItemsForLedger = (meta: { last_page: number; current_page: number }) => {
        const pageNumbers: (number | string)[] = [];
        const maxVisiblePages = 5;
        const currentPageVal = ledgerFilters.page;

        if (meta.last_page <= maxVisiblePages) {
            for (let i = 1; i <= meta.last_page; i++) {
                pageNumbers.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPageVal - 1);
            const endPage = Math.min(meta.last_page, currentPageVal + 1);

            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) pageNumbers.push("ellipsis-start");
            }

            for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 && i !== meta.last_page) {
                    pageNumbers.push(i);
                }
            }

            if (endPage < meta.last_page) {
                if (endPage < meta.last_page - 1) pageNumbers.push("ellipsis-end");
                pageNumbers.push(meta.last_page);
            }
        }

        return pageNumbers.map((p, idx) => {
            if (typeof p === "string") {
                return (
                    <PaginationItem key={`${p}-${idx}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
            return (
                <PaginationItem key={p}>
                    <PaginationLink
                        isActive={p === currentPageVal}
                        onClick={() => setLedgerFilters(prev => ({ ...prev, page: p }))}
                    >
                        {p}
                    </PaginationLink>
                </PaginationItem>
            );
        });
    };

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
                    {expense.category && <span className="text-[10px] text-slate-500 font-semibold">Kat: {expense.category.nama}</span>}
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



    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 shadow-inner">
                        <IconWallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-base font-extrabold text-slate-900">Kelola Kas & Rekening Bank</h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Kelola saldo kas toko, rekening bank transfer, EDC, dan catat mutasi keluar/masuk.
                        </p>
                    </div>
                </div>

                {canManageCash && (
                    <Button
                        onClick={() => setIsTransferOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 h-11 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    >
                        <IconArrowsExchange size={16} />
                        Transfer Saldo
                    </Button>
                )}
            </div>

            {/* Cash Accounts Selection Section */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Pilih Akun Kas & Bank
                    </h3>
                    {accountsFetching && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <IconLoader2 className="animate-spin" size={12} />
                            Sinkronisasi...
                        </span>
                    )}
                </div>

                {accountsLoading ? (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                        <IconLoader2 className="animate-spin text-emerald-600 mx-auto" size={32} />
                        <p className="text-xs text-slate-400 mt-2">Memuat daftar akun kas...</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                        <IconWallet className="text-slate-300 mx-auto mb-2" size={40} />
                        <h4 className="text-sm font-bold text-slate-800">Tidak Ada Akun Kas</h4>
                        <p className="text-xs text-slate-400 mt-1">Belum ada akun kas yang terdaftar di sistem.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {accounts.map((account) => {
                            const isSelected = ledgerFilters.cash_account_uid === account.uid;
                            const isBank = account.tipe.toLowerCase() === "bank" || account.tipe.toLowerCase() === "edc";
                            return (
                                <div
                                    key={account.uid}
                                    onClick={() => {
                                        setLedgerFilters(prev => ({
                                            ...prev,
                                            cash_account_uid: isSelected ? undefined : account.uid,
                                            page: 1
                                        }));
                                    }}
                                    className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer relative overflow-hidden flex flex-col justify-between select-none ${isSelected
                                        ? isBank
                                            ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md scale-[1.01]"
                                            : "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md scale-[1.01]"
                                        : isBank
                                            ? "border-blue-100/70 hover:border-blue-300/60 hover:-translate-y-0.5"
                                            : "border-emerald-100/70 hover:border-emerald-300/60 hover:-translate-y-0.5"
                                        }`}
                                >
                                    {/* Card Header & Details */}
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="space-y-1 min-w-0">
                                                <h4 className="font-extrabold text-slate-800 text-xs truncate" title={account.nama}>
                                                    {account.nama}
                                                </h4>
                                                {account.nomor_rekening ? (
                                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                                                        {account.nomor_rekening}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-slate-400 italic block">
                                                        Tanpa Nomor Rekening
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isBank
                                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    }`}>
                                                    {account.tipe}
                                                </span>
                                                {isSelected && (
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${isBank ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                                                        }`}>
                                                        <IconCheck size={10} strokeWidth={3} />
                                                        Dipilih
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Saldo */}
                                        <div>
                                            <span className="text-[9px] text-slate-400 font-medium block">
                                                Saldo Kas
                                            </span>
                                            <span className="text-base font-extrabold text-slate-800 tracking-tight">
                                                {formatRupiah(account.saldo)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Actions (only with permission) */}
                                    {canManageCash && (
                                        <div className="bg-slate-50/50 border-t border-slate-100 p-3 grid grid-cols-2 gap-2 mt-auto">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenMutation(account, "debit");
                                                }}
                                                className="h-8 text-[10px] font-bold text-emerald-700 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer flex items-center justify-center gap-1 rounded-lg"
                                            >
                                                <IconPlus size={12} />
                                                Debit (In)
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenMutation(account, "credit");
                                                }}
                                                className="h-8 text-[10px] font-bold text-rose-700 border-rose-100 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-200 cursor-pointer flex items-center justify-center gap-1 rounded-lg"
                                            >
                                                <IconMinus size={12} />
                                                Kredit (Out)
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Section: Ledger */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {ledgerFilters.cash_account_uid
                                ? `Jurnal Arus Kas: ${accounts.find(a => a.uid === ledgerFilters.cash_account_uid)?.nama || ""}`
                                : "Semua Jurnal Arus Kas"
                            }
                        </h3>
                        {ledgerFilters.cash_account_uid && (
                            <button
                                onClick={() => setLedgerFilters(prev => ({ ...prev, cash_account_uid: undefined, page: 1 }))}
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
                    className="my-0"
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

                {/* Table View */}
                <div className="border border-slate-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
                    {ledgerFetching && (
                        <div className="h-0.5 bg-emerald-50 overflow-hidden relative">
                            <div className="h-full bg-emerald-500 animate-shimmer-loading w-[35%] rounded-full absolute" />
                        </div>
                    )}

                    <div className="overflow-x-auto scrollbar-thin">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-[10px] font-bold text-slate-500 py-3 px-4 uppercase tracking-wider">Tanggal & Waktu</th>
                                    <th className="text-[10px] font-bold text-slate-500 py-3 px-4 uppercase tracking-wider">Akun Kas</th>
                                    <th className="text-[10px] font-bold text-slate-500 py-3 px-4 uppercase tracking-wider">Referensi / Kategori</th>
                                    <th className="text-[10px] font-bold text-slate-500 py-3 px-4 uppercase tracking-wider text-center">Tipe</th>
                                    <th className="text-[10px] font-bold text-slate-500 py-3 px-4 uppercase tracking-wider text-right">Nominal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {ledgerLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                                            <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                                            <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-48" /></td>
                                            <td className="py-4 px-4 flex justify-center"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                                            <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : !ledgerData || ledgerData.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-slate-400 text-xs font-medium">
                                            Tidak ada data arus kas yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    ledgerData.data.map((movement) => {
                                        const accountName = movement.cashAccount?.nama || movement.cash_account?.nama || "Akun Kas";
                                        const amount = movement.amount;
                                        const isTransfer = movement.tipe === "transfer";
                                        const isOutflow = movement.tipe === "outflow" || (isTransfer && amount < 0);
                                        const isInflow = movement.tipe === "inflow" || (isTransfer && amount > 0);

                                        return (
                                            <tr key={movement.uid} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="py-3.5 px-4 text-xs font-medium text-slate-500">
                                                    {new Date(movement.created_at).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    })}
                                                    <span className="text-[10px] text-slate-400 ml-1.5 block sm:inline font-mono">
                                                        {new Date(movement.created_at).toLocaleTimeString("id-ID", {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-xs font-bold text-slate-800">
                                                    {accountName}
                                                </td>
                                                <td className="py-3.5 px-4 text-xs font-medium">
                                                    {renderReference(movement)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isInflow
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                        : isOutflow
                                                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                                                            : "bg-blue-50 text-blue-700 border border-blue-100"
                                                        }`}>
                                                        {movement.tipe}
                                                    </span>
                                                </td>
                                                <td className={`py-3.5 px-4 text-xs font-extrabold text-right tabular-nums ${isInflow ? "text-emerald-600" : "text-rose-600"
                                                    }`}>
                                                    {isInflow ? "+" : ""}
                                                    {formatRupiah(amount)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {ledgerData && ledgerData.meta && ledgerData.meta.total > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 p-4 gap-4 text-xs bg-slate-50/30">
                            <span className="text-slate-550 font-semibold">
                                Menampilkan {((ledgerFilters.page - 1) * ledgerFilters.per_page) + 1} - {Math.min(ledgerFilters.page * ledgerFilters.per_page, ledgerData.meta.total)} dari {ledgerData.meta.total} transaksi
                            </span>
                            {ledgerData.meta.last_page > 1 && (
                                <Pagination className="w-auto mx-0">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setLedgerFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                                disabled={ledgerFilters.page === 1}
                                            />
                                        </PaginationItem>
                                        {renderPaginationItemsForLedger(ledgerData.meta)}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setLedgerFilters(prev => ({ ...prev, page: Math.min(ledgerData.meta.last_page, prev.page + 1) }))}
                                                disabled={ledgerFilters.page === ledgerData.meta.last_page}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mutation Dialog (Debit/Credit) */}
            <CashMutationDialog
                open={isMutationOpen}
                onOpenChange={setIsMutationOpen}
                type={mutationType}
                account={selectedAccount}
            />

            {/* Transfer Dialog */}
            <CashTransferDialog
                open={isTransferOpen}
                onOpenChange={setIsTransferOpen}
                accounts={accounts}
            />
        </div>
    );
}
