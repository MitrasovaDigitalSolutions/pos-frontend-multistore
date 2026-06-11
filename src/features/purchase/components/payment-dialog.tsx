"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Scrollable } from "@/components/ui/scrollable";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCreditCard } from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import {
    useCreatePayment,
    useUpdatePayment,
    useCashAccounts,
    useReceivings,
    useReceivingDetail,
} from "../api/purchase-api";
import { paymentSchema, type PaymentInput } from "../schemas/payment-schema";
import type { ReceivingPayment } from "../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingPayment?: ReceivingPayment | null;
}

export function PaymentDialog({
    open,
    onOpenChange,
    editingPayment = null,
}: PaymentDialogProps) {
    const createPayment = useCreatePayment();
    const updatePayment = useUpdatePayment();
    const { data: cashAccounts = [], isLoading: cashAccountsLoading } = useCashAccounts();

    // Fetch unpaid completed stock receivings for new payments
    const { data: receivingsData, isLoading: receivingsLoading } = useReceivings({
        status: "completed",
        per_page: 1000,
    });

    const isEdit = !!editingPayment;

    // Fetch detail of the current receiving if in edit mode
    const { data: currentReceiving, isLoading: currentReceivingLoading } = useReceivingDetail(
        isEdit && editingPayment ? editingPayment.referensi_id : null
    );

    const unpaidReceivings = (receivingsData?.data || []).filter(
        (r) => r.status_pembayaran === "pending" || (isEdit && r.id === editingPayment?.referensi_id)
    );

    const receivingOptions = unpaidReceivings.map((r) => ({
        value: String(r.id),
        label: `${r.nomor_penerimaan} - ${r.supplier_relationship?.nama || r.supplier || "Tanpa Supplier"} (${formatRupiah(r.nilai_faktur || 0)})`,
    }));

    const cashAccountOptions = cashAccounts.map((acc) => ({
        value: String(acc.id),
        label: `${acc.nama} (${formatRupiah(acc.saldo)})`,
    }));

    const paymentMethodOptions = [
        { value: "Cash", label: "Cash / Tunai" },
        { value: "Transfer", label: "Transfer Bank" },
        { value: "Giro", label: "Giro" },
    ];

    const methods = useForm<PaymentInput>({
        resolver: zodResolver(paymentSchema) as Resolver<PaymentInput>,
        defaultValues: {
            stock_receiving_id: 0,
            nominal: 0,
            tanggal_bayar: new Date().toISOString().split("T")[0],
            cash_account_id: 0,
            metode_pembayaran: "Cash",
            catatan: "",
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = methods;

    const selectedReceivingId = watch("stock_receiving_id");

    // Auto fill nominal when receiving is selected
    useEffect(() => {
        if (!isEdit && selectedReceivingId) {
            const rec = unpaidReceivings.find((r) => r.id === Number(selectedReceivingId));
            if (rec) {
                setValue("nominal", rec.nilai_faktur || 0);
            }
        }
    }, [selectedReceivingId, isEdit, setValue, unpaidReceivings]);

    useEffect(() => {
        if (open) {
            if (editingPayment) {
                reset({
                    stock_receiving_id: editingPayment.referensi_id,
                    nominal: editingPayment.total,
                    tanggal_bayar: editingPayment.created_at.split(" ")[0], // Extract date part YYYY-MM-DD
                    cash_account_id: editingPayment.cash_account_id,
                    metode_pembayaran: editingPayment.metode_pembayaran,
                    catatan: editingPayment.catatan_void || "", // note field
                });
            } else {
                reset({
                    stock_receiving_id: 0,
                    nominal: 0,
                    tanggal_bayar: new Date().toISOString().split("T")[0],
                    cash_account_id: 0,
                    metode_pembayaran: "Cash",
                    catatan: "",
                });
            }
        }
    }, [open, editingPayment, reset]);

    const isPending = createPayment.isPending || updatePayment.isPending;
    const showLoading = isEdit && currentReceivingLoading;

    const onSubmit = (data: PaymentInput) => {
        if (isEdit && editingPayment) {
            updatePayment.mutate(
                { id: editingPayment.id, data },
                {
                    onSuccess: () => {
                        toast.success("Data pembayaran supplier berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui pembayaran.");
                    },
                }
            );
        } else {
            createPayment.mutate(data, {
                onSuccess: () => {
                    toast.success("Pembayaran supplier berhasil dicatat.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mencatat pembayaran.");
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white rounded-2xl border-slate-100 p-6 flex flex-col max-h-[90vh]">
                <DialogHeader className="pb-4 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconCreditCard size={20} className="text-emerald-500" />
                        <span>
                            {isEdit
                                ? `Ubah Pembayaran (${editingPayment.nomor_transaksi})`
                                : "Catat Pembayaran Supplier"}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col flex-1 overflow-hidden min-h-0 pt-4 space-y-4"
                    >
                        <Scrollable className="flex-1 pr-1">
                            {showLoading ? (
                                <div className="space-y-4 pb-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3.5 w-24 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-3.5 w-24 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-3.5 w-24 rounded" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pb-4 pr-1">
                                    {/* Stock Receiving Invoice Selection */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Faktur Penerimaan *
                                        </label>
                                        {isEdit ? (
                                            <Input
                                                type="text"
                                                value={
                                                    currentReceiving
                                                        ? `${currentReceiving.nomor_penerimaan} - ${currentReceiving.supplier_relationship?.nama || currentReceiving.supplier || "Supplier"} (${formatRupiah(currentReceiving.nilai_faktur || 0)})`
                                                        : "Memuat faktur..."
                                                }
                                                disabled={true}
                                                className="h-10 text-xs border-slate-200 bg-slate-100/50 text-slate-400 rounded-xl cursor-not-allowed"
                                            />
                                        ) : (
                                            <FormSelect<PaymentInput>
                                                name="stock_receiving_id"
                                                options={receivingOptions}
                                                placeholder={
                                                    receivingsLoading
                                                        ? "Memuat faktur penerimaan..."
                                                        : "-- Pilih Faktur Penerimaan --"
                                                }
                                                disabled={isPending || receivingsLoading}
                                            />
                                        )}
                                        {errors.stock_receiving_id && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.stock_receiving_id.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Nominal Pembayaran */}
                                    <div>
                                        <FormNominalInput<PaymentInput>
                                            name="nominal"
                                            label="Nominal Pembayaran *"
                                            placeholder="Masukkan nominal Rp..."
                                            disabled={isPending}
                                        />
                                    </div>

                                    {/* Cash Account Selection */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Bayar Dari Akun/Kas *
                                        </label>
                                        <FormSelect<PaymentInput>
                                            name="cash_account_id"
                                            options={cashAccountOptions}
                                            placeholder={
                                                cashAccountsLoading
                                                    ? "Memuat akun kas..."
                                                    : "-- Pilih Akun Kas --"
                                            }
                                            disabled={isPending || cashAccountsLoading}
                                        />
                                        {errors.cash_account_id && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.cash_account_id.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Metode Pembayaran *
                                        </label>
                                        <FormSelect<PaymentInput>
                                            name="metode_pembayaran"
                                            options={paymentMethodOptions}
                                            placeholder="Pilih metode"
                                            disabled={isPending}
                                        />
                                        {errors.metode_pembayaran && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.metode_pembayaran.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Payment Date */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Tanggal Bayar *
                                        </label>
                                        <Input
                                            type="date"
                                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                            disabled={isPending}
                                            {...register("tanggal_bayar")}
                                        />
                                        {errors.tanggal_bayar && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.tanggal_bayar.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Notes / Catatan */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Catatan
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Catatan tambahan (misal: nomor referensi transfer)..."
                                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                            disabled={isPending}
                                            {...register("catatan")}
                                        />
                                        {errors.catatan && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.catatan.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Scrollable>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 bg-white">
                            <Button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                variant="outline"
                                className="w-full sm:w-auto px-6 h-11 border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer bg-white"
                                disabled={isPending}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto px-6 h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                disabled={isPending || showLoading}
                            >
                                {isPending ? "Menyimpan..." : "Simpan Pembayaran"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
