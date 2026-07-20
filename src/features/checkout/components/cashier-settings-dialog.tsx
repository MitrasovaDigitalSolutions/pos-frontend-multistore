"use client";

import { FormSelect } from "@/components/forms/form-select";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/features/settings/api/settings-api";
import { cn } from "@/lib/utils";
import QZService from "@/services/qz.service";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useSettingsStore } from "@/stores/settings-store";
import { IconBuildingStore, IconPrinter, IconSettings } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Info, Loader2, RefreshCw, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

interface CashierSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface CashierSettingsInput {
    printer_id: string;
    activeStore: string;
}

export function CashierSettingsDialog({ open, onOpenChange }: CashierSettingsDialogProps) {
    const { settings, fetchSettings } = useSettingsStore();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { activeStoreUid, setActiveStore } = useActiveStoreStore();
    const stores = session?.user?.stores ?? [];
    const activeStore = stores.find((s) => s.uid === activeStoreUid);

    const [activeTab, setActiveTab] = useState("printer");
    const [isSaving, setIsSaving] = useState(false);
    const [printerOptions, setPrinterOptions] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
    const [qzError, setQzError] = useState<string | null>(null);

    const methods = useForm<CashierSettingsInput>({
        values: {
            printer_id: settings.printer_id || "",
            activeStore: activeStoreUid || "",
        },
    });

    const { handleSubmit, reset, formState: { isDirty } } = methods;

    // Load settings values into form
    useEffect(() => {
        if (open && Object.keys(settings).length > 0) {
            reset({
                printer_id: settings.printer_id || "",
                activeStore: activeStoreUid || "",
            });
        }
    }, [open, settings, activeStoreUid, reset]);

    // Fetch printers from QZ Tray
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

    // Load printers when printer tab is active
    useEffect(() => {
        if (open && activeTab === "printer") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadPrinters();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, activeTab]);

    const onSubmit = async (data: CashierSettingsInput) => {
        setIsSaving(true);
        let hasChanges = false;
        try {
            if (data.printer_id !== settings.printer_id) {
                await settingsApi.update("printer_id", data.printer_id);
                await fetchSettings();
                toast.success("Pengaturan printer kasir berhasil disimpan.");
                hasChanges = true;
            }

            if (data.activeStore && data.activeStore !== activeStoreUid) {
                const targetStore = stores.find((s) => s.uid === data.activeStore);
                if (targetStore) {
                    const toastId = toast.loading(`Sedang berpindah ke ${targetStore.nama}...`);
                    setActiveStore(data.activeStore);
                    await Promise.all([
                        queryClient.invalidateQueries(),
                        fetchSettings(),
                    ]);
                    toast.success(`Berhasil berpindah ke ${targetStore.nama}`, { id: toastId });
                    hasChanges = true;
                }
            }

            if (!hasChanges) {
                toast.info("Tidak ada perubahan pengaturan.");
            } else {
                onOpenChange(false);
            }
        } catch (error) {
            console.error("Gagal menyimpan pengaturan:", error);
            toast.error("Gagal menyimpan pengaturan.");
        } finally {
            setIsSaving(false);
        }
    };

    const renderStatusBadge = () => {
        if (isLoadingPrinters) {
            return (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100/50 text-[9px] font-bold animate-pulse">
                    <Loader2 className="animate-spin" size={8} />
                    Memindai
                </div>
            );
        }
        if (qzError) {
            return (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100/50 text-[9px] font-bold">
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                    Terputus
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 text-[9px] font-bold">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                Aktif
            </div>
        );
    };

    const tabs = [
        {
            id: "printer",
            label: "Printer",
            icon: IconPrinter,
            disabled: false,
        },
        {
            id: "store",
            label: "Toko",
            icon: IconBuildingStore,
            disabled: false,
        },
        {
            id: "general",
            label: "Pengaturan Lain",
            icon: IconSettings,
            disabled: true,
        },
    ];

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconSettings size={18} className="text-slate-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Pengaturan Terminal</span>
                </div>
            }
            className="sm:max-w-md overflow-hidden"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                    {/* Horizontal top tabs */}
                    <div className="flex border-b border-slate-100 gap-1.5 bg-slate-50/40 shrink-0 p-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    disabled={tab.disabled}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all select-none border-none",
                                        tab.disabled && "opacity-35 cursor-not-allowed",
                                        !tab.disabled && "cursor-pointer",
                                        isActive && !tab.disabled
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : !tab.disabled && "text-slate-500 hover:bg-slate-200/50 hover:text-slate-800"
                                    )}
                                >
                                    <Icon size={12} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content viewport */}
                    <div className="p-5 space-y-4">
                        {activeTab === "printer" && (
                            <div className="space-y-4">
                                {/* Services Status Row */}
                                <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Status Integrasi</span>
                                        <span className="text-[11px] font-bold text-slate-700 mt-0.5">Layanan QZ Tray</span>
                                    </div>
                                    <div>
                                        {renderStatusBadge()}
                                    </div>
                                </div>

                                {/* Printer Selection Input */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama / ID Printer</span>
                                        <button
                                            type="button"
                                            onClick={loadPrinters}
                                            disabled={isLoadingPrinters || isSaving}
                                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-1 disabled:opacity-50 transition-colors bg-transparent border-none cursor-pointer p-0"
                                        >
                                            {isLoadingPrinters ? (
                                                <Loader2 className="animate-spin" size={10} />
                                            ) : (
                                                <RefreshCw size={10} />
                                            )}
                                            Pindai Ulang
                                        </button>
                                    </div>
                                    <FormSelect<CashierSettingsInput>
                                        name="printer_id"
                                        options={printerOptions}
                                        placeholder={isLoadingPrinters ? "Memuat printer..." : "Pilih Printer"}
                                        disabled={isSaving || isLoadingPrinters}
                                        emptyMessage={qzError ? "Gagal terhubung ke QZ Tray" : "Tidak ada printer"}
                                    />
                                </div>

                                {/* Quick guidance */}
                                <div className="text-[10px] text-slate-400 leading-relaxed flex gap-1.5 items-start bg-slate-50/30 p-2.5 border border-slate-100 rounded-xl">
                                    <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>
                                        Pastikan QZ Tray sudah berjalan di komputer terminal kasir ini sebelum menekan tombol <strong>Pindai Ulang</strong>.
                                    </span>
                                </div>
                            </div>
                        )}

                        {activeTab === "store" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Pilih Outlet / Toko Aktif
                                        </span>
                                        {stores.length > 0 && (
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {stores.length} Toko Terdaftar
                                            </span>
                                        )}
                                    </div>
                                    <FormSelect<CashierSettingsInput>
                                        name="activeStore"
                                        options={stores.map((s) => ({
                                            value: s.uid,
                                            label: s.nama,
                                            description: s.is_central ? "Toko Pusat" : "Toko Cabang",
                                        }))}
                                        placeholder="Pilih Toko"
                                        leftIcon={
                                            <IconBuildingStore
                                                size={16}
                                                className={`shrink-0 ${activeStore?.is_central ? "text-emerald-600" : "text-slate-500"
                                                    }`}
                                            />
                                        }
                                        rightElement={
                                            activeStore?.is_central ? (
                                                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
                                                    Pusat
                                                </span>
                                            ) : (
                                                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200/80 leading-none">
                                                    Cabang
                                                </span>
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="text-[10px] font-bold uppercase tracking-wider rounded-xl px-4 py-2 h-auto cursor-pointer"
                        >
                            Batal
                        </Button>
                        {activeTab !== "general" && (
                            <Button
                                type="submit"
                                disabled={!isDirty || isSaving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-sm px-5 py-2 h-auto cursor-pointer border-none flex items-center gap-1.5 active:scale-[0.98] transition-all"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={10} />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={10} />
                                        Simpan
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
