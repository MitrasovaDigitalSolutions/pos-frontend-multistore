"use client";

import { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Scrollable } from "@/components/ui/scrollable";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { AppButton } from "@/components/shared/app-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CommandOption } from "@/components/ui/command-select";
import {
    IconAlertCircle,
    IconReceipt,
    IconServer,
    IconShoppingCart,
    IconTag,
} from "@tabler/icons-react";
import type { CatalogProduct, ServerPackage } from "../types";
import { useLicenseOrder } from "../hooks/use-license-order";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { LicenseOrderAddonItem } from "./order/license-order-addon-item";
import { LicenseOrderSummary } from "./order/license-order-summary";
import { cn } from "@/lib/utils";

interface LicenseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog?: CatalogProduct[];
    serverPackages?: ServerPackage[];
    productCode?: string;
    initialAddonId?: string;
}

const BILLING_OPTIONS: CommandOption[] = [
    {
        value: "monthly",
        label: "Bulanan",
        description: "Pembayaran reguler per bulan",
    },
    {
        value: "annual",
        label: "Tahunan",
        badge: "Hemat 17%",
        description: "Pembayaran 1 tahun sekaligus",
    },
];

export function LicenseOrderDialog({
    open,
    onOpenChange,
    catalog = [],
    serverPackages = [],
    productCode,
    initialAddonId,
}: LicenseOrderDialogProps) {
    const safeCatalog = Array.isArray(catalog) ? catalog : [];
    const safeServerPackages = Array.isArray(serverPackages) ? serverPackages : [];
    const {
        methods,
        targetProduct,
        addons,
        billingPeriod,
        selectedAddonIds,
        includeBase,
        includeServer,
        selectedServer,
        serverPackages: orderServerPackages,
        currentServerPrice,
        selectServerPackage,
        displayTotal,
        totalMonthly,
        totalAnnual,
        displayAddonsTotal,
        currentBasePrice,
        toggleAddon,
        selectAllAddons,
        clearAllAddons,
        couponInput,
        setCouponInput,
        couponResult,
        couponError,
        isCheckingCoupon,
        couponDiscount,
        handleApplyCoupon,
        handleRemoveCoupon,
        isPending,
        onSubmit,
    } = useLicenseOrder({
        open,
        onOpenChange,
        catalog: safeCatalog,
        serverPackages: safeServerPackages,
        productCode,
        initialAddonId,
    });

    const serverOptions: CommandOption[] = useMemo(() => {
        return orderServerPackages.map((pkg) => {
            const isFree = pkg.harga_bulanan === 0;
            const price = billingPeriod === "annual" ? pkg.harga_tahunan : pkg.harga_bulanan;
            const priceLabel = isFree ? "Gratis" : `${formatRupiah(price)}/${billingPeriod === "annual" ? "thn" : "bln"}`;
            const specs = [pkg.cpu, pkg.ram, pkg.storage].filter(Boolean).filter(s => s !== "Self-Hosted").join(" • ");
            return {
                value: pkg.id,
                label: pkg.nama,
                description: specs || (pkg.description ?? undefined),
                badge: priceLabel,
            };
        });
    }, [orderServerPackages, billingPeriod]);

    // Validation: Server is strictly required if base package extension is checked
    const isServerRequiredMissing = includeBase && !selectedServer;
    const isNothingSelected =
        selectedAddonIds.length === 0 &&
        !includeBase &&
        (!includeServer || currentServerPrice === 0);
    const isSubmitDisabled = isPending || isServerRequiredMissing || isNothingSelected;

    if (!targetProduct) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            scrollable={false}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/70 shadow-2xs shrink-0">
                        <IconShoppingCart size={17} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm block leading-tight">
                                Pembaruan Langganan & Add-on POS
                            </span>
                            <Badge
                                variant="outline"
                                className="text-[10px] font-mono font-bold px-1.5 py-0 rounded bg-slate-100 text-slate-600 border-slate-200"
                            >
                                {targetProduct.nama}
                            </Badge>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block">
                            Pilih paket utama, server, dan add-on yang ingin diaktifkan
                        </span>
                    </div>
                </div>
            }
            className="sm:max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-hidden"
        >
            <FormProvider {...methods}>
                <form onSubmit={onSubmit} className="mt-1 flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* 3-Column Responsive Layout: Clear Separation of Configuration, Add-ons, and Checkout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch min-h-0 flex-1 overflow-hidden">
                        {/* COLUMN 1: Base Plan & Server Infrastructure (4 cols on lg) */}
                        <div className="lg:col-span-4 flex flex-col min-h-0 max-h-[380px] md:max-h-[460px] lg:h-[460px] overflow-hidden">
                            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 shrink-0">
                                <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center border border-emerald-200">
                                    1
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                    Paket & Server
                                </span>
                            </div>

                            {/* Scrollable Container for Column 1 */}
                            <Scrollable className="flex-1 min-h-0 max-h-[340px] md:max-h-[420px] pr-1.5 overflow-hidden" scrollbarClassName="z-20">
                                <div className="space-y-3 pt-2 pb-2">
                                    {/* Billing Period Selector */}
                                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 block">
                                                Periode Penagihan
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                Pilih siklus pembayaran langganan
                                            </span>
                                        </div>
                                        <FormSelect
                                            name="billing_period"
                                            options={BILLING_OPTIONS}
                                            placeholder="Pilih periode penagihan"
                                            className="bg-white"
                                        />
                                    </div>

                                    {/* Base Product Extension Switch */}
                                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <FormSwitch
                                                    name="include_base_product"
                                                    label={
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="font-semibold text-xs text-slate-800">
                                                                Perbarui Paket Utama POS
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[9px] font-mono px-1.5 py-0 bg-white"
                                                            >
                                                                {billingPeriod === "annual" ? "+12 Bulan" : "+1 Bulan"}
                                                            </Badge>
                                                        </div>
                                                    }
                                                    description="Aktifkan untuk sekaligus memperbarui masa aktif paket lisensi toko"
                                                    className="border-0 p-0 bg-transparent shadow-none"
                                                />
                                            </div>
                                            {currentBasePrice > 0 && (
                                                <div className="text-right shrink-0 pt-0.5">
                                                    <span className="font-bold text-xs text-emerald-700 font-mono block">
                                                        {formatRupiah(currentBasePrice)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        /{billingPeriod === "annual" ? "tahun" : "bulan"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Server Infrastructure Selector */}
                                    {orderServerPackages.length > 0 && (
                                        <div className={cn(
                                            "p-3 rounded-xl border transition-colors space-y-2.5",
                                            isServerRequiredMissing
                                                ? "bg-rose-50/40 border-rose-300"
                                                : "bg-slate-50/80 border-slate-200/80"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <IconServer size={14} className="text-blue-600" />
                                                    <span className="text-xs font-bold text-slate-800">
                                                        Infrastruktur Server
                                                    </span>
                                                    {includeBase && (
                                                        <span className="text-[9px] font-extrabold text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded-full">
                                                            Wajib Dipilih
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[11px] text-slate-400 block -mt-1">
                                                Pilih hosting cloud POS atau server lokal toko Anda
                                            </span>

                                            <FormSelect
                                                name="server_package_id"
                                                options={serverOptions}
                                                placeholder="Pilih paket server..."
                                                className="bg-white"
                                                clearable={true}
                                                onChange={(val) => selectServerPackage(val || null)}
                                                onClear={() => selectServerPackage(null)}
                                            />

                                            {/* Mandatory Alert if Base Product Checked but Server Not Selected */}
                                            {isServerRequiredMissing && (
                                                <p className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 p-1.5 rounded-lg flex items-center gap-1.5">
                                                    <IconAlertCircle size={13} className="shrink-0 text-rose-600" />
                                                    <span>Paket server wajib dipilih jika memperbarui paket utama POS.</span>
                                                </p>
                                            )}

                                            {/* Selected Server Specs Chip */}
                                            {selectedServer && (
                                                <div className="p-2 rounded-lg bg-white border border-slate-200/80 space-y-1 text-[11px]">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-slate-800">{selectedServer.nama}</span>
                                                        <span className="font-mono font-bold text-blue-700">
                                                            {currentServerPrice > 0
                                                                ? `${formatRupiah(currentServerPrice)}/${billingPeriod === "annual" ? "tahun" : "bulan"}`
                                                                : "Rp 0 (Gratis)"}
                                                        </span>
                                                    </div>
                                                    {selectedServer.cpu && selectedServer.cpu !== "Self-Hosted" && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium flex-wrap">
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                                                                {selectedServer.cpu}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                                                                {selectedServer.ram}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                                                                {selectedServer.storage}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {selectedServer.description && (
                                                        <p className="text-[10px] text-slate-400 line-clamp-2">
                                                            {selectedServer.description}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Scrollable>
                        </div>

                        {/* COLUMN 2: Add-on Selection List (4 cols on lg) */}
                        <div className="lg:col-span-4 flex flex-col min-h-0 max-h-[380px] md:max-h-[460px] lg:h-[460px] overflow-hidden space-y-2">
                            {/* Header Toolbar for Addons */}
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center border border-emerald-200">
                                        2
                                    </span>
                                    <span className="text-xs font-bold text-slate-800">
                                        Pilih Add-on
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 ml-0.5">
                                        {addons.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <button
                                        type="button"
                                        onClick={selectAllAddons}
                                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                                    >
                                        Semua
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <button
                                        type="button"
                                        onClick={clearAllAddons}
                                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Container with Addon Cards */}
                            <Scrollable className="flex-1 min-h-0 max-h-[340px] md:max-h-[420px] pr-1.5 overflow-hidden" scrollbarClassName="z-20">
                                <div className="flex flex-col gap-2 p-0.5 pb-2">
                                    {addons.map((addon) => (
                                        <LicenseOrderAddonItem
                                            key={addon.id}
                                            addon={addon}
                                            isSelected={selectedAddonIds.includes(addon.id)}
                                            billingPeriod={billingPeriod}
                                            onToggle={() => toggleAddon(addon.id)}
                                        />
                                    ))}
                                </div>
                            </Scrollable>
                        </div>

                        {/* COLUMN 3: Cost Summary & Docked Checkout (4 cols on lg, always visible) */}
                        <div className="lg:col-span-4 md:col-span-2 lg:col-span-4 flex flex-col min-h-0 max-h-[420px] md:max-h-[460px] lg:h-[460px] overflow-hidden">
                            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 shrink-0">
                                <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center border border-emerald-200">
                                    3
                                </span>
                                <span className="text-xs font-bold text-slate-800">
                                    Total & Pembayaran
                                </span>
                            </div>

                            {/* Scrollable Container for Summary & Promo Coupon */}
                            <Scrollable className="flex-1 min-h-0 max-h-[340px] md:max-h-[390px] pr-1.5 overflow-hidden" scrollbarClassName="z-20">
                                <div className="space-y-2.5 pt-2 pb-2">
                                    {/* Promo Coupon Card */}
                                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                <IconTag size={13} className="text-emerald-600" />
                                                <span>Kupon Promo / Diskon</span>
                                            </span>
                                            {couponResult && (
                                                <Badge variant="outline" className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border-emerald-300">
                                                    Kupon Aktif
                                                </Badge>
                                            )}
                                        </div>

                                        {couponResult ? (
                                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-xs text-emerald-900 block font-mono">
                                                            {couponResult.code}
                                                        </span>
                                                        {couponResult.discount_value > 0 && (
                                                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-1 py-0.2 rounded font-mono">
                                                                {couponResult.discount_type === "percentage" ? `${couponResult.discount_value}%` : "Potongan"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-emerald-700 font-medium block truncate">
                                                        {couponResult.name ? `${couponResult.name} • ` : ""}Hemat {couponResult.formatted_discount || formatRupiah(couponDiscount)}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveCoupon}
                                                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="text"
                                                        value={couponInput}
                                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                void handleApplyCoupon();
                                                            }
                                                        }}
                                                        placeholder="Kode promo..."
                                                        className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-mono uppercase bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={isCheckingCoupon || !couponInput.trim()}
                                                        onClick={() => void handleApplyCoupon()}
                                                        className="h-8 px-3 text-xs font-bold rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50 cursor-pointer shrink-0"
                                                    >
                                                        {isCheckingCoupon ? "Cek..." : "Terapkan"}
                                                    </Button>
                                                </div>
                                                {couponError && (
                                                    <span className="text-[10px] text-rose-600 font-medium block">
                                                        {couponError}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Summary & Final Breakdown - ALWAYS clearly visible */}
                                    <LicenseOrderSummary
                                        selectedCount={selectedAddonIds.length}
                                        billingPeriod={billingPeriod}
                                        includeBase={includeBase}
                                        totalMonthly={totalMonthly}
                                        totalAnnual={totalAnnual}
                                        displayTotal={displayTotal}
                                        basePrice={currentBasePrice}
                                        addonsTotal={displayAddonsTotal}
                                        couponDiscount={couponDiscount}
                                        couponCode={couponResult?.code}
                                        serverPrice={currentServerPrice}
                                        includeServer={includeServer && currentServerPrice > 0}
                                    />
                                </div>
                            </Scrollable>

                            {/* Pinned Bottom Action Buttons for Column 3 */}
                            <div className="pt-2.5 border-t border-slate-100 bg-white shrink-0 mt-auto flex items-center gap-2">
                                <AppButton
                                    type="button"
                                    variant="outline"
                                    className="flex-1 text-xs font-bold h-9 rounded-xl cursor-pointer"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Batal
                                </AppButton>
                                <AppButton
                                    type="submit"
                                    isLoading={isPending}
                                    disabled={isSubmitDisabled}
                                    className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 rounded-xl shadow-xs cursor-pointer gap-1.5"
                                >
                                    <IconReceipt size={15} />
                                    <span>Buat Pesanan & Bayar</span>
                                </AppButton>
                            </div>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
