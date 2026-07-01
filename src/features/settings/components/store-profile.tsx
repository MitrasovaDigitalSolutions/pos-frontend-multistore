"use client";

import { useCashAccounts } from "@/features/cash/api/cash-api";
import { settingsApi } from "@/features/settings/api/settings-api";
import { useSettingsStore } from "@/stores/settings-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { getImageUrl } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { storeSettingsSchema, type StoreSettingsInput } from "../schemas/settings-schema";

// Reusable Form Components
import { FormImageUpload } from "@/components/forms/form-image-upload";
import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconAdjustments, IconInfoCircle } from "@tabler/icons-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
    Loader2,
    Save,
    Store,
    Wallet
} from "lucide-react";

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5 select-none">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {label}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button type="button" className="p-0 border-none bg-transparent cursor-help text-slate-400 hover:text-slate-500 transition-colors flex items-center">
                        <IconInfoCircle size={13} />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px] max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export function StoreProfile() {
    const { settings, fetchSettings, isLoading: isSettingsLoading } = useSettingsStore();
    const { data: cashAccountsData, isLoading: isCashAccountsLoading } = useCashAccounts();
    const cashAccounts = cashAccountsData || [];

    const [isSaving, setIsSaving] = useState(false);

    // Initialize React Hook Form with Zod schema resolver
    const methods = useForm<StoreSettingsInput>({
        resolver: zodResolver(storeSettingsSchema) as Resolver<StoreSettingsInput>,
        defaultValues: {
            app_name: "",
            app_address: "",
            app_phone: "",
            app_logo_url: null,
            tax_rate_ppn: 0,
            point_rate: 1000,
            cash_account_register_uid: "",
            cash_account_main_uid: "",
            cash_account_bank_uid: "",
            printer_id: "",
        },
    });

    // Populate form data once settings are loaded from store
    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            methods.reset({
                app_name: settings.app_name || "",
                app_address: settings.app_address || "",
                app_phone: settings.app_phone || "",
                app_logo_url: settings.app_logo_url || null,
                tax_rate_ppn: settings.tax_rate_ppn ? Number(settings.tax_rate_ppn) : 0,
                point_rate: settings.point_rate ? Number(settings.point_rate) : 1000,
                cash_account_register_uid: settings.cash_account_register_uid || "",
                cash_account_main_uid: settings.cash_account_main_uid || "",
                cash_account_bank_uid: settings.cash_account_bank_uid || "",
                printer_id: settings.printer_id || "",
            });
        }
    }, [settings, methods]);

    // Format options for cash account selects
    const cashAccountOptions = cashAccounts.map((account) => ({
        value: account.uid,
        label: account.nama,
    }));

    // Handle Form Submit
    const onSubmit = async (data: StoreSettingsInput) => {
        setIsSaving(true);
        try {
            let hasChanged = false;

            for (const key of Object.keys(data) as Array<keyof StoreSettingsInput>) {
                const formValue = data[key];
                const originalValue = settings[key];

                if (key === "app_logo_url") {
                    // Handle image upload updates
                    if (formValue instanceof File) {
                        await settingsApi.update(key, formValue);
                        hasChanged = true;
                    } else if (formValue === null && originalValue !== null && originalValue !== "") {
                        // User removed the logo
                        await settingsApi.update(key, null);
                        hasChanged = true;
                    }
                } else if (key === "tax_rate_ppn") {
                    // Compare numbers as strings
                    const formTaxStr = String(formValue);
                    const origTaxStr = originalValue !== null && originalValue !== undefined ? String(originalValue) : "";
                    if (formTaxStr !== origTaxStr) {
                        await settingsApi.update(key, formTaxStr);
                        hasChanged = true;
                    }
                } else if (key === "point_rate") {
                    // Compare numbers as strings
                    const formPointStr = String(formValue);
                    const origPointStr = originalValue !== null && originalValue !== undefined ? String(originalValue) : "";
                    if (formPointStr !== origPointStr) {
                        await settingsApi.update(key, formPointStr);
                        hasChanged = true;
                    }
                } else {
                    const formStr = formValue !== null && formValue !== undefined ? String(formValue) : "";
                    const origStr = originalValue !== null && originalValue !== undefined ? String(originalValue) : "";

                    if (formStr !== origStr) {
                        await settingsApi.update(key, formValue as string | null);
                        hasChanged = true;
                    }
                }
            }

            if (hasChanged) {
                await fetchSettings();
                toast.success("Pengaturan toko berhasil disimpan.");
            } else {
                toast.info("Tidak ada perubahan pengaturan untuk disimpan.");
            }
        } catch (error) {
            console.error("Gagal menyimpan pengaturan:", error);
            toast.error("Gagal menyimpan pengaturan toko.");
        } finally {
            setIsSaving(false);
        }
    };

    // Premium Skeleton Loading UI
    if (isSettingsLoading || isCashAccountsLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
                {/* Section 1: Identitas Toko Skeleton */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.015)] space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-3 bg-slate-200 rounded w-1/4" />
                            <div className="h-2 bg-slate-100 rounded w-1/3" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        <div className="md:col-span-4 space-y-2 w-full">
                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                            <div className="h-[180px] bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl w-full" />
                        </div>
                        <div className="md:col-span-8 space-y-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                                    <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                                    <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-3 bg-slate-100 rounded w-1/4" />
                                <div className="h-[85px] bg-slate-50 rounded-xl w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Keuangan & Pajak Skeleton */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.015)] space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-3 bg-slate-200 rounded w-1/4" />
                            <div className="h-2 bg-slate-100 rounded w-1/3" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded w-1/3" />
                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded w-1/3" />
                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Pemetaan Kas Default Skeleton */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.015)] space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-3 bg-slate-200 rounded w-2/3" />
                            <div className="h-2 bg-slate-100 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                        </div>
                    </div>
                </div>

                {/* Action Button Skeleton */}
                <div className="flex w-full justify-end pt-2">
                    <div className="h-10 bg-slate-200 rounded-xl w-32" />
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={150}>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full max-w-4xl mx-auto space-y-6">
                    {/* Section 1: Profil & Identitas Toko */}
                    <Card className="border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all duration-300 bg-white overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-sm">
                                    <Store size={15} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Identitas Toko</h3>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Informasi profil dasar bisnis dan logo resmi Anda</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                {/* Logo Uploader Panel */}
                                <div className="md:col-span-4 space-y-2">
                                    <LabelWithTooltip
                                        label="Logo Toko"
                                        tooltip="Logo resmi toko format JPG/PNG/WEBP maks 2MB."
                                    />
                                    <div className="border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                                        <FormImageUpload<StoreSettingsInput>
                                            name="app_logo_url"
                                            initialUrl={getImageUrl(settings.app_logo_url)}
                                            disabled={isSaving}
                                            className="h-[180px] min-h-0 [&>div]:h-[180px] [&>div]:min-h-0 [&>div]:md:min-h-0"
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 leading-relaxed text-center">
                                        Rasio 1:1, JPG/PNG maks 2MB.
                                    </p>
                                </div>

                                {/* Text Fields Panel */}
                                <div className="md:col-span-8 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <LabelWithTooltip
                                                label="Nama Toko"
                                                tooltip="Nama resmi toko yang dicetak pada bagian paling atas kop struk belanja."
                                            />
                                            <FormInput<StoreSettingsInput>
                                                name="app_name"
                                                placeholder="Masukkan nama toko..."
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <LabelWithTooltip
                                                label="Nomor Telepon"
                                                tooltip="Nomor kontak resmi toko Anda untuk keperluan transaksi atau informasi."
                                            />
                                            <FormInput<StoreSettingsInput>
                                                name="app_phone"
                                                placeholder="Masukkan nomor telepon..."
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <LabelWithTooltip
                                                label="ID Printer Struk"
                                                tooltip="ID / Nama printer default yang digunakan untuk mencetak struk (misal: EPSON LX-310 ESC/P)."
                                            />
                                            <FormInput<StoreSettingsInput>
                                                name="printer_id"
                                                placeholder="Contoh: EPSON LX-310 ESC/P..."
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <LabelWithTooltip
                                            label="Alamat Toko"
                                            tooltip="Alamat fisik lengkap toko yang dicetak di baris alamat kop struk belanja."
                                        />
                                        <FormTextarea<StoreSettingsInput>
                                            name="app_address"
                                            placeholder="Masukkan alamat lengkap toko..."
                                            disabled={isSaving}
                                            className="min-h-[90px] text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Keuangan & Pajak */}
                    <Card className="border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all duration-300 bg-white overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60 shadow-sm">
                                    <IconAdjustments size={15} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Keuangan & Pajak</h3>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Pengaturan tarif PPN dan poin loyalitas</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <LabelWithTooltip
                                        label="Tarif PPN (%)"
                                        tooltip="Persentase PPN default yang otomatis ditambahkan di kasir saat checkout pajak aktif."
                                    />
                                    <FormNumberInput<StoreSettingsInput>
                                        name="tax_rate_ppn"
                                        placeholder="Contoh: 11"
                                        disabled={isSaving}
                                        min={0}
                                        max={100}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <LabelWithTooltip
                                        label="Konversi Poin (Rupiah per Poin)"
                                        tooltip="Kelipatan nominal belanja Rupiah untuk mendapat 1 poin member (dibulatkan kebawah)."
                                    />
                                    <FormNumberInput<StoreSettingsInput>
                                        name="point_rate"
                                        placeholder="Contoh: 1000"
                                        disabled={isSaving}
                                        min={1}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Pemetaan Kas Default */}
                    <Card className="border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all duration-300 bg-white overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100/60 shadow-sm">
                                    <Wallet size={15} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Pemetaan Kas Default</h3>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Akun kas default untuk transaksi dan operasional</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <LabelWithTooltip
                                        label="Kas Kasir"
                                        tooltip="Akun kas penampung utama uang tunai hasil transaksi kasir harian."
                                    />
                                    <FormSelect<StoreSettingsInput>
                                        name="cash_account_register_uid"
                                        options={cashAccountOptions}
                                        placeholder="Pilih Akun Kas"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <LabelWithTooltip
                                        label="Kas Utama"
                                        tooltip="Akun kas pusat untuk menampung pemindahan saldo kasir harian."
                                    />
                                    <FormSelect<StoreSettingsInput>
                                        name="cash_account_main_uid"
                                        options={cashAccountOptions}
                                        placeholder="Pilih Akun Kas"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <LabelWithTooltip
                                        label="Kas Bank"
                                        tooltip="Akun bank penampung utama pembayaran non-tunai (Qris, debit, transfer)."
                                    />
                                    <FormSelect<StoreSettingsInput>
                                        name="cash_account_bank_uid"
                                        options={cashAccountOptions}
                                        placeholder="Pilih Akun Kas"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer Save Button */}
                    <div className="flex w-full justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition-all duration-200 px-6 py-3 h-auto cursor-pointer border-none"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2" size={16} />
                                    Simpan Pengaturan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </TooltipProvider>
    );
}
