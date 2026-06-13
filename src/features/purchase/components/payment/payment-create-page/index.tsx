"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    useCreatePayment,
    useUpdatePayment,
    useCashAccounts,
    useOutstandingReceivings,
    usePaymentSummary,
    usePaymentDetail,
} from "../../../api/purchase-api";
import { paymentSchema, type PaymentInput } from "../../../schemas/payment-schema";
import { PaymentForm } from "./payment-form";
import { DebtSummary } from "./debt-summary";

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
        handleSubmit,
        setValue,
        reset,
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
                    <FormProvider {...methods}>
                        <PaymentForm
                            onSubmit={handleSubmit(onSubmit)}
                            isPending={isPending}
                            isEdit={isEdit}
                            receivingOptions={receivingOptions}
                            cashAccountOptions={cashAccountOptions}
                            paymentMethodOptions={paymentMethodOptions}
                            receivingsLoading={receivingsLoading}
                            cashAccountsLoading={cashAccountsLoading}
                            onCancel={() => router.push("/admin/purchase/payment")}
                        />
                    </FormProvider>
                </div>

                {/* Debt Summary Column */}
                <div>
                    <DebtSummary
                        selectedReceivingId={selectedReceivingId}
                        summaryLoading={summaryLoading}
                        summary={summary}
                        isEdit={isEdit}
                        editId={editId}
                        sisaHutangLimit={sisaHutangLimit}
                    />
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
