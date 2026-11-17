"use client";

import { FormSelect } from "@/components/forms/form-select";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PrinterService, { type PrinterDevice } from "@/services/printer.service";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { usePrinterStore } from "@/stores/printer-store";
import { IconBuildingStore, IconPrinter, IconSettings } from "@tabler/icons-react";
import { STORE_BADGE_HQ, STORE_LABEL_HQ, STORE_LABEL_BRANCH } from "@/constants/store";
import { useQueryClient } from "@tanstack/react-query";
import { Info, Loader2, RefreshCw, Save, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Show } from "@/components/ui/show";
import { catalogSyncManager } from "@/features/checkout/services/catalog-sync-manager";

interface CashierSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface CashierSettingsInput {
    printer_id: string;
    activeStore: string;
}

export function CashierSettingsDialog({ open, onOpenChange }: CashierSettingsDialogProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { activeStoreUid, setActiveStore } = useActiveStoreStore();
    const { printerId, setPrinterId } = usePrinterStore();
    const stores = session?.user?.stores ?? [];

    const [activeTab, setActiveTab] = useState("printer");
    const [isSaving, setIsSaving] = useState(false);
    const [printerOptions, setPrinterOptions] = useState<{ value: string; label: string }[]>([]);
    const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
    const [qzError, setQzError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        return catalogSyncManager.subscribe((p) => {
            setIsSyncing(p.isSyncing);
        });
    }, []);

    // Form only manages activeStore — printer_id is client-side via printer-store
    const methods = useForm<CashierSettingsInput>({
        values: {
            printer_id: printerId,
            activeStore: activeStoreUid || "",
        },
    });

    const { handleSubmit, reset, formState: { isDirty } } = methods;
    const selectedStoreUid = useWatch({ control: methods.control, name: "activeStore" });
    const selectedStore = stores.find((s) => s.uid === selectedStoreUid);

    // Sync printer_id from store into form when dialog opens
    useEffect(() => {
        if (open) {
            reset({
                printer_id: printerId,
                activeStore: activeStoreUid || "",
            });
        }
    }, [open, printerId, activeStoreUid, reset]);

    // Fetch printers from Print Service
    const loadPrinters = useCallback(async () => {
        setIsLoadingPrinters(true);
        setQzError(null);
        try {
            const list = await PrinterService.findAllPrinters();
            const isFlutter = typeof window !== "undefined" && typeof window.FlutterBridge?.postMessage === "function";
            const options = list.map((p: PrinterDevice) => ({ value: isFlutter ? p.id! : p.name, label: p.name }));

            // Ensure currently saved printer_id is in the options list
            if (printerId && !list.some((p: PrinterDevice) => p.name === printerId)) {
                options.push({ value: printerId, label: printerId });
            }

            setPrinterOptions(options);
        } catch (err) {
            console.error("Gagal mendeteksi printer dari Print Service:", err);
            setQzError(
                err instanceof Error && err.message.includes("diblokir browser")
                    ? err.message
                    : "Gagal menghubungkan ke Print Service. Pastikan aplikasi Print Service telah berjalan."
            );

            if (printerId) {
                setPrinterOptions([{ value: printerId, label: printerId }]);
            } else {
                setPrinterOptions([]);
            }
        } finally {
            setIsLoadingPrinters(false);
        }
    }, [printerId]);

    // Auto-scan printers when printer tab opens (LNA permission already guaranteed
    // by PrinterPermissionGate wrapping the checkout page)
    useEffect(() => {
        if (!open || activeTab !== "printer") return;
        let isCancelled = false;
        queueMicrotask(() => {
            if (!isCancelled) {
                void loadPrinters();
            }
        });
        return () => {
            isCancelled = true;
        };
    }, [open, activeTab, loadPrinters]);

    const onSubmit = async (data: CashierSettingsInput) => {
        setIsSaving(true);
        let hasChanges = false;
        try {
            // Save printer_id to client-side store (localStorage), not server
            if (data.printer_id !== printerId) {
                setPrinterId(data.printer_id);
                toast.success("Printer kasir berhasil disimpan di terminal ini.");
                hasChanges = true;
            }

            if (data.activeStore && data.activeStore !== activeStoreUid) {
                if (catalogSyncManager.isCurrentlySyncing()) {
                    toast.warning("Mohon tunggu, proses sinkronisasi katalog sedang berlangsung.");
                    setIsSaving(false);
                    return;
                }

                const targetStore = stores.find((s) => s.uid === data.activeStore);
                if (targetStore) {
                    const toastId = toast.loading(`Sedang berpindah ke ${targetStore.nama}...`);
                    setActiveStore(data.activeStore);
                    await queryClient.invalidateQueries();
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
                        <Show.When isTrue={activeTab === "printer"}>
                            <div className="space-y-4">
                                {/* Services Status Row */}
                                <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Status Integrasi</span>
                                        <span className="text-[11px] font-bold text-slate-700 mt-0.5">Print Service</span>
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
                                            <Show.When isTrue={isLoadingPrinters}>
                                                <Loader2 className="animate-spin" size={10} />
                                            </Show.When>
                                            <Show.When isTrue={!isLoadingPrinters}>
                                                <RefreshCw size={10} />
                                            </Show.When>
                                            Pindai Ulang
                                        </button>
                                    </div>
                                    <FormSelect<CashierSettingsInput>
                                        name="printer_id"
                                        options={printerOptions}
                                        placeholder={isLoadingPrinters ? "Memuat printer..." : "Pilih Printer"}
                                        disabled={isSaving || isLoadingPrinters}
                                        emptyMessage={qzError ? "Gagal terhubung ke Print Service" : "Tidak ada printer"}
                                    />
                                </div>

                                {/* Quick guidance */}
                                <div className="text-[10px] text-slate-500 leading-relaxed flex flex-col gap-2 bg-slate-50/50 p-3 border border-slate-100 rounded-xl">
                                    <div className="flex gap-1.5 items-start">
                                        <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span>
                                            Pastikan driver & aplikasi <strong>Print Service</strong> telah dipasang dan berjalan di komputer ini.
                                        </span>
                                    </div>
                                    <a
                                        href="https://portal.mitrasovapos.my.id/downloads/service-print.exe"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center gap-1 text-[10px] no-underline transition-colors pl-4"
                                    >
                                        <span>Unduh Print Service (Windows .exe)</span>
                                        <ExternalLink size={10} />
                                    </a>
                                </div>
                            </div>
                        </Show.When>

                        <Show.When isTrue={activeTab === "store"}>
                            <div className="space-y-4">
                                <Show.When isTrue={isSyncing}>
                                    <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2.5 shadow-xs">
                                        <Loader2 size={15} className="animate-spin text-amber-600 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="font-bold block text-amber-950">Sinkronisasi Katalog Sedang Berjalan</span>
                                            <span className="text-amber-800 text-[10.5px] leading-relaxed">
                                                Perpindahan toko terkunci sementara demi integritas data lokal hingga proses pengunduhan katalog selesai.
                                            </span>
                                        </div>
                                    </div>
                                </Show.When>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Pilih Outlet / Toko Aktif
                                        </span>
                                        <Show.When isTrue={stores.length > 0}>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {stores.length} Toko Terdaftar
                                            </span>
                                        </Show.When>
                                    </div>
                                    <FormSelect<CashierSettingsInput>
                                        name="activeStore"
                                        options={stores.map((s) => ({
                                            value: s.uid,
                                            label: s.nama,
                                            description: s.is_central ? STORE_LABEL_HQ : STORE_LABEL_BRANCH,
                                        }))}
                                        placeholder="Pilih Toko"
                                        disabled={isSaving || isSyncing}
                                        leftIcon={
                                            <IconBuildingStore
                                                size={16}
                                                className={`shrink-0 ${selectedStore?.is_central ? "text-emerald-600" : "text-slate-500"
                                                    }`}
                                            />
                                        }
                                        rightElement={
                                            selectedStore?.is_central ? (
                                                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
                                                    {STORE_BADGE_HQ}
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
                        </Show.When>
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
                        <Show.When isTrue={activeTab !== "general"}>
                            <Button
                                type="submit"
                                disabled={!isDirty || isSaving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-sm px-5 py-2 h-auto cursor-pointer border-none flex items-center gap-1.5 active:scale-[0.98] transition-all"
                            >
                                <Show.When isTrue={isSaving}>
                                    <Loader2 className="animate-spin" size={10} />
                                    Menyimpan...
                                </Show.When>
                                <Show.When isTrue={!isSaving}>
                                    <Save size={10} />
                                    Simpan
                                </Show.When>
                            </Button>
                        </Show.When>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
