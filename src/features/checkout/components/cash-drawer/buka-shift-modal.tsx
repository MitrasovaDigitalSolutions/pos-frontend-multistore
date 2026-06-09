"use client";

import React from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { toast } from "sonner";
import { useOpenCashDrawer } from "../../api/cash-drawer-api";
import { openCashDrawerSchema, type OpenCashDrawerInput } from "../../schemas/cash-drawer-schema";
import { IconLock, IconLoader2, IconDeviceFloppy, IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

interface BukaShiftModalProps {
    open: boolean;
    token?: string;
    onSuccess: (sessionId: number) => void;
}

export function BukaShiftModal({ open, token, onSuccess }: BukaShiftModalProps) {
    const openMutation = useOpenCashDrawer();

    const methods = useForm<OpenCashDrawerInput>({
        resolver: zodResolver(openCashDrawerSchema) as Resolver<OpenCashDrawerInput>,
        defaultValues: {
            opening_balance: 100000,
            opening_note: "Modal awal shift.",
        },
    });

    const { handleSubmit, formState: { isSubmitting } } = methods;

    const onSubmit = async (data: OpenCashDrawerInput) => {
        try {
            const res = await openMutation.mutateAsync({
                payload: {
                    opening_balance: data.opening_balance,
                    opening_note: data.opening_note?.trim() || undefined,
                },
                token,
            });

            if (res?.data?.id) {
                toast.success("Shift kasir berhasil dibuka!");
                onSuccess(res.data.id);
            } else {
                toast.error("Gagal mendapatkan ID sesi laci kasir.");
            }
        } catch (err: any) {
            const message = err?.message || "Gagal membuka laci kasir.";
            toast.error(message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="max-w-md bg-white rounded-2xl border-slate-100 p-6 shadow-2xl" showCloseButton={false}>
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <IconLock size={18} />
                        </div>
                        <div>
                            <span className="block text-sm font-extrabold">Buka Shift Laci Kasir</span>
                            <span className="block text-[11px] font-medium text-slate-400 mt-0.5">
                                Masukkan saldo awal laci untuk memulai shift.
                            </span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="pt-4 space-y-4">
                        <FormInput<OpenCashDrawerInput>
                            name="opening_balance"
                            label="Saldo Awal (Rp)"
                            type="number"
                            placeholder="0"
                            disabled={openMutation.isPending || isSubmitting}
                        />

                        <FormInput<OpenCashDrawerInput>
                            name="opening_note"
                            label="Catatan Pembukaan (Opsional)"
                            type="text"
                            placeholder="Contoh: Modal awal shift pagi."
                            disabled={openMutation.isPending || isSubmitting}
                        />

                        <div className="grid grid-cols-12 gap-4 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="col-span-4 h-11 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white"
                            >
                                <IconLogout size={16} />
                                <span>Logout</span>
                            </Button>
                            <Button
                                type="submit"
                                disabled={openMutation.isPending || isSubmitting}
                                className="col-span-8 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/10 active:scale-[0.99] transition-all disabled:opacity-50 border-none"
                            >
                                {openMutation.isPending || isSubmitting ? (
                                    <IconLoader2 size={16} className="animate-spin" />
                                ) : (
                                    <IconDeviceFloppy size={16} />
                                )}
                                <span>Mulai Shift (Buka Laci)</span>
                            </Button>


                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
