"use client";

import React from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconChevronLeft, IconLoader2, IconArrowDownLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { toast } from "sonner";
import { useCashIn } from "../../api/cash-drawer-api";
import { cashInSchema, type CashInInput } from "../../schemas/cash-drawer-schema";


import { db } from "@/lib/db";
import { useNetworkStatus } from "@/hooks/use-network-status";
import type { CashDrawerMovement } from "../../types/cash-drawer";
import { toUTC7String } from "@/lib/date-utils";

interface CashInFormProps {
    sessionId: string;
    token?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CashInForm({ sessionId, token, onSuccess, onCancel }: CashInFormProps) {
    const cashInMutation = useCashIn();
    const isOnline = useNetworkStatus();

    const methods = useForm<CashInInput>({
        resolver: zodResolver(cashInSchema) as Resolver<CashInInput>,
        defaultValues: {
            amount: 0,
            note: "",
        },
    });

    const { handleSubmit, formState: { isSubmitting } } = methods;

    const onSubmit = async (data: CashInInput) => {
        try {
            if (isOnline) {
                await cashInMutation.mutateAsync({
                    session: sessionId,
                    payload: {
                        amount: data.amount,
                        note: data.note?.trim() || undefined,
                    },
                    token,
                });
            } else {
                const now = toUTC7String();
                const session = await db.cashDrawerSessions.get(sessionId);
                if (!session) throw new Error("Sesi laci kasir aktif tidak ditemukan di database lokal.");

                const newExpectedCash = (session.expected_cash || 0) + data.amount;
                const newCashInTotal = (session.cash_in_total || 0) + data.amount;

                await db.cashDrawerSessions.update(sessionId, {
                    expected_cash: newExpectedCash,
                    cash_in_total: newCashInTotal,
                    updated_at: now,
                });

                const movementUid = `OFFLINE-MOV-${crypto.randomUUID()}`;
                const newMovement: CashDrawerMovement = {
                    uid: movementUid,
                    cash_drawer_session_uid: sessionId,
                    user_uid: session.user_uid,
                    type: "cash_in",
                    amount: data.amount,
                    balance_before: session.expected_cash,
                    balance_after: newExpectedCash,
                    reference_uid: null,
                    reference_type: null,
                    note: data.note?.trim() || "Uang Masuk (Offline)",
                    created_at: now,
                    updated_at: now,
                };
                await db.cashDrawerMovements.add(newMovement);

                await db.offlineDrawerActions.add({
                    session_uid: sessionId,
                    type: "cash_in",
                    payload: {
                        amount: data.amount,
                        note: data.note?.trim() || undefined,
                    },
                    timestamp: now,
                    status: "pending",
                });
            }
            toast.success("Pencatatan Cash In berhasil!");
            onSuccess();
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || "Gagal mencatat uang masuk.");
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
                    disabled={cashInMutation.isPending || isSubmitting}
                >
                    <IconChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-slate-900">Cash In &mdash; Uang Masuk</span>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <FormNominalInput<CashInInput>
                        name="amount"
                        label="Jumlah Uang Masuk (Rp)"
                        placeholder="0"
                        disabled={cashInMutation.isPending || isSubmitting}
                    />

                    <FormInput<CashInInput>
                        name="note"
                        label="Catatan / Alasan Uang Masuk"
                        type="text"
                        placeholder="Contoh: Tambahan uang receh modal kembalian."
                        disabled={cashInMutation.isPending || isSubmitting}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="grow h-11 border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer bg-white"
                            disabled={cashInMutation.isPending || isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={cashInMutation.isPending || isSubmitting}
                            className="grow h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-lg shadow-emerald-600/10"
                        >
                            {cashInMutation.isPending || isSubmitting ? (
                                <IconLoader2 size={16} className="animate-spin" />
                            ) : (
                                <IconArrowDownLeft size={16} />
                            )}
                            <span>Simpan Cash In</span>
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
