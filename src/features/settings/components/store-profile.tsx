"use client";

import { useCashAccounts } from "@/features/cash/api/cash-api";
import { settingsApi } from "@/features/settings/api/settings-api";
import { useSettingsStore } from "@/stores/settings-store";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { IconAdjustments } from "@tabler/icons-react";
import {
    Loader2,
    Save,
    Store,
    Wallet
} from "lucide-react";

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
            cash_account_register_uid: "",
            cash_account_main_uid: "",
            cash_account_bank_uid: "",
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
                cash_account_register_uid: settings.cash_account_register_uid || "",
                cash_account_main_uid: settings.cash_account_main_uid || "",
                cash_account_bank_uid: settings.cash_account_bank_uid || "",
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
            <div className="w-full max-w-6xl mx-auto animate-pulse">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Panel: Form Settings Skeleton */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Section 1: Identitas Toko Skeleton */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                                    <div className="w-5 h-5 bg-slate-200 rounded" />
                                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                                        <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                                        <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                                    <div className="h-[70px] bg-slate-100 rounded-xl w-full" />
                                </div>
                            </div>

                            {/* Section 2: Keuangan & Pemetaan Kas Skeleton */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                                    <div className="w-5 h-5 bg-slate-200 rounded" />
                                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="md:col-span-1 space-y-1.5">
                                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                                        <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                    </div>
                                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                                            <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                                            <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="h-3 bg-slate-100 rounded w-2/3" />
                                            <div className="h-10 bg-slate-100 rounded-xl w-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Logo Toko Skeleton */}
                        <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                            <div className="space-y-4 h-full flex flex-col">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                                    <div className="w-5 h-5 bg-slate-200 rounded" />
                                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="h-3 bg-slate-100 rounded w-3/4 mb-3" />
                                    <div className="flex-1 min-h-[220px] bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Action Button Skeleton */}
                    <div className="flex w-full justify-end mt-4">
                        <div className="h-9 bg-slate-200 rounded-xl w-32" />
                    </div>

                </div>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full max-w-6xl mx-auto space-y-6">
                <Card className="border border-slate-100 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 bg-white overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Left Panel: Form Settings */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* Section 1: Profil & Identitas Toko */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                                        <Store className="text-emerald-600" size={18} />
                                        <h3 className="text-sm font-bold text-slate-800">Identitas Toko</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput<StoreSettingsInput>
                                            name="app_name"
                                            label="Nama Toko"
                                            placeholder="Masukkan nama toko..."
                                            disabled={isSaving}
                                        />
                                        <FormInput<StoreSettingsInput>
                                            name="app_phone"
                                            label="Nomor Telepon"
                                            placeholder="Masukkan nomor telepon..."
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <FormTextarea<StoreSettingsInput>
                                        name="app_address"
                                        label="Alamat Toko"
                                        placeholder="Masukkan alamat lengkap toko..."
                                        disabled={isSaving}
                                        className="min-h-[70px]"
                                    />
                                </div>

                                {/* Section 2: Keuangan & Pemetaan Kas Default */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                                        <IconAdjustments className="text-amber-600" size={18} />
                                        <h3 className="text-sm font-bold text-slate-800">Keuangan & Pemetaan Kas</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="md:col-span-1">
                                            <FormNumberInput<StoreSettingsInput>
                                                name="tax_rate_ppn"
                                                label="PPN (%)"
                                                placeholder="Contoh: 11"
                                                disabled={isSaving}
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <FormSelect<StoreSettingsInput>
                                                name="cash_account_register_uid"
                                                label="Kas Kasir"
                                                options={cashAccountOptions}
                                                placeholder="Pilih Akun Kas"
                                                disabled={isSaving}
                                            />
                                            <FormSelect<StoreSettingsInput>
                                                name="cash_account_main_uid"
                                                label="Kas Utama"
                                                options={cashAccountOptions}
                                                placeholder="Pilih Akun Kas"
                                                disabled={isSaving}
                                            />
                                            <FormSelect<StoreSettingsInput>
                                                name="cash_account_bank_uid"
                                                label="Kas Bank"
                                                options={cashAccountOptions}
                                                placeholder="Pilih Akun Kas"
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Logo Toko */}
                            <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                                <div className="space-y-4 h-full flex flex-col">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                                        <Wallet className="text-blue-600" size={18} />
                                        <h3 className="text-sm font-bold text-slate-800">Logo Toko</h3>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                                            Unggah logo resmi toko untuk struk belanja dan kop surat.
                                        </p>
                                        <FormImageUpload<StoreSettingsInput>
                                            name="app_logo_url"
                                            initialUrl={settings.app_logo_url}
                                            disabled={isSaving}
                                            className="flex-1 min-h-[220px]"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="flex w-full justify-end mt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg shadow-emerald-600/15 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all duration-300 px-6 py-2.5 h-auto cursor-pointer"
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
                    </CardContent>
                </Card>
            </form>
        </FormProvider>
    );
}
