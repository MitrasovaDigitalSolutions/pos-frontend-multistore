"use client";

import {
    IconArrowDownLeft,
    IconArrowsExchange,
    IconArrowUpRight,
    IconHistory,
    IconLoader2,
    IconMinus,
    IconPlus,
    IconWallet
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasPermission, hasRole } from "@/constants/roles";
import { useActivityLogs } from "@/features/stock/api/stock-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useCashAccounts, type CashAccount } from "../api/cash-api";
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
    const { data: logsData, isLoading: logsLoading } = useActivityLogs({ per_page: 50 });

    // Dialogue states
    const [mutationType, setMutationType] = useState<"debit" | "credit" | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<CashAccount | null>(null);
    const [isMutationOpen, setIsMutationOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);



    const handleOpenMutation = (account: CashAccount, type: "debit" | "credit") => {
        setSelectedAccount(account);
        setMutationType(type);
        setIsMutationOpen(true);
    };

    // Filter logs for cash account related actions
    const cashLogs = (logsData?.data || []).filter(
        (log) =>
            log.action === "debit_cash_account" ||
            log.action === "credit_cash_account" ||
            log.action === "transfer_cash"
    );

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



            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Accounts Card List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Daftar Akun Kas & Bank
                        </h3>
                        {accountsFetching && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <IconLoader2 className="animate-spin" size={12} />
                                Sinkronisasi...
                            </span>
                        )}
                    </div>

                    {accountsLoading ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                            <IconLoader2 className="animate-spin text-emerald-600 mx-auto" size={32} />
                            <p className="text-xs text-slate-400 mt-2">Memuat daftar akun kas...</p>
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                            <IconWallet className="text-slate-300 mx-auto mb-2" size={40} />
                            <h4 className="text-sm font-bold text-slate-800">Tidak Ada Akun Kas</h4>
                            <p className="text-xs text-slate-400 mt-1">Belum ada akun kas yang terdaftar di sistem.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {accounts.map((account) => {
                                const isBank = account.tipe.toLowerCase() === "bank" || account.tipe.toLowerCase() === "edc";
                                return (
                                    <div
                                        key={account.id}
                                        className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-md relative overflow-hidden flex flex-col justify-between ${isBank
                                            ? "border-blue-100/70 hover:border-blue-300/60"
                                            : "border-emerald-100/70 hover:border-emerald-300/60"
                                            }`}
                                    >
                                        {/* Card Header & Details */}
                                        <div className="p-5 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-extrabold text-slate-800 text-xs">
                                                        {account.nama}
                                                    </h4>
                                                    {account.nomor_rekening ? (
                                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                            {account.nomor_rekening}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] text-slate-400 italic">
                                                            Tanpa Nomor Rekening
                                                        </span>
                                                    )}
                                                </div>

                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isBank
                                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    }`}>
                                                    {account.tipe}
                                                </span>
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
                                                    onClick={() => handleOpenMutation(account, "debit")}
                                                    className="h-8 text-[10px] font-bold text-emerald-700 border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer flex items-center justify-center gap-1 rounded-lg"
                                                >
                                                    <IconPlus size={12} />
                                                    Debit (In)
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenMutation(account, "credit")}
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

                {/* Audit Logs Sidebar */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <IconHistory size={15} />
                        Aktivitas Kas Terbaru
                    </h3>

                    <Card className="border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-5">
                            {logsLoading ? (
                                <div className="py-8 text-center">
                                    <IconLoader2 className="animate-spin text-slate-300 mx-auto" size={24} />
                                    <p className="text-xs text-slate-400 mt-2">Memuat log aktivitas...</p>
                                </div>
                            ) : cashLogs.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
                                    <IconHistory size={24} className="text-slate-300" />
                                    <p className="text-xs">Belum ada riwayat transaksi kas dicatat.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1">
                                    {cashLogs.map((log) => {
                                        const isDebit = log.action === "debit_cash_account";
                                        const isCredit = log.action === "credit_cash_account";

                                        let icon = <IconArrowsExchange size={14} />;
                                        let iconColor = "bg-blue-50 text-blue-600 border-blue-100";

                                        if (isDebit) {
                                            icon = <IconArrowDownLeft size={14} />;
                                            iconColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                                        } else if (isCredit) {
                                            icon = <IconArrowUpRight size={14} />;
                                            iconColor = "bg-rose-50 text-rose-600 border-rose-100";
                                        }

                                        return (
                                            <div key={log.id} className="flex items-start gap-3 text-xs pb-3.5 border-b border-slate-50 last:border-0 last:pb-0">
                                                <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${iconColor}`}>
                                                    {icon}
                                                </div>
                                                <div className="space-y-1 min-w-0">
                                                    <p className="text-slate-700 font-medium leading-relaxed break-words">
                                                        {log.description}
                                                    </p>
                                                    <div className="flex justify-between items-center text-[10px] text-slate-400 gap-2">
                                                        <span className="font-semibold text-slate-500 font-mono">
                                                            {log.user ? `@${log.user.username}` : "sistem"}
                                                        </span>
                                                        <span>
                                                            {new Date(log.created_at).toLocaleTimeString("id-ID", {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
