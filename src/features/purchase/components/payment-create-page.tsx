"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconCreditCard, IconCoins, IconReceipt2, IconInfoCircle } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import {
    useCreatePayment,
    useUpdatePayment,
    useCashAccounts,
    useOutstandingReceivings,
    usePaymentSummary,
    usePaymentDetail,
} from "../api/purchase-api";
import { paymentSchema, type PaymentInput } from "../schemas/payment-schema";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function PaymentCreatePage() {
    const router = useAppRouter();
    const searchParams = useSearchParams();
    const editIdParam = searchParams.get("edit");
    const editId = editIdParam ? Number(editIdParam) : null;
    const isEdit = editId !== null && editId > 0;

    // Block editing completely
    useEffect(() => {
        if (isEdit) {
            toast.error("Pembayaran yang sudah disimpan tidak dapat diubah.");
            router.push("/admin/purchase/payment");
        }
    }, [isEdit, router]);

    const createPayment = useCreatePayment();
    const updatePayment = useUpdatePayment();
    const { data: cashAccounts = [], isLoading: cashAccountsLoading } = useCashAccounts();
    const { data: outstandingReceivings = [], isLoading: receivingsLoading } = useOutstandingReceivings();

    // Confirm dialog states
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState<PaymentInput | null>(null);

    // Fetch payment detail if in edit mode
    const { data: editingPayment, isLoading: editingPaymentLoading } = usePaymentDetail(editId);

    const methods = useForm<PaymentInput>({
        resolver: zodResolver(paymentSchema) as Resolver<PaymentInput>,
        defaultValues: {
            receiving_id: 0,
            jumlah_bayar: 0,
            tanggal_bayar: new Date().toISOString().split("T")[0],
            cash_account_id: 1,
            metode_pembayaran: "Cash",
            nomor_referensi: "",
            catatan: "",
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = methods;

    const selectedReceivingId = useWatch({ name: "receiving_id", control: methods.control });

    // Fetch summary for selected receiving
    const { data: summary, isLoading: summaryLoading } = usePaymentSummary(
        selectedReceivingId ? Number(selectedReceivingId) : null
    );

    // Sync editing payment data into form defaults
    useEffect(() => {
        if (isEdit && editingPayment) {
            reset({
                receiving_id: editingPayment.referensi_id,
                jumlah_bayar: editingPayment.total,
                tanggal_bayar: editingPayment.created_at.split("T")[0] || editingPayment.created_at.split(" ")[0],
                cash_account_id: editingPayment.cash_account_id,
                metode_pembayaran: editingPayment.metode_pembayaran,
                nomor_referensi: editingPayment.nomor_referensi || "",
                catatan: editingPayment.catatan || "",
            });
        }
    }, [isEdit, editingPayment, reset]);

    // Handle outstanding receivings options list
    const receivingOptions = outstandingReceivings.map((r) => ({
        value: String(r.id),
        label: `${r.nomor_penerimaan} - ${r.supplier_relationship?.nama || r.supplier || "Tanpa Supplier"} (Faktur: ${formatRupiah(r.nilai_faktur || 0)})`,
    }));

    // If editing, make sure the current receiving is in options
    if (isEdit && editingPayment && !receivingOptions.some(o => o.value === String(editingPayment.referensi_id))) {
        receivingOptions.push({
            value: String(editingPayment.referensi_id),
            label: `${editingPayment.receiving?.nomor_penerimaan || "Penerimaan"} - ${editingPayment.receiving?.supplier_relationship?.nama || editingPayment.receiving?.supplier || "Supplier"} (Faktur: ${formatRupiah(editingPayment.receiving?.nilai_faktur || 0)})`,
        });
    }

    const cashAccountOptions = cashAccounts.map((acc) => ({
        value: String(acc.id),
        label: `${acc.nama} (${formatRupiah(acc.saldo)})`,
    }));

    const paymentMethodOptions = [
        { value: "Cash", label: "Cash / Tunai" },
        { value: "Transfer", label: "Transfer Bank" },
        { value: "Giro", label: "Giro" },
    ];

    // Auto fill nominal when receiving is selected (only for create mode)
    useEffect(() => {
        if (!isEdit && selectedReceivingId) {
            const rec = outstandingReceivings.find((r) => r.id === Number(selectedReceivingId));
            if (rec) {
                // Default to remaining debt if sisa_hutang is available, otherwise nilai_faktur
                const defaultAmount = rec.sisa_hutang !== undefined ? rec.sisa_hutang : (rec.nilai_faktur || 0);
                setValue("jumlah_bayar", defaultAmount);
            }
        }
    }, [selectedReceivingId, isEdit, setValue, outstandingReceivings]);

    const isPending = createPayment.isPending || updatePayment.isPending;
    const showPageLoading = isEdit && editingPaymentLoading;

    // Calculate dynamic sisa_hutang for validation
    // If edit: sisa_hutang without current payment = current_sisa_hutang + editingPayment.total
    const sisaHutangLimit = summary
        ? isEdit && editingPayment
            ? summary.sisa_hutang + editingPayment.total
            : summary.sisa_hutang
        : 0;

    const onSubmit = (data: PaymentInput) => {
        // Validate sisa_hutang limit
        if (summary) {
            if (data.jumlah_bayar > sisaHutangLimit) {
                toast.error(`Nominal pembayaran melebihi sisa hutang (Maksimal ${formatRupiah(sisaHutangLimit)})`);
                return;
            }
        }

        setPendingData(data);
        setIsConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!pendingData) return;

        const payload = {
            ...pendingData,
            receiving_id: Number(pendingData.receiving_id),
            jumlah_bayar: Number(pendingData.jumlah_bayar),
            cash_account_id: Number(pendingData.cash_account_id) || 1,
        };

        try {
            await createPayment.mutateAsync(payload);
            toast.success("Pembayaran supplier berhasil dicatat.");
            setIsConfirmOpen(false);
            router.push("/admin/purchase/payment");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Gagal mencatat pembayaran.";
            toast.error(message);
        }
    };

    if (showPageLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48 rounded" />
                        <Skeleton className="h-4 w-64 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                    </div>
                    <div>
                        <Skeleton className="h-[300px] w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/purchase/payment")}
                    variant="outline"
                    className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
                >
                    <IconArrowLeft size={18} />
                </Button>
                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        {isEdit ? "Ubah Pembayaran Supplier" : "Catat Pembayaran Supplier Baru"}
                    </h2>
                    <p className="text-xs text-slate-400">
                        {isEdit
                            ? `Ubah data transaksi pembayaran ${editingPayment?.nomor_transaksi || ""}`
                            : "Catat transaksi pembayaran hutang dagang kepada supplier atas penerimaan barang."}
                    </p>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-2">
                    <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-50 mb-6">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100/30">
                                <IconCreditCard size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900">Form Transaksi Pembayaran</h3>
                                <p className="text-[10px] text-slate-400">Harap isi detail nominal dan metode bayar dengan benar.</p>
                            </div>
                        </div>

                        <FormProvider {...methods}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Select Outstanding Receiving */}
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Faktur Penerimaan *
                                        </label>
                                        <FormSelect<PaymentInput>
                                            name="receiving_id"
                                            options={receivingOptions}
                                            placeholder={
                                                receivingsLoading
                                                    ? "Memuat faktur penerimaan..."
                                                    : "-- Pilih Faktur Penerimaan --"
                                            }
                                            disabled={isPending || isEdit || receivingsLoading}
                                        />
                                    </div>

                                    {/* Nominal Pembayaran */}
                                    <div>
                                        <FormNominalInput<PaymentInput>
                                            name="jumlah_bayar"
                                            label="Nominal Pembayaran *"
                                            placeholder="Masukkan nominal Rp..."
                                            disabled={isPending}
                                        />
                                    </div>

                                    {/* Payment Date */}
                                    <div className="space-y-1.5">
                                        <FormDatePicker<PaymentInput>
                                            name="tanggal_bayar"
                                            label="Tanggal Bayar *"
                                            disabled={isPending}
                                        />
                                    </div>

                                    {/* Cash Account */}
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

                                    {/* Reference Number */}
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Nomor Referensi (Misal: Kode Transaksi, No Transfer)
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="TRF-XXXXX / GIRO-XXXXX..."
                                            className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                            disabled={isPending}
                                            {...register("nomor_referensi")}
                                        />
                                        {errors.nomor_referensi && (
                                            <p className="text-[10px] text-rose-500 font-medium">
                                                {errors.nomor_referensi.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Catatan / Keterangan Pembayaran
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Misal: Pembayaran sisa 50% atau pelunasan..."
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

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                                    <Button
                                        type="button"
                                        onClick={() => router.push("/admin/purchase/payment")}
                                        variant="outline"
                                        className="px-6 h-11 border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer bg-white"
                                        disabled={isPending}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                                        disabled={isPending}
                                    >
                                        {isPending ? "Menyimpan..." : isEdit ? "Perbarui Pembayaran" : "Simpan Pembayaran"}
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </section>
                </div>

                {/* Debt Summary Column */}
                <div>
                    {selectedReceivingId ? (
                        <div className="space-y-4">
                            {summaryLoading ? (
                                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                                    <Skeleton className="h-4 w-28 rounded" />
                                    <Skeleton className="h-10 w-full rounded" />
                                    <Skeleton className="h-6 w-20 rounded" />
                                    <Skeleton className="h-[150px] w-full rounded" />
                                </div>
                            ) : summary ? (
                                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                                        <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg border border-amber-100/30">
                                            <IconCoins size={16} />
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-800">Ringkasan Hutang</h4>
                                    </div>

                                    {/* Large Sisa Hutang Card */}
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-center space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {isEdit ? "Sisa Hutang Tanpa Pembayaran Ini" : "Sisa Hutang Saat Ini"}
                                        </span>
                                        <div className="text-lg font-extrabold text-rose-600">
                                            {formatRupiah(sisaHutangLimit)}
                                        </div>
                                        {isEdit && (
                                            <p className="text-[9px] text-slate-400 italic">
                                                Sisa hutang saat ini: {formatRupiah(summary.sisa_hutang)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Breakdown */}
                                    <div className="space-y-2.5 text-xs">
                                        <div className="flex justify-between items-center text-slate-500">
                                            <span>No. Penerimaan:</span>
                                            <span className="font-semibold text-slate-800">{summary.nomor_penerimaan}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-500">
                                            <span>Total Nilai Faktur:</span>
                                            <span className="font-semibold text-slate-800">{formatRupiah(summary.total_faktur)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-500">
                                            <span>Total Sudah Dibayar:</span>
                                            <span className="font-semibold text-emerald-600">{formatRupiah(summary.total_dibayar)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-50">
                                            <span>Status Pembayaran:</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${summary.status_pembayaran === "paid"
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100/30"
                                                : summary.status_pembayaran === "partial"
                                                    ? "bg-amber-50 text-amber-600 border border-amber-100/30"
                                                    : "bg-slate-100 text-slate-600 border border-slate-200/30"
                                                }`}>
                                                {summary.status_pembayaran === "paid"
                                                    ? "LUNAS"
                                                    : summary.status_pembayaran === "partial"
                                                        ? "SEBAGIAN"
                                                        : "TEMPO"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Riwayat Pembayaran Sebelumnya */}
                                    {summary.payments && summary.payments.length > 0 && (
                                        <div className="space-y-2 pt-3 border-t border-slate-50">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <IconReceipt2 size={12} />
                                                <span>Riwayat Pembayaran</span>
                                            </div>
                                            <div className="divide-y divide-slate-50 max-h-[160px] overflow-y-auto pr-1">
                                                {summary.payments.map((p) => {
                                                    const isCurrentEdit = isEdit && p.id === editId;
                                                    return (
                                                        <div
                                                            key={p.id}
                                                            className={`py-2 text-[11px] flex justify-between items-center ${isCurrentEdit ? "bg-amber-50/50 px-2 rounded-lg" : ""
                                                                }`}
                                                        >
                                                            <div className="space-y-0.5">
                                                                <div className="font-semibold text-slate-700 flex items-center gap-1">
                                                                    <span>{p.metode}</span>
                                                                    {isCurrentEdit && (
                                                                        <span className="text-[9px] font-bold text-amber-600 px-1 py-0.2 bg-amber-100 rounded">
                                                                            Sedang Diubah
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-slate-400 text-[9px]">
                                                                    {p.tanggal.split(" ")[0] || p.tanggal.split("T")[0]}
                                                                </div>
                                                            </div>
                                                            <span className="font-bold text-slate-800">
                                                                {formatRupiah(p.jumlah)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center py-10 space-y-3">
                            <div className="bg-slate-50 text-slate-400 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                                <IconInfoCircle size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-700">Rincian Hutang Belum Tersedia</h4>
                                <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                                    Silakan pilih salah satu faktur penerimaan barang terlebih dahulu untuk melihat histori pembayaran & sisa hutang.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Konfirmasi Catat Pembayaran"
                description={
                    <span>
                        Apakah Anda yakin ingin menyimpan pembayaran ini?
                        <br />
                        <strong className="text-rose-600 font-bold mt-1 inline-block">
                            Catatan: Setelah disimpan, data pembayaran tidak dapat diubah kembali.
                        </strong>
                    </span>
                }
                confirmText="Ya, Simpan"
                cancelText="Batal"
                variant="warning"
                onConfirm={handleConfirmSave}
                isLoading={createPayment.isPending}
            />
        </div>
    );
}
