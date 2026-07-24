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
import { Store, Wallet, Settings2, ChevronRight } from "lucide-react";

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
            description: "Profil dasar & logo toko",
            icon: Store,
            fields: ["app_name", "app_phone", "app_address", "app_logo_url"] as const,
        },
        {
            id: "finance",
            label: "Keuangan & Pajak",
            description: "Tarif PPN & poin member",
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column - Navigation Skeleton */}
                    <div className="lg:col-span-4 xl:col-span-3.5">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100">
                                    <div className="w-9 h-9 bg-slate-200 rounded-xl" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                                        <div className="h-2 bg-slate-100 rounded w-4/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Card Skeleton */}
                    <div className="lg:col-span-8 xl:col-span-8.5">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5 min-h-[460px]">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                                <div className="w-9 h-9 bg-slate-200 rounded-xl" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3.5 bg-slate-200 rounded w-1/4" />
                                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                                        <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                                        <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                                    <div className="h-28 bg-slate-50 rounded-xl w-full" />
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Tab Nav - Left Column */}
                    <div className="lg:col-span-4 xl:col-span-3.5">
                        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white dark:bg-slate-900 p-3.5 flex flex-col">
                            {/* Card Header Title */}
                            <div className="hidden lg:flex items-center gap-2.5 px-2 py-2 mb-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shrink-0">
                                    <Settings2 size={16} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                        Pengaturan Toko
                                    </h3>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                                        Pilih kategori untuk dikelola
                                    </p>
                                </div>
                            </div>

                            {/* Nav Tab List */}
                            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 p-0.5 scrollbar-none">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const dirty = isTabDirty(tab.fields);
                                    const error = hasTabError(tab.fields);
                                    const isActive = activeTab === tab.id;

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 text-left cursor-pointer shrink-0 lg:shrink-1 select-none justify-start border",
                                                isActive
                                                    ? "bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 border-transparent scale-[1.01]"
                                                    : "bg-slate-50/70 hover:bg-slate-100/90 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800/60"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl transition-all flex items-center justify-center shrink-0 border",
                                                isActive
                                                    ? "bg-white/20 backdrop-blur-md text-white border-white/25 shadow-inner"
                                                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 border-slate-200/60 dark:border-slate-700 shadow-sm"
                                            )}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-1">
                                                <p className={cn(
                                                    "text-sm font-bold tracking-tight whitespace-nowrap lg:whitespace-normal",
                                                    isActive ? "text-white" : "text-slate-800 dark:text-slate-200 group-hover:text-slate-900"
                                                )}>
                                                    {tab.label}
                                                </p>
                                                <p className={cn(
                                                    "text-xs hidden lg:block font-normal mt-0.5 leading-snug",
                                                    isActive ? "text-emerald-100/90" : "text-slate-400 dark:text-slate-400"
                                                )}>
                                                    {tab.description}
                                                </p>
                                            </div>

                                            {/* Badges & Active Arrow */}
                                            <div className="flex items-center gap-2 ml-auto shrink-0">
                                                {error ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm ring-2 ring-rose-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                        <span className="hidden sm:inline">Periksa</span>
                                                    </span>
                                                ) : dirty ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                        <span className="hidden sm:inline">Diubah</span>
                                                    </span>
                                                ) : null}

                                                {isActive && (
                                                    <ChevronRight className="hidden lg:block size-4 text-emerald-200 shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    {/* Content - Right Column */}
                    <div className="lg:col-span-8 xl:col-span-8.5 space-y-6">
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
