"use client";

import { useCashAccounts } from "@/features/cash/api/cash-api";
import { settingsApi } from "@/features/settings/api/settings-api";
import { useSettingsStore } from "@/stores/settings-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { getImageUrl, cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { storeSettingsSchema, type StoreSettingsInput } from "../schemas/settings-schema";
import QZService from "@/services/qz.service";

// UI Components
import { Card } from "@/components/ui/card";
import { IconAdjustments, IconPrinter } from "@tabler/icons-react";
import { Store, Wallet } from "lucide-react";
import { Scrollable } from "@/components/ui/scrollable";
import { AppButton } from "@/components/shared/app-button";

// Subcomponents
import { TabProfile } from "./tab-profile";
import { TabFinance } from "./tab-finance";
import { TabCash } from "./tab-cash";
import { TabPrinter } from "./tab-printer";
import { FloatingSaveBar } from "./floating-save-bar";

export function StoreProfile() {
    const { settings, fetchSettings, isLoading: isSettingsLoading } = useSettingsStore();
    const { data: cashAccountsData, isLoading: isCashAccountsLoading } = useCashAccounts();
    const cashAccounts = cashAccountsData || [];

    const [isSaving, setIsSaving] = useState(false);
    const [printerOptions, setPrinterOptions] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
    const [qzError, setQzError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("profile");

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
            point_system_enabled: "true",
            cash_account_register_uid: "",
            cash_account_main_uid: "",
            cash_account_bank_uid: "",
            printer_id: "",
        },
    });

    const { formState: { dirtyFields, errors } } = methods;

    // Tabs definition mapping to form fields
    const tabs = [
        {
            id: "profile",
            label: "Identitas Toko",
            description: "Profil dasar & logo",
            icon: Store,
            fields: ["app_name", "app_phone", "app_address", "app_logo_url"] as const,
        },
        {
            id: "finance",
            label: "Keuangan & Pajak",
            description: "PPN & loyalitas member",
            icon: IconAdjustments,
            fields: ["tax_rate_ppn", "point_rate", "point_system_enabled"] as const,
        },
        {
            id: "cash",
            label: "Pemetaan Kas",
            description: "Akun kas operasional",
            icon: Wallet,
            fields: ["cash_account_register_uid", "cash_account_main_uid", "cash_account_bank_uid"] as const,
        },
        {
            id: "printer",
            label: "Perangkat Printer",
            description: "Printer struk belanja",
            icon: IconPrinter,
            fields: ["printer_id"] as const,
        },
    ];

    // Check if a tab is dirty
    const isTabDirty = (tabFields: readonly string[]) => {
        return tabFields.some((field) => dirtyFields[field as keyof StoreSettingsInput]);
    };

    // Check if a tab has errors
    const hasTabError = (tabFields: readonly string[]) => {
        return tabFields.some((field) => errors[field as keyof StoreSettingsInput]);
    };

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
                point_system_enabled: settings.point_system_enabled === undefined || settings.point_system_enabled === null
                    ? "true"
                    : settings.point_system_enabled,
                cash_account_register_uid: settings.cash_account_register_uid || "",
                cash_account_main_uid: settings.cash_account_main_uid || "",
                cash_account_bank_uid: settings.cash_account_bank_uid || "",
                printer_id: settings.printer_id || "",
            });
        }
    }, [settings, methods]);

    // Load printers from QZ Tray
    const loadPrinters = async () => {
        setIsLoadingPrinters(true);
        setQzError(null);
        try {
            const list = await QZService.findAllPrinters();
            const options = list.map((p) => ({ value: p, label: p }));

            // Ensure currently saved printer_id is in the options list
            const currentPrinter = methods.getValues("printer_id") || settings.printer_id;
            if (currentPrinter && !list.includes(currentPrinter)) {
                options.push({ value: currentPrinter, label: currentPrinter });
            }

            setPrinterOptions(options);
        } catch (err) {
            console.error("Gagal mendeteksi printer dari QZ Tray:", err);
            setQzError("Gagal menghubungkan ke QZ Tray. Pastikan aplikasi QZ Tray telah berjalan.");

            // Fallback: show the currently selected printer as the only option so it's not blank
            const currentPrinter = methods.getValues("printer_id") || settings.printer_id;
            if (currentPrinter) {
                setPrinterOptions([{ value: currentPrinter, label: currentPrinter }]);
            } else {
                setPrinterOptions([]);
            }
        } finally {
            setIsLoadingPrinters(false);
        }
    };

    useEffect(() => {
        if (activeTab === "printer" && Object.keys(settings).length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadPrinters();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, settings.printer_id]);

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

    // Auto-tab switcher on validation errors
    const onError = (formErrors: typeof errors) => {
        const errorKeys = Object.keys(formErrors) as Array<keyof StoreSettingsInput>;
        if (errorKeys.length > 0) {
            const firstErrorKey = errorKeys[0];
            const tabWithWarning = tabs.find((t) =>
                (t.fields as readonly string[]).includes(firstErrorKey)
            );
            if (tabWithWarning) {
                setActiveTab(tabWithWarning.id);
                toast.error(`Input tidak valid pada bagian "${tabWithWarning.label}". Silakan periksa kembali.`);
            } else {
                toast.error("Ada kesalahan pada input form. Silakan periksa kembali.");
            }
        }
    };


    // Premium Skeleton Loading UI matching the new layout
    if (isSettingsLoading || isCashAccountsLoading) {
        return (
            <div className="w-full space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left Column - Navigation Skeleton */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm space-y-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent">
                                    <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-2.5 bg-slate-200 rounded w-2/3" />
                                        <div className="h-2 bg-slate-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Card Skeleton */}
                    <div className="md:col-span-8 lg:col-span-9">
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 h-[500px]">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                                <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                                    <div className="h-2 bg-slate-100 rounded w-1/3" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                                        <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                                        <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                                    <div className="h-24 bg-slate-50 rounded-xl w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="w-full space-y-6 relative">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Tab Nav - Left Column */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <Card className="border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.015)] bg-white p-2 h-auto md:h-[500px] flex flex-col">
                            <Scrollable orientation="both" className="h-full w-full pr-1">
                                <div className="flex flex-row md:flex-col gap-1 pb-2 md:pb-0">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const dirty = isTabDirty(tab.fields);
                                        const error = hasTabError(tab.fields);
                                        const isActive = activeTab === tab.id;

                                        return (
                                            <AppButton
                                                key={tab.id}
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer shrink-0 md:shrink-1 select-none h-auto justify-start",
                                                    isActive
                                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-600 hover:text-white"
                                                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-1.5 rounded-lg transition-colors flex items-center justify-center shrink-0",
                                                    isActive ? "bg-emerald-700/60 text-white" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-sm font-bold tracking-wide whitespace-normal md:whitespace-nowrap">
                                                        {tab.label}
                                                    </p>
                                                    <p className={cn(
                                                        "text-xs md:block hidden font-medium mt-0.5 whitespace-normal",
                                                        isActive ? "text-emerald-100" : "text-slate-400"
                                                    )}>
                                                        {tab.description}
                                                    </p>
                                                </div>

                                                {/* Badges/Indicators */}
                                                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                                                    {error ? (
                                                        <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20 animate-pulse" />
                                                    ) : dirty ? (
                                                        <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20 animate-pulse" />
                                                    ) : null}
                                                </div>
                                            </AppButton>
                                        );
                                    })}
                                </div>
                            </Scrollable>
                        </Card>
                    </div>

                    {/* Content - Right Column */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-6">
                        {/* Tab 1: Profil Toko */}
                        <div className={activeTab === "profile" ? "block animate-fade-in" : "hidden"}>
                            <TabProfile isSaving={isSaving} initialLogoUrl={getImageUrl(settings.app_logo_url)} />
                        </div>

                        {/* Tab 2: Keuangan & Pajak */}
                        <div className={activeTab === "finance" ? "block animate-fade-in" : "hidden"}>
                            <TabFinance isSaving={isSaving} />
                        </div>

                        {/* Tab 3: Pemetaan Kas Default */}
                        <div className={activeTab === "cash" ? "block animate-fade-in" : "hidden"}>
                            <TabCash isSaving={isSaving} cashAccountOptions={cashAccountOptions} />
                        </div>

                        {/* Tab 4: Perangkat Printer */}
                        <div className={activeTab === "printer" ? "block animate-fade-in" : "hidden"}>
                            <TabPrinter
                                isSaving={isSaving}
                                printerOptions={printerOptions}
                                isLoadingPrinters={isLoadingPrinters}
                                loadPrinters={loadPrinters}
                                qzError={qzError}
                            />
                        </div>

                        {/* Sticky Floating Action Bar */}
                        <FloatingSaveBar isSaving={isSaving} />
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
