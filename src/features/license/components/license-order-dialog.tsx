"use client";

import { FormProvider } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Scrollable } from "@/components/ui/scrollable";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { AppButton } from "@/components/shared/app-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CommandOption } from "@/components/ui/command-select";
import { IconReceipt, IconShoppingCart, IconTag } from "@tabler/icons-react";
import type { CatalogProduct } from "../types";
import { useLicenseOrder } from "../hooks/use-license-order";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { LicenseOrderAddonItem } from "./order/license-order-addon-item";
import { LicenseOrderSummary } from "./order/license-order-summary";

interface LicenseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog?: CatalogProduct[];
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
    productCode,
    initialAddonId,
}: LicenseOrderDialogProps) {
    const safeCatalog = Array.isArray(catalog) ? catalog : [];
    const {
        methods,
        targetProduct,
        addons,
        billingPeriod,
        selectedAddonIds,
        includeBase,
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
        productCode,
        initialAddonId,
    });

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
                                Perpanjangan Lisensi & Add-on POS
                            </span>
                            <Badge
                                variant="outline"
                                className="text-[10px] font-mono font-bold px-1.5 py-0 rounded bg-slate-100 text-slate-600 border-slate-200"
                            >
                                {targetProduct.nama}
                            </Badge>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block">
                            Pilih add-on yang ingin diaktifkan untuk mendukung operasional toko
                        </span>
                    </div>
                </div>
            }
            className="sm:max-w-4xl max-h-[90vh] overflow-hidden"
        >
            <FormProvider {...methods}>
                <form onSubmit={onSubmit} className="mt-1 flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* 2-Column Responsive Layout with strictly constrained overflow */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch min-h-0 flex-1 overflow-hidden">
                        {/* LEFT COLUMN: Summary & Order Settings (5 cols) */}
                        <div className="md:col-span-5 flex flex-col min-h-0 max-h-[380px] md:max-h-[450px] md:h-[450px] overflow-hidden">
                            {/* Scrollable Container for Order Settings & Breakdown */}
                            <Scrollable className="flex-1 min-h-0 max-h-[320px] md:max-h-[390px] pr-1.5 overflow-hidden" scrollbarClassName="z-20">
                                <div className="space-y-3 pb-2">
                                    {/* Billing Period Selector with Badge Support */}
                                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
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
                                                                Perpanjang Paket Utama POS
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[9px] font-mono px-1.5 py-0 bg-white"
                                                            >
                                                                {billingPeriod === "annual" ? "+12 Bulan" : "+1 Bulan"}
                                                            </Badge>
                                                        </div>
                                                    }
                                                    description="Aktifkan untuk sekaligus memperpanjang paket lisensi multi-store Anda"
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
                                                <div>
                                                    <span className="font-bold text-xs text-emerald-900 block font-mono">
                                                        {couponResult.code}
                                                    </span>
                                                    <span className="text-[10px] text-emerald-700 font-medium">
                                                        Hemat {formatRupiah(couponDiscount)}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveCoupon}
                                                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                                                >
                                                    Hapus Kupon
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

                                    {/* Order Summary & Final Breakdown */}
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
                                    />
                                </div>
                            </Scrollable>

                            {/* Pinned Bottom Action Buttons - Always visible & docked */}
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
                                    disabled={selectedAddonIds.length === 0 && !includeBase}
                                    className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 rounded-xl shadow-xs cursor-pointer gap-1.5"
                                >
                                    <IconReceipt size={15} />
                                    <span>Buat Pesanan & Bayar</span>
                                </AppButton>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Add-on Selection List (7 cols) */}
                        <div className="md:col-span-7 flex flex-col min-h-0 max-h-[380px] md:max-h-[450px] md:h-[450px] overflow-hidden space-y-2">
                            {/* Header Toolbar for Addons */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-800 block">
                                            Pilih Add-on Tambahan
                                        </span>
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                                            {addons.length} Tersedia
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400">
                                        Pilih add-on yang ingin diaktifkan untuk meningkatkan efisiensi
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={selectAllAddons}
                                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                                    >
                                        Pilih Semua
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <button
                                        type="button"
                                        onClick={clearAllAddons}
                                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                                    >
                                        Batal Pilih
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Container with Addon Cards */}
                            <Scrollable className="flex-1 min-h-0 max-h-[395px] pr-1.5 overflow-hidden" scrollbarClassName="z-20">
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
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
