"use client";

import React from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconChevronLeft, IconLoader2, IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { toast } from "sonner";
import { useCashOut } from "../../api/cash-drawer-api";
import { cashOutSchema, type CashOutInput } from "../../schemas/cash-drawer-schema";
import { useExpenseCategories } from "@/features/expenses/api/expenses-api";


import { db } from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import type { CashDrawerMovement } from "../../types/cash-drawer";
import { toUTC7String } from "@/lib/date-utils";

interface CashOutFormProps {
    sessionId: string;
    token?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CashOutForm({ sessionId, token, onSuccess, onCancel }: CashOutFormProps) {
    const cashOutMutation = useCashOut();
    const isOnline = useNetworkStatus();
    const { data: categories, isLoading: isLoadingCategories } = useExpenseCategories();

    const categoryOptions = React.useMemo(() => {
        return [
            { value: "", label: "Pengeluaran Kasir (Default)" },
            ...(categories?.map((cat) => ({
                value: cat.uid,
                label: cat.nama,
                description: cat.keterangan || undefined,
            })) || []),
        ];
    }, [categories]);

    const methods = useForm<CashOutInput>({
        resolver: zodResolver(cashOutSchema) as Resolver<CashOutInput>,
        defaultValues: {
            amount: 0,
            note: "",
            expense_category_uid: "",
        },
    });

    const { handleSubmit, formState: { isSubmitting } } = methods;

    const onSubmit = async (data: CashOutInput) => {
        try {
            if (isOnline) {
                await cashOutMutation.mutateAsync({
                    session: sessionId,
                    payload: {
                        amount: data.amount,
                        note: data.note.trim(),
                        expense_category_uid: data.expense_category_uid || null,
                    },
                    token,
                });
            } else {
                const now = toUTC7String();
                const session = await db.cashDrawerSessions.get(sessionId);
                if (!session) throw new Error("Sesi laci kasir aktif tidak ditemukan di database lokal.");

                const newExpectedCash = (session.expected_cash || 0) - data.amount;
                const newCashOutTotal = (session.cash_out_total || 0) + data.amount;

                await db.cashDrawerSessions.update(sessionId, {
                    expected_cash: newExpectedCash,
                    cash_out_total: newCashOutTotal,
                    updated_at: now,
                });

                const movementUid = `OFFLINE-MOV-${crypto.randomUUID()}`;
                const newMovement: CashDrawerMovement = {
                    uid: movementUid,
                    cash_drawer_session_uid: sessionId,
                    user_uid: session.user_uid,
                    type: "cash_out",
                    amount: data.amount,
                    balance_before: session.expected_cash,
                    balance_after: newExpectedCash,
                    reference_uid: null,
                    reference_type: null,
                    note: data.note.trim() || "Uang Keluar (Offline)",
                    created_at: now,
                    updated_at: now,
                };
                await db.cashDrawerMovements.add(newMovement);

                await db.offlineDrawerActions.add({
                    session_uid: sessionId,
                    type: "cash_out",
                    payload: {
                        amount: data.amount,
                        note: data.note.trim(),
                        expense_category_uid: data.expense_category_uid || null,
                    },
                    timestamp: now,
                    status: "pending",
                });
            }
            toast.success("Pencatatan Cash Out berhasil!");
            onSuccess();
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || "Gagal mencatat uang keluar.");
        }
    };

    return (
        <div className="space-y-4">
            {/* ── Symmetric Header ── */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer border-none bg-transparent shrink-0"
                    disabled={cashOutMutation.isPending || isSubmitting}
                >
                    <IconChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-slate-900">Cash Out &mdash; Uang Keluar</span>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <FormNominalInput<CashOutInput>
                        name="amount"
                        label="Jumlah Uang Keluar (Rp)"
                        placeholder="0"
                        disabled={cashOutMutation.isPending || isSubmitting}
                    />

                    <FormSelect<CashOutInput>
                        name="expense_category_uid"
                        label="Kategori Pengeluaran"
                        options={categoryOptions}
                        placeholder="Pilih kategori pengeluaran..."
                        isLoading={isLoadingCategories}
                        disabled={cashOutMutation.isPending || isSubmitting}
                    />

                    <FormInput<CashOutInput>
                        name="note"
                        label="Catatan / Alasan Pengeluaran"
                        type="text"
                        placeholder="Contoh: Beli lakban & kantong plastik."
                        disabled={cashOutMutation.isPending || isSubmitting}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="grow h-11 border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer bg-white"
                            disabled={cashOutMutation.isPending || isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={cashOutMutation.isPending || isSubmitting}
                            className="grow h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-lg shadow-rose-600/10"
                        >
                            {cashOutMutation.isPending || isSubmitting ? (
                                <IconLoader2 size={16} className="animate-spin" />
                            ) : (
                                <IconArrowUpRight size={16} />
                            )}
                            <span>Simpan Cash Out</span>
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
