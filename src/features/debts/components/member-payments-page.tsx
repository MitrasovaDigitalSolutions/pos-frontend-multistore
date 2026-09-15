"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { IconHistory } from "@tabler/icons-react";
import { useMemberPaymentsPage } from "../hooks/use-member-payments-page";
import { getMemberPaymentsColumns } from "./member-payments/member-payments-columns";
import { MemberPaymentCard } from "./member-payments/member-payment-card";
import { MemberPaymentsFilter } from "./member-payments/member-payments-filter";
import { MemberPaymentVoidDialog } from "./member-payment-void-dialog";
import { HutangTutorialController } from "../tutorial/components/hutang-tutorial-controller";

export function MemberPaymentsPage() {
    const {
        hasViewMembers,
        hasManageMembers,
        page,
        setPage,
        perPage,
        setPerPage,
        payments,
        meta,
        isLoading,
        isFetching,
        filterMethods,
        handleFilterSubmit,
        handleFilterReset,
        voidPayment,
        isVoidOpen,
        setIsVoidOpen,
        handleOpenVoid,
        handleConfirmVoid,
        isVoidPending,
    } = useMemberPaymentsPage();

    const columns = useMemo(() => getMemberPaymentsColumns(), []);

    if (!hasViewMembers) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Akses Ditolak</p>
                <p className="text-xs text-slate-400 mt-1">
                    Anda tidak memiliki izin untuk melihat data pembayaran hutang member.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-28 sm:pb-8">
            {/* Page Header */}
            <div id="pembayaran-member-header" className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                    <IconHistory size={18} className="stroke-[2.5]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pembayaran Hutang Member</h3>
                    <p className="text-[10px] text-slate-400">
                        Riwayat pembayaran dan cicilan hutang member dari kasir.
                    </p>
                </div>
            </div>

            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                            Daftar Pembayaran Hutang Member
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-400">
                            Gunakan kolom cari member untuk memfilter data riwayat pembayaran.
                        </p>
                    </div>
                </div>

                <div id="pembayaran-member-filter-form" className="scroll-mt-24">
                    <MemberPaymentsFilter
                        methods={filterMethods}
                        onSubmit={handleFilterSubmit}
                        onReset={handleFilterReset}
                    />
                </div>

                <div id="pembayaran-member-table">
                    <DataTable
                        columns={columns}
                        data={payments}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        emptyMessage="Tidak ada data pembayaran hutang yang ditemukan."
                        page={page}
                        perPage={perPage}
                        onPageChange={setPage}
                        onPerPageChange={(newPerPage) => {
                            setPerPage(newPerPage);
                            setPage(1);
                        }}
                        meta={meta}
                        entityName="pembayaran hutang member"
                        virtualize={true}
                        estimateRowHeight={52}
                        onDelete={handleOpenVoid}
                        hideDelete={(p) => {
                            const status = p.status?.toLowerCase();
                            const isAlreadyVoid =
                                status === "void" ||
                                status === "voided" ||
                                status === "batal" ||
                                status === "cancelled";
                            return !hasManageMembers || isAlreadyVoid;
                        }}
                        renderCardItem={(row) => (
                            <MemberPaymentCard
                                payment={row.original}
                                canManageMembers={hasManageMembers}
                                onDelete={handleOpenVoid}
                            />
                        )}
                        gridClassName="grid-cols-1 sm:grid-cols-2 gap-3"
                    />
                </div>

                <MemberPaymentVoidDialog
                    open={isVoidOpen}
                    onOpenChange={setIsVoidOpen}
                    payment={voidPayment}
                    onConfirm={handleConfirmVoid}
                    isLoading={isVoidPending}
                />
            </section>

            <HutangTutorialController />
        </div>
    );
}

export default MemberPaymentsPage;
