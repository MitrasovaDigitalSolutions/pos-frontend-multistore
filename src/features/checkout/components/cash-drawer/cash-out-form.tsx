"use client";

import React from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { toast } from "sonner";
import { useCashOut } from "../../api/cash-drawer-api";
import { cashOutSchema, type CashOutInput } from "../../schemas/cash-drawer-schema";
import { IconChevronLeft, IconLoader2, IconArrowUpRight } from "@tabler/icons-react";

interface CashOutFormProps {
    sessionId: number;
    token?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CashOutForm({ sessionId, token, onSuccess, onCancel }: CashOutFormProps) {
    const cashOutMutation = useCashOut();

    const methods = useForm<CashOutInput>({
        resolver: zodResolver(cashOutSchema) as Resolver<CashOutInput>,
        defaultValues: {
            amount: 0,
            note: "",
        },
    });

    const { handleSubmit, formState: { isSubmitting } } = methods;

    const onSubmit = async (data: CashOutInput) => {
        try {
            await cashOutMutation.mutateAsync({
                session: sessionId,
                payload: {
                    amount: data.amount,
                    note: data.note.trim(),
                },
                token,
            });
            toast.success("Pencatatan Cash Out berhasil!");
            onSuccess();
        } catch (err: any) {
            toast.error(err?.message || "Gagal mencatat uang keluar.");
        }
    };

    return (
        <div className="space-y-4">
            <DialogHeader className="pb-4 border-b border-slate-100">
                <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1 rounded hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer text-slate-500"
                        disabled={cashOutMutation.isPending || isSubmitting}
                    >
                        <IconChevronLeft size={18} />
                    </button>
                    <span>Pencatatan Cash Out (Uang Keluar)</span>
                </DialogTitle>
            </DialogHeader>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <FormInput<CashOutInput>
                        name="amount"
                        label="Jumlah Uang Keluar (Rp)"
                        type="number"
                        placeholder="0"
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
