"use client";

import React, { useEffect } from "react";
import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { canAccessAdmin } from "@/constants/roles";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { signOut } from "@/lib/auth-helpers";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconChevronLeft,
    IconDoorExit,
    IconLoader2,
    IconPrinter,
    IconCash,
    IconCheck,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useCloseCashDrawer } from "../../api/cash-drawer-api";
import {
    closeCashDrawerSchema,
    type CloseCashDrawerInput,
} from "../../schemas/cash-drawer-schema";
import { db } from "@/lib/db";
import axios from "axios";
import { useSettingsStore } from "@/stores/settings-store";
import PrinterService from "@/services/printer.service";
import { buildCashDepositText } from "@/utils/ReceiptCashierSession";

interface CloseShiftFormProps {
    sessionId: string;
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
    const { data: session } = useSession();
    const isAdmin = canAccessAdmin(session?.user?.roles || []);

    const methods = useForm<CloseCashDrawerInput>({
        resolver: zodResolver(closeCashDrawerSchema) as Resolver<CloseCashDrawerInput>,
        defaultValues: {
            actual_closing_balance: expectedCash,
            closing_note: "",
        },
    });

    const {
        handleSubmit,
        setValue,
        register,
        formState: { isSubmitting },
    } = methods;

    // Automatically synchronize actual_closing_balance to expectedCash
    useEffect(() => {
        setValue("actual_closing_balance", expectedCash, { shouldValidate: true });
    }, [expectedCash, setValue]);

    const getSetting = useSettingsStore((state) => state.getSetting);

    const onPrint = async () => {
        try {
            const { data } = await axios.get(
                `/api/proxy/v1/cash-drawer/sessions/${sessionId}/struk-setoran`
            );
            const printerName = getSetting("printer_id") || "EPSON LX-310 ESC/P";
            await PrinterService.print(printerName, buildCashDepositText(data));
        } catch (error: unknown) {
            console.error("Print failed:", error);
            toast.error("Gagal Mencetak Struk");
        }
    };

    const onSubmit = async (data: CloseCashDrawerInput) => {
        const storeCart = useCheckoutStore.getState().cart;
        const storeHoldList = useCheckoutStore.getState().holdList;

        if (storeCart.length > 0 || storeHoldList.length > 0) {
            toast.error(
                "Tidak dapat menutup shift! Masih terdapat transaksi gantung (keranjang belanja aktif atau transaksi hold). Selesaikan atau batalkan (void) transaksi tersebut terlebih dahulu."
            );
            return;
        }

        // Check for unsynced offline transactions
        try {
            const pendingCount = await db.offlineTransactions
                .where("status")
                .equals("pending")
                .count();

            if (pendingCount > 0) {
                toast.error(
                    `Tidak dapat menutup shift! Masih terdapat ${pendingCount} transaksi offline yang belum disinkronisasi ke server. Silakan kirimkan transaksi tersebut terlebih dahulu.`
                );
                return;
            }
        } catch (dbErr) {
            console.error("Gagal memeriksa transaksi offline pending:", dbErr);
        }

        try {
            await closeMutation.mutateAsync({
                session: sessionId,
                payload: {
                    // Guaranteed to always match expected cash in drawer
                    actual_closing_balance: expectedCash,
                    closing_note: data.closing_note?.trim() || undefined,
                },
                token,
            });

            // Clear checkout Zustand store client-side state on successful shift close
            useCheckoutStore.getState().clearCart();
            useCheckoutStore.getState().clearHoldList();

            // Clear active store in local storage / Zustand if non-admin or single store
            const hasMultipleStores = (session?.user?.stores || []).length > 1;
            if (!(isAdmin && hasMultipleStores)) {
                useActiveStoreStore.getState().setActiveStore(null);
            }

            toast.success("Sesi shift laci kasir berhasil ditutup.");
            onSuccess();

            if (!isAdmin) {
                await signOut({ callbackUrl: "/login" });
            }
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || "Gagal menutup laci kasir.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ── Symmetric Header ── */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border-none bg-transparent shrink-0"
                    disabled={closeMutation.isPending || isSubmitting}
                >
                    <IconChevronLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block truncate">
                        Tutup Sesi Shift Kasir
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                        Setoran kas otomatis disamakan dengan saldo kas laci saat ini
                    </span>
                </div>
            </div>

            <FormProvider {...methods}>
                {/* Hidden input to maintain strict form validation */}
                <input
                    type="hidden"
                    {...register("actual_closing_balance", { valueAsNumber: true })}
                    value={expectedCash}
                />

                {/* ── Automatic Deposit Summary Card ── */}
                <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                <IconCash size={16} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                Nominal Kas Disetorkan
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-300/70 dark:border-emerald-800">
                            <IconCheck size={11} strokeWidth={3} />
                            Otomatis Pas
                        </span>
                    </div>

                    <div className="py-1">
                        <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight tabular-nums">
                            {formatRupiah(expectedCash)}
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pt-1 border-t border-emerald-200/50 dark:border-emerald-900/40">
                        Nominal setoran penutupan shift otomatis dikunci persis dengan total kas di laci kasir saat ini.
                    </p>
                </div>

                {/* ── Optional Note ── */}
                <div className="pt-1">
                    <FormInput<CloseCashDrawerInput>
                        name="closing_note"
                        label="Catatan Penutupan Shift (Opsional)"
                        type="text"
                        placeholder="Contoh: Shift pagi selesai lancar..."
                        disabled={closeMutation.isPending || isSubmitting}
                    />
                </div>
            </FormProvider>

            {/* ── Action Buttons ── */}
            <div className="flex gap-2.5 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="grow sm:grow-0 sm:w-28 h-10 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer bg-white dark:bg-slate-800"
                    disabled={closeMutation.isPending || isSubmitting}
                >
                    Batal
                </Button>
                <Button
                    type="button"
                    onClick={onPrint}
                    disabled={closeMutation.isPending || isSubmitting}
                    className="h-10 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm"
                >
                    <IconPrinter size={15} />
                    <span className="hidden sm:inline">Cetak Struk</span>
                </Button>
                <Button
                    type="submit"
                    disabled={closeMutation.isPending || isSubmitting}
                    className="grow h-10 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border-none shadow-sm shadow-rose-600/20 active:scale-[0.98] transition-all"
                >
                    {closeMutation.isPending || isSubmitting ? (
                        <IconLoader2 size={16} className="animate-spin" />
                    ) : (
                        <IconDoorExit size={16} />
                    )}
                    <span>Tutup Sesi &amp; Setor Kas</span>
                </Button>
            </div>
        </form>
    );
}
