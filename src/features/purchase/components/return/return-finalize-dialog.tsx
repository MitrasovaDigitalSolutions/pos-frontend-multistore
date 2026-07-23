"use client";

import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
    useCashAccounts,
    useFinalizePurchaseReturn,
    useReceivingDetail,
} from "../../api/purchase-api";
import type { PurchaseReturn } from "../../types";
import { PAYMENT_STATUS } from "@/constants/purchase";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ReturnFinalizeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    returnObj: PurchaseReturn | null;
    onSuccess?: () => void;
    onConfirm?: (data: ReturnFinalizeInput) => void;
    isPending?: boolean;
}

const returnFinalizeSchema = z.object({
    resolution_type: z.enum(["refund", "credit", "credit_note", "exchange"], {
        message: "Solusi / Metode Penyelesaian Retur wajib dipilih",
    }),
    cash_account_uid: z.string().nullable().optional(),
    stock_receiving_uid: z.string().nullable().optional(),
    catatan_penyelesaian: z.string().nullable().optional().transform(v => v || null),
}).superRefine((data, ctx) => {
    if (data.resolution_type === "refund" && !data.cash_account_uid) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Kas/Rekening wajib dipilih untuk refund dana tunai",
            path: ["cash_account_uid"],
        });
    }
    if (data.resolution_type === "credit" && !data.stock_receiving_uid) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Faktur Penerimaan wajib dipilih untuk potong utang",
            path: ["stock_receiving_uid"],
        });
    }
});

type ReturnFinalizeInput = z.infer<typeof returnFinalizeSchema>;

export function ReturnFinalizeDialog({
    open,
    onOpenChange,
    returnObj,
    onSuccess,
    onConfirm,
    isPending = false,
}: ReturnFinalizeDialogProps) {
    const finalizeReturn = useFinalizePurchaseReturn();
    const { data: cashAccounts = [], isLoading: cashLoading } = useCashAccounts();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState<ReturnFinalizeInput | null>(null);

    const receivingUid = returnObj?.stock_receiving_uid || (returnObj as unknown as { receiving_uid?: string })?.receiving_uid || null;
    const { data: fetchedReceiving } = useReceivingDetail(receivingUid);
    const receiving = returnObj?.stock_receiving || fetchedReceiving;

    const isPaid = Boolean(
        receiving &&
        (receiving.status_pembayaran === PAYMENT_STATUS.PAID ||
            (receiving.status_pembayaran as string) === "paid" ||
            (receiving.sisa_hutang !== undefined && receiving.sisa_hutang <= 0))
    );

    const resolutionOptions = isPaid
        ? [
            {
                value: "refund",
                label: "Refund Tunai (Kas Masuk)",
            },
        ]
        : [
            {
                value: "refund",
                label: "Refund Tunai (Kas Masuk)",
            },
            {
                value: "credit",
                label: "Potong Utang (Kredit Faktur Supplier)",
            },
        ];

    const methods = useForm<ReturnFinalizeInput>({
        resolver: zodResolver(returnFinalizeSchema) as Resolver<ReturnFinalizeInput>,
        defaultValues: {
            resolution_type: undefined as unknown as "refund",
            cash_account_uid: null,
            stock_receiving_uid: returnObj?.stock_receiving_uid || null,
            catatan_penyelesaian: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    const resolutionType = useWatch({ control: methods.control, name: "resolution_type" });

    useEffect(() => {
        if (open && returnObj) {
            reset({
                resolution_type: undefined as unknown as "refund",
                cash_account_uid: null,
                stock_receiving_uid: returnObj.stock_receiving_uid || null,
                catatan_penyelesaian: "",
            });
        }
    }, [open, returnObj, reset]);

    const cashAccountOptions = cashAccounts.map((c) => ({
        value: String(c.uid),
        label: c.nama,
        description: `Saldo: ${formatRupiah(c.saldo)}`,
    }));

    const onSubmit = (data: ReturnFinalizeInput) => {
        setPendingData(data);
        setIsConfirmOpen(true);
    };

    const handleConfirmFinalize = () => {
        if (!returnObj || !pendingData) return;

        if (onConfirm) {
            onConfirm(pendingData);
            setIsConfirmOpen(false);
            return;
        }

        const payload = {
            resolution_type: pendingData.resolution_type,
            impact_type: pendingData.resolution_type,
            cash_account_uid: pendingData.resolution_type === "refund" ? pendingData.cash_account_uid : null,
            stock_receiving_uid: pendingData.resolution_type === "credit" ? (pendingData.stock_receiving_uid || returnObj.stock_receiving_uid) : null,
            catatan_penyelesaian: pendingData.catatan_penyelesaian,
        };

        finalizeReturn.mutate(
            {
                uid: returnObj.uid,
                data: payload,
            },
            {
                onSuccess: () => {
                    toast.success("Retur Pembelian berhasil difinalisasi.");
                    setIsConfirmOpen(false);
                    onOpenChange(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memfinalisasi Retur Pembelian.");
                    setIsConfirmOpen(false);
                },
            },
        );
    };

    const isLoading = finalizeReturn.isPending || isPending;

    return (
        <>
            <BaseDialog
                open={open}
                onOpenChange={onOpenChange}
                title={
                    <div className="flex flex-col gap-1 text-left">
                        <div className="flex items-center gap-2">
                            <IconCircleCheck size={20} className="text-emerald-600" />
                            <span>Finalisasi Retur Pembelian</span>
                        </div>
                        <p className="text-xs text-slate-400 font-normal mt-1 font-sans">
                            Dokumen: <strong className="text-slate-700">{returnObj?.nomor_retur || "Akan Dibuat Otomatis"}</strong> (Total: {formatRupiah(returnObj?.total_nominal || 0)})
                        </p>
                    </div>
                }
                className="sm:max-w-xl"
                scrollable={true}
            >
                {/* Warning Banner */}
                <div className="bg-amber-50/50 border border-amber-100/50 text-amber-800 p-4 rounded-xl flex gap-3 items-start">
                    <IconAlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="text-xs font-bold text-amber-900">Perhatian</p>
                        <p className="text-[11px] text-amber-700/95 leading-relaxed">
                            Tindakan ini akan mengurangi stok produk terkait secara permanen dan mencatat penyelesaian retur di sistem. Dokumen yang telah difinalisasi tidak dapat diubah kembali.
                        </p>
                    </div>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        {/* Resolution Type Selector */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Solusi / Metode Penyelesaian Retur
                            </label>
                            <FormSelect<ReturnFinalizeInput>
                                name="resolution_type"
                                options={resolutionOptions}
                                placeholder="-- Pilih Solusi / Metode Penyelesaian Retur --"
                            />
                            {errors.resolution_type && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.resolution_type.message}
                                </p>
                            )}
                        </div>

                        {/* Cash Account Select if Refund */}
                        {resolutionType === "refund" && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Kas / Rekening Penerima Refund *
                                </label>
                                <FormSelect<ReturnFinalizeInput>
                                    name="cash_account_uid"
                                    options={cashAccountOptions}
                                    placeholder={
                                        cashLoading ? "Memuat rekening..." : "-- Pilih Rekening --"
                                    }
                                    disabled={cashLoading}
                                />
                                {errors.cash_account_uid && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.cash_account_uid.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Stock Receiving Auto Card if Credit */}
                        {resolutionType === "credit" && (
                            <div className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Faktur Pembelian / Penerimaan Barang yang Dipotong Utangnya
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 space-y-2 font-sans">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Nomor Penerimaan:</span>
                                        <span className="text-slate-900 dark:text-slate-100 font-bold font-mono">
                                            {receiving?.nomor_penerimaan || `ID: ${receivingUid || "-"}`}
                                        </span>
                                    </div>
                                    {receiving?.nomor_faktur && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Nomor Faktur:</span>
                                            <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">
                                                {receiving.nomor_faktur}
                                            </span>
                                        </div>
                                    )}
                                    {receiving?.sisa_hutang !== undefined && (
                                        <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
                                            <span className="text-slate-500 font-medium">Sisa Utang Faktur:</span>
                                            <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                                                {formatRupiah(receiving.sisa_hutang || 0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 p-2.5 rounded-lg mt-2">
                                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold leading-normal">
                                            ✓ Nilai retur ({formatRupiah(returnObj?.total_nominal || 0)}) otomatis memotong utang pada faktur penerimaan yang terpilih.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Catatan Penyelesaian */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Keterangan Penyelesaian
                            </label>
                            <Input
                                type="text"
                                placeholder="Catatan tambahan (misal: uang refund sudah diterima tunai)..."
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={isLoading}
                                {...register("catatan_penyelesaian")}
                            />
                            {errors.catatan_penyelesaian && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.catatan_penyelesaian.message}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 bg-white">
                            <Button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="h-10 text-xs font-bold px-4 border-slate-200 text-slate-700 rounded-xl cursor-pointer bg-white"
                                disabled={isLoading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="h-10 text-xs font-bold px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? "Memproses..." : "Ya, Finalisasi Retur"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </BaseDialog>

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Konfirmasi Finalisasi Retur"
                description="Apakah Anda yakin ingin memfinalisasi retur pembelian ini? Stok produk terkait akan langsung dikurangi secara permanen di sistem dan tindakan ini tidak dapat diubah lagi."
                confirmText="Ya, Finalisasikan"
                cancelText="Batal"
                variant="warning"
                onConfirm={handleConfirmFinalize}
                isLoading={isLoading}
            />
        </>
    );
}
