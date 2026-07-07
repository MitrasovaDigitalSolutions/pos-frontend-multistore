import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCreditCard } from "@tabler/icons-react";
import { useFormContext } from "react-hook-form";
import type { PaymentInput } from "../../../schemas/payment-schema";

interface PaymentFormProps {
    onSubmit: () => void;
    isPending: boolean;
    isEdit: boolean;
    receivingOptions: { value: string; label: string }[];
    cashAccountOptions: { value: string; label: string }[];
    paymentMethodOptions: { value: string; label: string }[];
    receivingsLoading: boolean;
    cashAccountsLoading: boolean;
    onCancel: () => void;
}

export function PaymentForm({
    onSubmit,
    isPending,
    isEdit,
    receivingOptions,
    cashAccountOptions,
    paymentMethodOptions,
    receivingsLoading,
    cashAccountsLoading,
    onCancel,
}: PaymentFormProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext<PaymentInput>();

    return (
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

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Select Outstanding Receiving */}
                    <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Faktur Penerimaan *
                        </label>
                        <FormSelect<PaymentInput>
                            name="receiving_uid"
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
                            name="cash_account_uid"
                            options={cashAccountOptions}
                            placeholder={
                                cashAccountsLoading
                                    ? "Memuat akun kas..."
                                    : "-- Pilih Akun Kas --"
                            }
                            disabled={isPending || cashAccountsLoading}
                        />
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
                        onClick={onCancel}
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
        </section>
    );
}
