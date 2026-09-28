"use client";

import { memo, useMemo } from "react";
import { Scrollable } from "@/components/ui/scrollable";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { Badge } from "@/components/ui/badge";
import type { CommandOption } from "@/components/ui/command-select";
import { IconAlertCircle, IconServer } from "@tabler/icons-react";
import type { ServerPackage } from "../../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";

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

interface LicenseOrderConfigColumnProps {
    billingPeriod: "monthly" | "annual";
    onBillingPeriodChange: (val: string) => void;
    includeBase: boolean;
    onIncludeBaseChange: (val: boolean) => void;
    currentBasePrice: number;
    serverPackages: ServerPackage[];
    selectedServer: ServerPackage | null;
    currentServerPrice: number;
    onSelectServerPackage: (id: string | null) => void;
    isServerRequiredMissing: boolean;
}

export const LicenseOrderConfigColumn = memo(function LicenseOrderConfigColumn({
    billingPeriod,
    onBillingPeriodChange,
    includeBase,
    onIncludeBaseChange,
    currentBasePrice,
    serverPackages,
    selectedServer,
    currentServerPrice,
    onSelectServerPackage,
    isServerRequiredMissing,
}: LicenseOrderConfigColumnProps) {
    const serverOptions: CommandOption[] = useMemo(() => {
        return serverPackages.map((pkg) => {
            const isFree = pkg.harga_bulanan === 0;
            const price =
                billingPeriod === "annual"
                    ? pkg.harga_tahunan
                    : pkg.harga_bulanan;
            const priceLabel = isFree
                ? "Gratis"
                : `${formatRupiah(price)}/${billingPeriod === "annual" ? "thn" : "bln"}`;
            const specs = [pkg.cpu, pkg.ram, pkg.storage]
                .filter(Boolean)
                .filter((s) => s !== "Self-Hosted")
                .join(" • ");
            return {
                value: pkg.id,
                label: pkg.nama,
                description: specs || (pkg.description ?? undefined),
                badge: priceLabel,
            };
        });
    }, [serverPackages, billingPeriod]);

    return (
        <div className="lg:col-span-4 flex flex-col min-h-0 max-h-[380px] md:max-h-[460px] lg:h-[460px] overflow-hidden">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 shrink-0">
                <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center border border-emerald-200">
                    1
                </span>
                <span className="text-xs font-bold text-slate-800">
                    Paket & Server
                </span>
            </div>

            <Scrollable
                className="flex-1 min-h-0 max-h-[340px] md:max-h-[420px] pr-1.5 overflow-hidden"
                scrollbarClassName="z-20"
            >
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
                            onChange={onBillingPeriodChange}
                        />
                    </div>

                    {/* Base Product Extension Switch */}
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <FormSwitch
                                    name="include_base_product"
                                    onCheckedChange={onIncludeBaseChange}
                                    label={
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-semibold text-xs text-slate-800">
                                                Perbarui Paket Utama POS
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="text-[9px] font-mono px-1.5 py-0 bg-white"
                                            >
                                                {billingPeriod === "annual"
                                                    ? "+1 Tahun"
                                                    : "+1 Bulan"}
                                            </Badge>
                                        </div>
                                    }
                                    description="Perpanjang siklus lisensi utama toko untuk periode berikutnya"
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
                    {serverPackages.length > 0 && (
                        <div
                            className={cn(
                                "p-3 rounded-xl border transition-colors space-y-2.5",
                                isServerRequiredMissing
                                    ? "bg-rose-50/40 border-rose-300"
                                    : "bg-slate-50/80 border-slate-200/80"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <IconServer
                                        size={14}
                                        className="text-blue-600"
                                    />
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
                                onChange={(val) =>
                                    onSelectServerPackage(val || null)
                                }
                                onClear={() => onSelectServerPackage(null)}
                            />

                            {/* Mandatory Alert if Base Product Checked but Server Not Selected */}
                            {isServerRequiredMissing && (
                                <p className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 p-1.5 rounded-lg flex items-center gap-1.5">
                                    <IconAlertCircle
                                        size={13}
                                        className="shrink-0 text-rose-600"
                                    />
                                    <span>
                                        Paket server wajib dipilih jika
                                        memperbarui paket utama POS.
                                    </span>
                                </p>
                            )}

                            {/* Selected Server Specs Chip */}
                            {selectedServer && (
                                <div className="p-2 rounded-lg bg-white border border-slate-200/80 space-y-1 text-[11px]">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800">
                                            {selectedServer.nama}
                                        </span>
                                        <span className="font-mono font-bold text-blue-700">
                                            {currentServerPrice > 0
                                                ? `${formatRupiah(currentServerPrice)}/${billingPeriod === "annual" ? "tahun" : "bulan"}`
                                                : "Rp 0 (Gratis)"}
                                        </span>
                                    </div>
                                    {selectedServer.cpu &&
                                        selectedServer.cpu !== "Self-Hosted" && (
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
    );
});
