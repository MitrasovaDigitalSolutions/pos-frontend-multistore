"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm, type Resolver, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { useActiveStore } from "@/hooks/use-active-store";
import { useSettingsStore } from "@/stores/settings-store";
import { settingsApi } from "@/features/settings/api/settings-api";
import { queryKeys } from "@/lib/query-keys";
import PrinterService, { type PrinterDevice } from "@/services/printer.service";

import {
    storeSettingsSchema,
    type StoreSettingsInput,
} from "../schemas/settings-schema";
import {
    SETTINGS_TABS,
    CENTRAL_ONLY_FIELDS,
    STORE_ADMIN_ONLY_FIELDS,
} from "../constants/settings-constants";
import type { SettingsTabId } from "../types/settings";

export function useSettingsForm() {
    const queryClient = useQueryClient();
    const { data: session, update: updateSession } = useSession();
    const userRoles = useMemo(() => session?.user?.roles || [], [session?.user?.roles]);
    const isAdmin = useMemo(() => userRoles.includes("admin"), [userRoles]);
    const { isCentralStore } = useActiveStore();
    const isCentralAdmin = isAdmin && isCentralStore;

    const { settings, fetchSettings } = useSettingsStore();

    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");
    const [printerOptions, setPrinterOptions] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
    const [qzError, setQzError] = useState<string | null>(null);

    // Initialize React Hook Form
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
            hpp_adjustment_method: "latest",
            cash_in_out_enabled: "true",
            branch_can_create_product: "false",
            branch_can_edit_product_price: "false",
            branch_can_edit_master_data: "false",
            branch_can_manual_stock_adjustment: "false",
            branch_can_stock_opname: "false",
            branch_can_direct_purchase: "false",
            branch_can_transfer_to_other_branch: "false",
            branch_can_apply_manual_discount: "false",
            consignment_commission_mode: "cut_revenue",
        },
    });

    const {
        formState: { dirtyFields, errors },
        reset,
        handleSubmit,
        getValues,
    } = methods;

    // Filter available tabs based on admin & central status
    const tabs = useMemo(() => {
        return SETTINGS_TABS.filter((tab) => {
            if (tab.adminOnly && !isAdmin) return false;
            if (tab.centralOnly && (!isCentralStore || !isAdmin)) return false;
            return true;
        });
    }, [isAdmin, isCentralStore]);

    // Safety fallback: if user loses access to current activeTab, reset to profile
    useEffect(() => {
        const availableTabIds = tabs.map((t) => t.id);
        if (!availableTabIds.includes(activeTab)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab("profile");
        }
    }, [tabs, activeTab]);

    // Helper: Check if a tab has unsaved changes
    const isTabDirty = useCallback((tabFields: readonly (keyof StoreSettingsInput)[]) => {
        return tabFields.some((field) => dirtyFields[field]);
    }, [dirtyFields]);

    // Helper: Check if a tab has validation errors
    const hasTabError = useCallback((tabFields: readonly (keyof StoreSettingsInput)[]) => {
        return tabFields.some((field) => errors[field]);
    }, [errors]);

    // Populate form data once settings are loaded
    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            reset({
                app_name: settings.app_name || "",
                app_address: settings.app_address || "",
                app_phone: settings.app_phone || "",
                app_logo_url: settings.app_logo_url || null,
                tax_rate_ppn: settings.tax_rate_ppn ? Number(settings.tax_rate_ppn) : 0,
                point_rate: settings.point_rate ? Number(settings.point_rate) : 1000,
                point_system_enabled: settings.point_system_enabled ?? "true",
                cash_account_register_uid: settings.cash_account_register_uid || "",
                cash_account_main_uid: settings.cash_account_main_uid || "",
                cash_account_bank_uid: settings.cash_account_bank_uid || "",
                printer_id: settings.printer_id || "",
                hpp_adjustment_method: (settings.hpp_adjustment_method as "latest" | "average") || "latest",
                cash_in_out_enabled: settings.cash_in_out_enabled ?? "true",
                branch_can_create_product: settings.branch_can_create_product ?? "false",
                branch_can_edit_product_price: settings.branch_can_edit_product_price ?? "false",
                branch_can_edit_master_data: settings.branch_can_edit_master_data ?? "false",
                branch_can_manual_stock_adjustment: settings.branch_can_manual_stock_adjustment ?? "false",
                branch_can_stock_opname: settings.branch_can_stock_opname ?? "false",
                branch_can_direct_purchase: settings.branch_can_direct_purchase ?? "false",
                branch_can_transfer_to_other_branch: settings.branch_can_transfer_to_other_branch ?? "false",
                branch_can_apply_manual_discount: settings.branch_can_apply_manual_discount ?? "false",
                consignment_commission_mode: (settings.consignment_commission_mode as "cut_revenue" | "markup_price") || "cut_revenue",
            });
        }
    }, [settings, reset]);

    // Load available printers from PrinterService
    const loadPrinters = useCallback(async () => {
        setIsLoadingPrinters(true);
        setQzError(null);
        try {
            const list = await PrinterService.findAllPrinters();
            const isFlutter = typeof window !== "undefined" && typeof window.FlutterBridge?.postMessage === "function";
            const options = list.map((p: PrinterDevice) => ({
                value: isFlutter ? p.id! : p.name,
                label: p.name,
            }));

            // Preserve currently saved printer_id in options
            const currentPrinter = getValues("printer_id") || settings.printer_id;
            if (currentPrinter && !list.some((p: PrinterDevice) => p.name === currentPrinter)) {
                options.push({ value: currentPrinter, label: `${currentPrinter} (Tidak Ditemukan)` });
            }

            setPrinterOptions(options);
        } catch (err) {
            console.error("Gagal mendeteksi printer dari printer service:", err);
            setQzError("Gagal menghubungkan ke printer service. Pastikan aplikasi printer service telah berjalan.");

            const currentPrinter = getValues("printer_id") || settings.printer_id;
            if (currentPrinter) {
                setPrinterOptions([{ value: currentPrinter, label: currentPrinter }]);
            } else {
                setPrinterOptions([]);
            }
        } finally {
            setIsLoadingPrinters(false);
        }
    }, [getValues, settings.printer_id]);

    // Automatically scan printers when printer tab is active
    useEffect(() => {
        if (activeTab === "printer" && Object.keys(settings).length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadPrinters();
        }
    }, [activeTab, settings, loadPrinters]);

    // Form submission handler
    const onSubmit = async (data: StoreSettingsInput) => {
        setIsSaving(true);
        try {
            const updateTasks: Promise<unknown>[] = [];

            for (const key of Object.keys(data) as Array<keyof StoreSettingsInput>) {
                // If not central admin, ignore all central-only settings fields
                if (!isCentralAdmin && CENTRAL_ONLY_FIELDS.includes(key)) {
                    continue;
                }

                // If not admin, ignore branch store admin settings fields (cash accounts)
                if (!isAdmin && STORE_ADMIN_ONLY_FIELDS.includes(key)) {
                    continue;
                }

                const formValue = data[key];
                const originalValue = settings[key];

                if (key === "app_logo_url") {
                    if (formValue instanceof File) {
                        updateTasks.push(settingsApi.update(key, formValue));
                    } else if (formValue === null && originalValue !== null && originalValue !== "") {
                        updateTasks.push(settingsApi.update(key, null));
                    }
                } else if (key === "tax_rate_ppn" || key === "point_rate") {
                    const formTaxStr = String(formValue);
                    const origTaxStr = originalValue !== null && originalValue !== undefined ? String(originalValue) : "";
                    if (formTaxStr !== origTaxStr) {
                        updateTasks.push(settingsApi.update(key, formTaxStr));
                    }
                } else {
                    const formStr = formValue !== null && formValue !== undefined ? String(formValue) : "";
                    const origStr = originalValue !== null && originalValue !== undefined ? String(originalValue) : "";

                    if (formStr !== origStr) {
                        updateTasks.push(settingsApi.update(key, formValue as string | null));
                    }
                }
            }

            if (updateTasks.length > 0) {
                await Promise.all(updateTasks);
                await fetchSettings();
                await queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
                await queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
                if (updateSession) {
                    await updateSession();
                }
                toast.success("Pengaturan toko berhasil diperbarui.");
            } else {
                toast.info("Tidak ada perubahan yang disimpan.");
            }
        } catch (error) {
            console.error("Gagal menyimpan pengaturan:", error);
            const errObj = error as { response?: { data?: { message?: string } } };
            const msg = errObj?.response?.data?.message || "Terjadi kesalahan saat menyimpan pengaturan.";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    // Form error handler
    const onError = (formErrors: FieldErrors<StoreSettingsInput>) => {
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

    return {
        methods,
        tabs,
        activeTab,
        setActiveTab,
        isAdmin,
        isCentralStore,
        isCentralAdmin,
        isSaving,
        isTabDirty,
        hasTabError,
        printerOptions,
        isLoadingPrinters,
        qzError,
        loadPrinters,
        handleSubmit: handleSubmit(onSubmit, onError),
    };
}
