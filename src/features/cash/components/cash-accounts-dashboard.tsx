"use client";

import {
    IconArrowsExchange,
    IconLoader2,
    IconWallet,
    IconPlus,
    IconFilterOff,
    IconLock,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Scrollable } from "@/components/ui/scrollable";
import { hasPermission, hasRole } from "@/constants/roles";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    useCashAccounts,
    useDeleteCashAccount,
    type CashAccount,
} from "../api/cash-api";
import { useCashMapping } from "../hooks/use-cash-mapping";
import { CashMutationDialog } from "./cash-mutation-dialog";
import { CashTransferDialog } from "./cash-transfer-dialog";
import { CashAccountDialog } from "./cash-account-dialog";
import { CashAccountCard } from "./cash-account-card";
import { CashLedgerTable } from "./cash-ledger-table";

export function CashAccountsDashboard() {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const canManageCash =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_cash_accounts");

    // Queries: Cash accounts & Mapping settings
    const {
        data: accounts = [],
        isLoading: accountsLoading,
        isFetching: accountsFetching,
    } = useCashAccounts();

    const {
        isSettingsFetching,
        isAccountMapped,
        getAccountMapping,
        mappedAccountsCount,
    } = useCashMapping();

    const isSyncing = accountsFetching || isSettingsFetching;

    // Mutations
    const deleteAccountMutation = useDeleteCashAccount();

    // Dialogue states for mutation & transfer
    const [mutationType, setMutationType] = useState<"debit" | "credit" | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<CashAccount | null>(null);
    const [isMutationOpen, setIsMutationOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    // Dialogue states for Create & Edit cash account
    const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null);

    // Dialogue states for Delete cash account
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<CashAccount | null>(null);

    // Selected cash account state for ledger filter
    const [selectedAccountUid, setSelectedAccountUid] = useState<string | undefined>(undefined);

    const handleOpenMutation = (account: CashAccount, type: "debit" | "credit") => {
        setSelectedAccount(account);
        setMutationType(type);
        setIsMutationOpen(true);
    };

    const handleSelectAccount = (uid: string) => {
        setSelectedAccountUid((prev) => (prev === uid ? undefined : uid));
    };

    const handleOpenCreate = () => {
        setEditingAccount(null);
        setIsAccountDialogOpen(true);
    };

    const handleOpenEdit = (account: CashAccount) => {
        if (isAccountMapped(account.uid)) {
            toast.warning(`Akun kas "${account.nama}" telah dimapping untuk transaksi dan tidak dapat diubah.`);
            return;
        }
        setEditingAccount(account);
        setIsAccountDialogOpen(true);
    };

    const handleOpenDelete = (account: CashAccount) => {
        if (isAccountMapped(account.uid)) {
            toast.warning(`Akun kas "${account.nama}" telah dimapping untuk transaksi dan tidak dapat dihapus.`);
            return;
        }
        setAccountToDelete(account);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!accountToDelete) return;

        if (isAccountMapped(accountToDelete.uid)) {
            toast.error(`Akun kas "${accountToDelete.nama}" telah dimapping untuk transaksi dan tidak dapat dihapus.`);
            setIsDeleteDialogOpen(false);
            setAccountToDelete(null);
            return;
        }

        deleteAccountMutation.mutate(accountToDelete.uid, {
            onSuccess: () => {
                toast.success(`Akun kas "${accountToDelete.nama}" berhasil dihapus.`);
                if (selectedAccountUid === accountToDelete.uid) {
                    setSelectedAccountUid(undefined);
                }
                setIsDeleteDialogOpen(false);
                setAccountToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus akun kas.");
            },
        });
    };

    return (
        <div className="space-y-5 max-w-7xl mx-auto pb-8">
            {/* Header Block - Compact & Ergonomic */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-inner shrink-0">
                        <IconWallet size={20} />
                    </div>
                    <div>
                        <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                            Kelola Kas & Rekening Bank
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                            Kelola saldo kas toko, rekening bank transfer, laci kasir, dan catat mutasi keluar/masuk.
                        </p>
                    </div>
                </div>

                {canManageCash && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setIsTransferOpen(true)}
                            className="w-full sm:w-auto border-blue-200 text-blue-700 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 font-bold text-xs px-4 h-9 rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <IconArrowsExchange size={15} />
                            <span>Transfer Saldo</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Cash Accounts Selection Section - 1 Row Horizontal Scrollable */}
            <div className="space-y-2">
                <div className="flex justify-between items-center px-0.5">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Daftar Akun Kas & Bank
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                            {accounts.length} Akun
                        </span>
                        {mappedAccountsCount > 0 && (
                            <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200/90 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800 flex items-center gap-1 shadow-2xs">
                                <IconLock size={10} className="text-violet-600 dark:text-violet-400 shrink-0" />
                                <span>{mappedAccountsCount} Akun Transaksi</span>
                            </span>
                        )}
                        {selectedAccountUid && (
                            <button
                                type="button"
                                onClick={() => setSelectedAccountUid(undefined)}
                                className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold ml-1 cursor-pointer"
                            >
                                <IconFilterOff size={12} />
                                Tampilkan Semua
                            </button>
                        )}
                    </div>

                    {isSyncing && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <IconLoader2 className="animate-spin" size={12} />
                            Sinkronisasi...
                        </span>
                    )}
                </div>

                {accountsLoading ? (
                    <Scrollable orientation="horizontal" className="w-full pb-2">
                        <div className="flex items-stretch gap-2.5 min-w-full py-0.5">
                            {canManageCash && (
                                <div className="w-[130px] sm:w-[145px] shrink-0 bg-slate-50/60 border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 animate-pulse min-h-[105px]">
                                    <div className="w-8 h-8 rounded-lg bg-slate-200" />
                                    <div className="w-16 h-3 bg-slate-200 rounded" />
                                </div>
                            )}
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[270px] sm:w-[290px] shrink-0 bg-white border border-slate-100 rounded-xl p-3 gap-2 flex flex-col animate-pulse min-h-[105px]"
                                >
                                    <div className="flex items-center justify-between pl-1">
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="w-7.5 h-7.5 rounded-lg bg-slate-100 shrink-0" />
                                            <div className="space-y-1.5 w-full">
                                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                                                <div className="h-2 bg-slate-100 rounded w-1/3" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 pl-1 w-full">
                                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                                        <div className="w-14 h-6 bg-slate-100 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Scrollable>
                ) : accounts.length === 0 ? (
                    <Scrollable orientation="horizontal" className="w-full pb-2">
                        <div className="flex items-stretch gap-2.5 min-w-full py-0.5">
                            {canManageCash && (
                                <button
                                    type="button"
                                    onClick={handleOpenCreate}
                                    className="w-[130px] sm:w-[145px] shrink-0 rounded-xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-500 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-3 gap-1.5 text-center group select-none min-h-[105px]"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-105 transition-all shadow-xs">
                                        <IconPlus size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="leading-tight">
                                        <span className="text-xs font-black text-emerald-800 group-hover:text-emerald-900 block">
                                            Buat Kas Baru
                                        </span>
                                    </div>
                                </button>
                            )}
                            <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 text-slate-500 min-h-[105px]">
                                <IconWallet className="text-slate-300 shrink-0" size={28} />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-700">Belum Ada Akun Kas</h4>
                                    <p className="text-[10px] text-slate-400">
                                        Klik tombol &quot;Buat Kas Baru&quot; di samping untuk menambahkan akun kas pertama.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Scrollable>
                ) : (
                    <Scrollable orientation="horizontal" className="w-full pb-2">
                        <div className="flex items-stretch gap-2.5 min-w-full py-0.5">
                            {/* Tombol Buat Kas Baru - Posisi Paling Kiri */}
                            {canManageCash && (
                                <button
                                    type="button"
                                    onClick={handleOpenCreate}
                                    className="w-[130px] sm:w-[145px] shrink-0 rounded-xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-500 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-3 gap-1.5 text-center group select-none min-h-[105px]"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-105 transition-all shadow-xs">
                                        <IconPlus size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="leading-tight">
                                        <span className="text-xs font-black text-emerald-800 group-hover:text-emerald-900 block">
                                            Buat Kas Baru
                                        </span>
                                    </div>
                                </button>
                            )}

                            {/* Daftar Kartu Akun Kas */}
                            {[...accounts]
                                .sort((a, b) => a.nama.localeCompare(b.nama, "id"))
                                .map((account) => {
                                    const isSelected = selectedAccountUid === account.uid;
                                    const isMapped = isAccountMapped(account.uid);
                                    const mappingInfo = getAccountMapping(account.uid);
                                    return (
                                        <CashAccountCard
                                            key={account.uid}
                                            account={account}
                                            isSelected={isSelected}
                                            isMapped={isMapped}
                                            mappingInfo={mappingInfo}
                                            onClick={() => handleSelectAccount(account.uid)}
                                            onAction={handleOpenMutation}
                                            onEdit={handleOpenEdit}
                                            onDelete={handleOpenDelete}
                                            canManage={canManageCash}
                                            className="w-[270px] sm:w-[290px] shrink-0"
                                        />
                                    );
                                })}
                        </div>
                    </Scrollable>
                )}
            </div>

            {/* Bottom Section: Ledger Flow Table */}
            <CashLedgerTable
                key={selectedAccountUid || "all"}
                cashAccountUid={selectedAccountUid}
                onClearSelection={() => setSelectedAccountUid(undefined)}
                accounts={accounts}
            />

            {/* Cash Account Dialog (Create / Edit) */}
            <CashAccountDialog
                open={isAccountDialogOpen}
                onOpenChange={setIsAccountDialogOpen}
                editingAccount={editingAccount}
                isMapped={editingAccount ? isAccountMapped(editingAccount.uid) : false}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Hapus Akun Kas?"
                description={
                    <div className="space-y-2 text-xs">
                        <p>
                            Apakah Anda yakin ingin menghapus akun kas{" "}
                            <strong className="text-slate-800 font-bold">
                                {accountToDelete?.nama}
                            </strong>
                            ?
                        </p>
                        {accountToDelete && accountToDelete.saldo > 0 ? (
                            <p className="text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg leading-relaxed">
                                <strong>Perhatian:</strong> Akun ini masih memiliki saldo sebesar{" "}
                                <strong>{formatRupiah(accountToDelete.saldo)}</strong>. Sistem akan menolak
                                penghapusan akun yang saldonya belum 0.
                            </p>
                        ) : (
                            <p className="text-slate-500">
                                Akun kas hanya dapat dihapus jika saldo bernilai 0 dan belum memiliki riwayat transaksi atau keterkaitan data.
                            </p>
                        )}
                    </div>
                }
                confirmText="Ya, Hapus Akun"
                cancelText="Batal"
                variant="danger"
                isLoading={deleteAccountMutation.isPending}
                onConfirm={handleConfirmDelete}
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
