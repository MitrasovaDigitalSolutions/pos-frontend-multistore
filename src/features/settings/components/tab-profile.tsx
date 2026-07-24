"use client";

import { type StoreSettingsInput } from "../schemas/settings-schema";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Info } from "lucide-react";
import { FormImageUpload } from "@/components/forms/form-image-upload";
import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Scrollable } from "@/components/ui/scrollable";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

import { AppButton } from "@/components/shared/app-button";

import { useSettingsStore } from "@/stores/settings-store";

interface TabProfileProps {
    isSaving: boolean;
    initialLogoUrl: string;
}

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5 select-none">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {label}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AppButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="p-0 border-none bg-transparent cursor-help text-slate-400 hover:text-slate-500 transition-colors flex items-center h-auto w-auto"
                    >
                        <Info size={12} />
                    </AppButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs bg-slate-950 text-white rounded-lg p-2 shadow-lg border border-slate-800">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export function TabProfile({ isSaving, initialLogoUrl }: TabProfileProps) {
    const { getSettingMeta } = useSettingsStore();

    const logoMeta = getSettingMeta("app_logo_url");
    const nameMeta = getSettingMeta("app_name");
    const phoneMeta = getSettingMeta("app_phone");
    const addressMeta = getSettingMeta("app_address");

    return (
        <TooltipProvider delayDuration={150}>
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white dark:bg-slate-900 overflow-hidden flex flex-col w-full min-h-[460px]">
                {/* Header (pinned) */}
                <div className="p-5 pb-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-sm">
                            <Store size={15} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Identitas Toko</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Informasi profil dasar bisnis dan logo resmi Anda</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <Scrollable className="flex-1 min-h-0 w-full">
                    <CardContent className="p-5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* Logo Uploader Panel */}
                            <div className="md:col-span-4 lg:col-span-3 space-y-2 flex flex-col items-center md:items-start">
                                <LabelWithTooltip
                                    label={logoMeta?.label || "Logo Toko (URL)"}
                                    tooltip={logoMeta?.description || "Tautan gambar logo toko."}
                                />
                                <div className="w-full max-w-[200px] aspect-square border border-slate-150 rounded-2xl p-2 bg-slate-50/50 flex items-center justify-center">
                                    <FormImageUpload<StoreSettingsInput>
                                        name="app_logo_url"
                                        initialUrl={initialLogoUrl}
                                        disabled={isSaving}
                                        className="w-full h-full aspect-square"
                                        dropzoneClassName="w-full h-full aspect-square min-h-0 md:min-h-0 p-3 flex flex-col items-center justify-center"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed text-center md:text-left w-full max-w-[200px]">
                                    Rasio 1:1, JPG/PNG/WEBP maks 2MB.
                                </p>
                            </div>

                            {/* Text Fields Panel */}
                            <div className="md:col-span-8 lg:col-span-9 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <LabelWithTooltip
                                            label={nameMeta?.label || "Nama Toko"}
                                            tooltip={nameMeta?.description || "Nama aplikasi atau toko yang akan ditampilkan di struk dan aplikasi."}
                                        />
                                        <FormInput<StoreSettingsInput>
                                            name="app_name"
                                            placeholder="Masukkan nama toko..."
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <LabelWithTooltip
                                            label={phoneMeta?.label || "Nomor Telepon Toko"}
                                            tooltip={phoneMeta?.description || "Nomor kontak toko untuk dicetak di struk."}
                                        />
                                        <FormInput<StoreSettingsInput>
                                            name="app_phone"
                                            placeholder="Masukkan nomor telepon..."
                                            disabled={isSaving}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <LabelWithTooltip
                                        label={addressMeta?.label || "Alamat Toko"}
                                        tooltip={addressMeta?.description || "Alamat lengkap toko untuk dicetak di struk."}
                                    />
                                    <FormTextarea<StoreSettingsInput>
                                        name="app_address"
                                        placeholder="Masukkan alamat lengkap toko..."
                                        disabled={isSaving}
                                        className="min-h-[110px] text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Scrollable>
            </Card>
        </TooltipProvider>
    );
}
