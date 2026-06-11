"use client";

import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
    useCashAccounts,
    useFinalizePurchaseReturn,
    useReceivings,
} from "../api/purchase-api";
import type { PurchaseReturn } from "../types";

interface ReturnFinalizeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    returnObj: PurchaseReturn | null;
}

const returnFinalizeSchema = z.object({
    impact_type: z.enum(["refund", "credit"]),
    cash_account_id: z.coerce.number().nullable().optional(),
    stock_receiving_id: z.coerce.number().nullable().optional(),
}).superRefine((data, ctx) => {
    if (data.impact_type === "refund" && !data.cash_account_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Kas/Rekening wajib dipilih untuk refund dana tunai",
            path: ["cash_account_id"],
        });
    }
    if (data.impact_type === "credit" && !data.stock_receiving_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Faktur Penerimaan wajib dipilih untuk potong utang",
            path: ["stock_receiving_id"],
        });
    }
});

type ReturnFinalizeInput = z.infer<typeof returnFinalizeSchema>;

export function ReturnFinalizeDialog({
    open,
    onOpenChange,
    returnObj,
}: ReturnFinalizeDialogProps) {
    const finalizeReturn = useFinalizePurchaseReturn();
    const { data: cashAccounts = [], isLoading: cashLoading } = useCashAccounts();

    // Fetch receivings for this supplier to reduce outstanding debt
    const { data: receivingsData, isLoading: receivingsLoading } = useReceivings({
        supplier_id: returnObj?.supplier_id || undefined,
        status: "completed",
        per_page: 100,
    });

    const methods = useForm<ReturnFinalizeInput>({
        resolver: zodResolver(returnFinalizeSchema) as Resolver<ReturnFinalizeInput>,
        defaultValues: {
            impact_type: "refund",
            cash_account_id: null,
            stock_receiving_id: null,
        },
    });

    const {
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    const impactType = useWatch({ control: methods.control, name: "impact_type" });

    useEffect(() => {
        if (open && returnObj) {
            reset({
                impact_type: "refund",
                cash_account_id: null,
                stock_receiving_id: returnObj.stock_receiving_id || null,
            });
        }
    }, [open, returnObj, reset]);

    const cashAccountOptions = cashAccounts.map((c) => ({
        value: String(c.id),
        label: `${c.nama} (Saldo: ${formatRupiah(c.saldo)})`,
    }));

    const receivingOptions = (receivingsData?.data || []).map((r) => ({
        value: String(r.id),
        label: `${r.nomor_penerimaan} (Faktur: ${r.nomor_faktur || "-"}, Total: ${formatRupiah(r.nilai_faktur || 0)}, Status: ${r.status_pembayaran === "paid" ? "Lunas" : "Belum Lunas"})`,
    }));

    const onSubmit = (data: ReturnFinalizeInput) => {
        if (!returnObj) return;

        finalizeReturn.mutate(
            {
                id: returnObj.id,
                data: {
                    impact_type: data.impact_type,
                    cash_account_id: data.impact_type === "refund" ? data.cash_account_id : null,
                    stock_receiving_id: data.impact_type === "credit" ? data.stock_receiving_id : null,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Retur Pembelian berhasil difinalisasi.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memfinalisasi Retur Pembelian.");
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white rounded-2xl border-slate-100 p-6">
                <DialogHeader className="pb-3 border-b border-slate-100">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconCircleCheck size={20} className="text-emerald-600" />
                        <span>Finalisasi Retur Pembelian</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-1">
                        Dokumen: <strong className="text-slate-700">{returnObj?.nomor_retur}</strong> (Total: {formatRupiah(returnObj?.total_nominal || 0)})
                    </DialogDescription>
                </DialogHeader>

                {/* Custom warning alert banner styled with Tailwind */}
                <div className="mt-4 bg-amber-50/50 border border-amber-100/50 text-amber-800 p-4 rounded-xl flex gap-3 items-start">
                    <IconAlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="text-xs font-bold text-amber-900">Perhatian</p>
                        <p className="text-[11px] text-amber-700/95 leading-relaxed">
                            Tindakan ini akan **mengurangi stok** produk terkait secara permanen dan mencatat transaksi keuangan. Dokumen yang telah difinalisasi tidak dapat diubah kembali.
                        </p>
                    </div>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        {/* Impact Type Selector */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Dampak Finansial / Metode Retur
                            </label>
                            <FormSelect<ReturnFinalizeInput>
                                name="impact_type"
                                options={[
                                    { value: "refund", label: "Refund Tunai (Kas Masuk)" },
                                    { value: "credit", label: "Potong Utang (Kredit Faktur Supplier)" },
                                ]}
                                placeholder="Pilih Dampak"
                            />
                            {errors.impact_type && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.impact_type.message}
                                </p>
                            )}
                        </div>

                        {/* Cash Account Select if Refund */}
                        {impactType === "refund" && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Kas / Rekening Penerima Refund *
                                </label>
                                <FormSelect<ReturnFinalizeInput>
                                    name="cash_account_id"
                                    options={cashAccountOptions}
                                    placeholder={
                                        cashLoading ? "Memuat rekening..." : "-- Pilih Rekening --"
                                    }
                                    disabled={cashLoading}
                                />
                                {errors.cash_account_id && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.cash_account_id.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Stock Receiving Select if Credit */}
                        {impactType === "credit" && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Faktur Pembelian / Penerimaan Barang *
                                </label>
                                <FormSelect<ReturnFinalizeInput>
                                    name="stock_receiving_id"
                                    options={receivingOptions}
                                    placeholder={
                                        receivingsLoading
                                            ? "Memuat penerimaan..."
                                            : receivingOptions.length === 0
                                                ? "-- Tidak ada penerimaan selesai dari supplier ini --"
                                                : "-- Pilih Faktur Penerimaan --"
                                    }
                                    disabled={receivingsLoading || receivingOptions.length === 0}
                                />
                                {errors.stock_receiving_id && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.stock_receiving_id.message}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 bg-white">
                            <Button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="h-10 text-xs font-bold px-4 border-slate-200 text-slate-700 rounded-xl cursor-pointer bg-white"
                                disabled={finalizeReturn.isPending}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="h-10 text-xs font-bold px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                disabled={finalizeReturn.isPending}
                            >
                                {finalizeReturn.isPending ? "Memproses..." : "Ya, Finalisasi Retur"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
