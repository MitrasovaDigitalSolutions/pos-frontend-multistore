"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconChevronLeft, IconDoorExit, IconLoader2 } from "@tabler/icons-react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useCloseCashDrawer } from "../../api/cash-drawer-api";
import { closeCashDrawerSchema, type CloseCashDrawerInput } from "../../schemas/cash-drawer-schema";
import { signOut } from "@/lib/auth-helpers";

interface CloseShiftFormProps {
    sessionId: number;
    expectedCash: number;
    token?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CloseShiftForm({
    sessionId,
    expectedCash,
    token,
    onSuccess,
    onCancel,
}: CloseShiftFormProps) {
    const closeMutation = useCloseCashDrawer();

    const methods = useForm<CloseCashDrawerInput>({
        resolver: zodResolver(closeCashDrawerSchema) as Resolver<CloseCashDrawerInput>,
        defaultValues: {
            actual_closing_balance: 0,
            closing_note: "",
        },
    });

    const { handleSubmit, formState: { isSubmitting } } = methods;

    const actualClosing = useWatch({ control: methods.control, name: "actual_closing_balance" }) || 0;
    const diff = actualClosing - expectedCash;

    const onSubmit = async (data: CloseCashDrawerInput) => {
        try {
            await closeMutation.mutateAsync({
                session: sessionId,
                payload: {
                    actual_closing_balance: data.actual_closing_balance,
                    closing_note: data.closing_note?.trim() || undefined,
                },
                token,
            });
            toast.success("Sesi shift laci kasir berhasil ditutup.");
            onSuccess();
            await signOut({ callbackUrl: "/login" });
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || "Gagal menutup laci kasir.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader className="pb-4 border-b border-slate-100">
                <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1 rounded hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer text-slate-500"
                        disabled={closeMutation.isPending || isSubmitting}
                    >
                        <IconChevronLeft size={18} />
                    </button>
                    <span>Akhiri Shift & Hitung Uang Laci</span>
                </DialogTitle>
            </DialogHeader>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Total Perkiraan di Laci (Expected Cash)</span>
                <span className="text-slate-800 font-bold text-[13px] tabular-nums">
                    {formatRupiah(expectedCash)}
                </span>
            </div>

            <div className="space-y-4 pt-2">
                <FormProvider {...methods}>
                    <FormNominalInput<CloseCashDrawerInput>
                        name="actual_closing_balance"
                        label="Jumlah Saldo Akhir Nyata (Fisik Laci)"
                        placeholder="0"
                        disabled={closeMutation.isPending || isSubmitting}
                    />

                    {actualClosing !== undefined && !isNaN(actualClosing) && (
                        <div className="text-[11px] font-bold mt-1.5 flex justify-between px-1">
                            <span className="text-slate-400">Selisih Hitung:</span>
                            {diff === 0 ? (
                                <span className="text-emerald-600 font-extrabold">Pas (Tidak ada selisih)</span>
                            ) : diff > 0 ? (
                                <span className="text-blue-600 font-extrabold">Kelebihan: +{formatRupiah(diff)}</span>
                            ) : (
                                <span className="text-rose-600 font-extrabold">Kekurangan: {formatRupiah(diff)}</span>
                            )}
                        </div>
                    )}

                    <FormInput<CloseCashDrawerInput>
                        name="closing_note"
                        label="Catatan Penutupan Shift (Opsional)"
                        type="text"
                        placeholder="Contoh: Selisih kurang seribu rupiah."
                        disabled={closeMutation.isPending || isSubmitting}
                    />
                </FormProvider>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="grow h-11 border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer bg-white"
                        disabled={closeMutation.isPending || isSubmitting}
                    >
                        Kembali
                    </Button>
                    <Button
                        type="submit"
                        disabled={closeMutation.isPending || isSubmitting}
                        className="grow h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg shadow-rose-600/10"
                    >
                        {closeMutation.isPending || isSubmitting ? (
                            <IconLoader2 size={16} className="animate-spin" />
                        ) : (
                            <IconDoorExit size={16} />
                        )}
                        <span>Tutup Shift & Laci</span>
                    </Button>
                </div>
            </div>
        </form>
    );
}
