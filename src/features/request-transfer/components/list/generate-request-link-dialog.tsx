"use client";

import { useMemo, useState } from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { CommandSelect } from "@/components/ui/command-select";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { useStores } from "@/features/stores/api/stores-api";
import { useAllSupplierSales } from "@/features/supplier-sales/api/supplier-sales-api";
import { useActiveStoreStore } from "@/stores/active-store-store";
import {
    IconBrandWhatsapp,
    IconCheck,
    IconCopy,
    IconExternalLink,
    IconLink,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface GenerateRequestLinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GenerateRequestLinkDialog({
    open,
    onOpenChange,
}: GenerateRequestLinkDialogProps) {
    const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);

    const { data: storesRes } = useStores({ per_page: 1000 });
    const { data: suppliers = [], isLoading: isLoadingSuppliers } = useAllSuppliers();
    const { data: supplierSales = [], isLoading: isLoadingSales } = useAllSupplierSales();

    const stores = useMemo(() => storesRes?.data || [], [storesRes?.data]);

    const [supplierUid, setSupplierUid] = useState<string>("");
    const [supplierSalesUid, setSupplierSalesUid] = useState<string>("");
    const [copied, setCopied] = useState<boolean>(false);

    // Target store is current active store (e.g. Toko Pusat)
    const targetStoreUid = activeStoreUid ?? stores[0]?.uid ?? "";
    const activeStore = stores.find((s) => s.uid === targetStoreUid);
    const activeStoreName = activeStore
        ? activeStore.is_central
            ? `${activeStore.nama} (Pusat)`
            : activeStore.nama
        : "Toko Pusat";

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setSupplierUid("");
            setSupplierSalesUid("");
            setCopied(false);
        }
    };

    const handleSupplierChange = (uid: string) => {
        setSupplierUid(uid);
        if (uid && supplierSalesUid) {
            const currentSale = supplierSales.find((s) => s.uid === supplierSalesUid);
            if (currentSale && currentSale.supplier_uid !== uid) {
                setSupplierSalesUid("");
            }
        }
    };

    const handleCatalogChange = (uid: string) => {
        setSupplierSalesUid(uid);
        if (uid) {
            const sale = supplierSales.find((s) => s.uid === uid);
            if (sale?.supplier_uid) {
                setSupplierUid(sale.supplier_uid);
            }
        }
    };

    // Filter sales by supplier if selected
    const filteredSales = useMemo(() => {
        return (supplierSales || []).filter(
            (s) => !supplierUid || s.supplier_uid === supplierUid
        );
    }, [supplierSales, supplierUid]);

    const salesOptions = useMemo(() => {
        return filteredSales.map((s) => ({
            value: s.uid,
            label: s.nama,
            description: s.supplier?.nama ? `Supplier: ${s.supplier.nama}` : undefined,
        }));
    }, [filteredSales]);

    // Build URL
    const getGeneratedUrl = (full: boolean = true) => {
        const params = new URLSearchParams();
        if (targetStoreUid) params.set("request_to", targetStoreUid);
        if (supplierUid) params.set("supplier_uid", supplierUid);
        if (supplierSalesUid) params.set("supplier_sales_uid", supplierSalesUid);

        const queryString = params.toString();
        const relativePath = `/admin/request-transfer/create${queryString ? `?${queryString}` : ""}`;

        if (!full || typeof window === "undefined") {
            return relativePath;
        }

        return `${window.location.origin}${relativePath}`;
    };

    const generatedFullUrl = getGeneratedUrl(true);
    const generatedRelativePath = getGeneratedUrl(false);

    const selectedSupplier = suppliers.find((s) => s.uid === supplierUid);
    const selectedCatalog = supplierSales.find((s) => s.uid === supplierSalesUid);

    const handleCopy = async () => {
        if (!targetStoreUid) {
            toast.error("Toko tujuan request tidak teridentifikasi.");
            return;
        }
        try {
            await navigator.clipboard.writeText(generatedFullUrl);
            setCopied(true);
            toast.success("Link berhasil disalin ke clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin link.");
        }
    };

    const handleWhatsAppShare = () => {
        if (!targetStoreUid) {
            toast.error("Toko tujuan request tidak teridentifikasi.");
            return;
        }

        let message = `*REQUEST MUTASI STOK / PEMBELIAN*\n\nSilakan input kebutuhan stok toko Anda untuk pengajuan ke *${activeStoreName}*`;

        if (selectedCatalog) {
            message += `\nKatalog: *${selectedCatalog.nama}*`;
        }
        if (selectedSupplier) {
            message += `\nSupplier: *${selectedSupplier.nama}*`;
        }

        message += `\n\nLink Form Request:\n${generatedFullUrl}\n\nTerima kasih!`;

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
    };

    const dialogTitle = (
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <IconLink size={18} stroke={2.5} />
            </div>
            <div>
                <span className="text-sm font-bold text-slate-800 block leading-tight">
                    Generate Link Request
                </span>
                <span className="text-[10px] text-slate-400 font-normal block leading-tight">
                    Link order katalog sales khusus untuk cabang
                </span>
            </div>
        </div>
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={handleOpenChange}
            title={dialogTitle}
            className="sm:max-w-md"
        >
            <div className="space-y-3.5 pt-1">
                {/* Form Selectors */}
                <div className="space-y-2.5">
                    {/* Supplier */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Supplier
                            </label>
                            <span className="text-[10px] text-slate-400 font-normal">(opsional)</span>
                        </div>
                        <CommandSelect
                            value={supplierUid}
                            onChange={handleSupplierChange}
                            options={suppliers.map((s) => ({ value: s.uid, label: s.nama }))}
                            placeholder="Pilih supplier..."
                            searchPlaceholder="Cari nama supplier..."
                            isLoading={isLoadingSuppliers}
                        />
                    </div>

                    {/* Sales Catalog */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Katalog Sales
                            </label>
                            <span className="text-[10px] text-slate-400 font-normal">(opsional)</span>
                        </div>
                        <CommandSelect
                            value={supplierSalesUid}
                            onChange={handleCatalogChange}
                            options={salesOptions}
                            placeholder="Pilih katalog sales..."
                            searchPlaceholder="Cari nama katalog..."
                            isLoading={isLoadingSales}
                            emptyMessage="Tidak ada katalog sales"
                        />
                    </div>
                </div>

                {/* Generated Link Box */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Link URL Request
                    </label>
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono break-all line-clamp-1 select-all px-2 flex-1">
                            {generatedFullUrl}
                        </span>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleCopy}
                            className={`h-7 px-2.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all ${copied
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                                }`}
                        >
                            {copied ? (
                                <>
                                    <IconCheck size={13} className="mr-1" /> Tersalin
                                </>
                            ) : (
                                <>
                                    <IconCopy size={13} className="mr-1" /> Salin
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                        type="button"
                        onClick={() => window.open(generatedRelativePath, "_blank")}
                        variant="outline"
                        className="h-8.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <IconExternalLink size={14} />
                        Buka Form
                    </Button>
                    <Button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="h-8.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                        <IconBrandWhatsapp size={15} />
                        Kirim WA
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
}

