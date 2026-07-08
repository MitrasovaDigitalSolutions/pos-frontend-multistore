"use client";

import { IconArrowsExchange, IconLoader2, IconWallet } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { hasPermission, hasRole } from "@/constants/roles";
import { useCashAccounts, type CashAccount } from "../api/cash-api";
import { CashMutationDialog } from "./cash-mutation-dialog";
import { CashTransferDialog } from "./cash-transfer-dialog";
import { CashAccountCard } from "./cash-account-card";
import { CashLedgerTable } from "./cash-ledger-table";

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

    // Selected cash account state for ledger filter
    const [selectedAccountUid, setSelectedAccountUid] = useState<string | undefined>(undefined);

    const handleOpenMutation = (account: CashAccount, type: "debit" | "credit") => {
        setSelectedAccount(account);
        setMutationType(type);
        setIsMutationOpen(true);
    };

    const handleSelectAccount = (uid: string) => {
        setSelectedAccountUid(prev => (prev === uid ? undefined : uid));
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
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 h-11 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20  cursor-pointer flex items-center gap-1.5"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 gap-3.5 flex flex-col animate-pulse min-h-[110px]">
                                <div className="flex items-center justify-between pl-1.5">
                                    <div className="flex items-center gap-2.5 w-full">
                                        <div className="w-8.5 h-8.5 rounded-lg bg-slate-100 shrink-0" />
                                        <div className="space-y-2 w-full">
                                            <div className="h-3 bg-slate-100 rounded w-1/3" />
                                            <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                                        </div>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded w-10 shrink-0" />
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 pl-1.5 w-full">
                                    <div className="space-y-1.5 w-1/3">
                                        <div className="h-2 bg-slate-100 rounded w-1/2" />
                                        <div className="h-3 bg-slate-100 rounded w-full" />
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-10 h-7 bg-slate-100 rounded-lg" />
                                        <div className="w-10 h-7 bg-slate-100 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                        <IconWallet className="text-slate-300 mx-auto mb-2" size={40} />
                        <h4 className="text-sm font-bold text-slate-800">Tidak Ada Akun Kas</h4>
                        <p className="text-xs text-slate-400 mt-1">Belum ada akun kas yang terdaftar di sistem.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {[...accounts].sort((a, b) => a.nama.localeCompare(b.nama, "id")).map((account) => {
                            const isSelected = selectedAccountUid === account.uid;
                            return (
                                <CashAccountCard
                                    key={account.uid}
                                    account={account}
                                    isSelected={isSelected}
                                    onClick={() => handleSelectAccount(account.uid)}
                                    onAction={handleOpenMutation}
                                    canManage={canManageCash}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Section: Ledger Flow Table */}
            <CashLedgerTable
                key={selectedAccountUid || "all"}
                cashAccountUid={selectedAccountUid}
                onClearSelection={() => setSelectedAccountUid(undefined)}
                accounts={accounts}
            />

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
