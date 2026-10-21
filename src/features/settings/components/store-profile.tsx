"use client";

import { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Show } from "@/components/ui/show";
import { getImageUrl } from "@/lib/utils";
import { useCashAccounts } from "@/features/cash/api/cash-api";
import { useSettingsStore } from "@/stores/settings-store";

// Feature Hook & Subcomponents
import { useSettingsForm } from "../hooks/use-settings-form";
import { SettingsTabNav } from "./settings-tab-nav";
import { TabProfile } from "./tab-profile";
import { TabFinance } from "./tab-finance";
import { TabInventory } from "./tab-inventory";
import { TabConsignment } from "./tab-consignment";
import { TabBranchPolicy } from "./tab-branch-policy";
import { TabCash } from "./tab-cash";
import { TabPrinter } from "./tab-printer";
import { FloatingSaveBar } from "./floating-save-bar";
import { SettingsTutorialController } from "../tutorial/components/settings-tutorial-controller";

import type { SettingsTabId } from "../types/settings";

export function StoreProfile() {
    const { settings, isLoading: isSettingsLoading } = useSettingsStore();
    const { data: cashAccountsData, isLoading: isCashAccountsLoading } = useCashAccounts();

    const {
        methods,
        tabs,
        activeTab,
        setActiveTab,
        isCentralStore,
        isCentralAdmin,
        isAdmin,
        isSaving,
        isTabDirty,
        hasTabError,
        printerOptions,
        isLoadingPrinters,
        qzError,
        loadPrinters,
        handleSubmit,
    } = useSettingsForm();

    const cashAccountOptions = useMemo(() => {
        if (!cashAccountsData) return [];
        return cashAccountsData.map((account) => ({
            value: account.uid,
            label: account.nama,
        }));
    }, [cashAccountsData]);

    // Compact Skeleton Loading UI
    if (isSettingsLoading || isCashAccountsLoading) {
        return (
            <div className="w-full space-y-4 animate-pulse pb-28 sm:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-4 xl:col-span-3.5">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3" />
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                    <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800/50 rounded w-4/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-8 xl:col-span-8.5">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 min-h-[300px]">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4" />
                            <div className="space-y-3">
                                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
                                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
                                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit} className="w-full relative pb-28 sm:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Navigation Column (Compact left sidebar on desktop, scrollable top bar on mobile) */}
                    <div className="lg:col-span-4 xl:col-span-3.5 shrink-0">
                        <SettingsTabNav
                            tabs={tabs}
                            activeTab={activeTab}
                            onSelectTab={setActiveTab}
                            isCentralStore={isCentralStore}
                            isTabDirty={isTabDirty}
                            hasTabError={hasTabError}
                        />
                    </div>

                    {/* Content Column */}
                    <div className="lg:col-span-8 xl:col-span-8.5 min-w-0 space-y-4">
                        {/* Tab 1: Profil Toko */}
                        <Show.When isTrue={activeTab === "profile"}>
                            <div className="animate-fade-in">
                                <TabProfile
                                    isSaving={isSaving}
                                    initialLogoUrl={getImageUrl(settings.app_logo_url)}
                                />
                            </div>
                        </Show.When>

                        {/* Tab 2: Kas & Operasional Kasir (Admin Only) */}
                        <Show.When isTrue={isAdmin && activeTab === "cash"}>
                            <div className="animate-fade-in">
                                <TabCash
                                    isSaving={isSaving}
                                    cashAccountOptions={cashAccountOptions}
                                />
                            </div>
                        </Show.When>

                        {/* Tab 3: Perangkat Printer */}
                        <Show.When isTrue={activeTab === "printer"}>
                            <div className="animate-fade-in">
                                <TabPrinter
                                    isSaving={isSaving}
                                    printerOptions={printerOptions}
                                    isLoadingPrinters={isLoadingPrinters}
                                    loadPrinters={loadPrinters}
                                    qzError={qzError}
                                />
                            </div>
                        </Show.When>

                        {/* Tab 4: Kebijakan Cabang (Pusat & Admin Only) */}
                        <Show.When isTrue={isCentralAdmin && activeTab === "branch_policy"}>
                            <div className="animate-fade-in">
                                <TabBranchPolicy isSaving={isSaving} />
                            </div>
                        </Show.When>

                        {/* Tab 5: Konsinyasi Cabang (Pusat & Admin Only) */}
                        <Show.When isTrue={isCentralAdmin && activeTab === "consignment"}>
                            <div className="animate-fade-in">
                                <TabConsignment isSaving={isSaving} />
                            </div>
                        </Show.When>

                        {/* Tab 6: Keuangan & Pajak (Pusat & Admin Only) */}
                        <Show.When isTrue={isCentralAdmin && activeTab === "finance"}>
                            <div className="animate-fade-in">
                                <TabFinance isSaving={isSaving} />
                            </div>
                        </Show.When>

                        {/* Tab 7: Inventori & HPP (Pusat & Admin Only) */}
                        <Show.When isTrue={isCentralAdmin && activeTab === "inventory"}>
                            <div className="animate-fade-in">
                                <TabInventory isSaving={isSaving} />
                            </div>
                        </Show.When>

                        {/* Floating Action Bar */}
                        <FloatingSaveBar isSaving={isSaving} />

                        {/* Settings Tutorial Controller */}
                        <SettingsTutorialController
                            resetForm={() => methods.reset()}
                            setActiveTab={(tab: string) => setActiveTab(tab as SettingsTabId)}
                        />
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
