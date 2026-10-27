"use client";

import { FormInput } from "@/components/forms/form-input";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settings-store";
import { IconPrinter, IconTag } from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

interface MedicineLabelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialPatientName?: string;
    initialMedicineName?: string;
    initialSigna?: string;
    initialNotes?: string;
}

interface LabelFormValues {
    patientName: string;
    medicineName: string;
    signa: string;
    notes: string;
}

export function MedicineLabelDialog({
    open,
    onOpenChange,
    initialPatientName = "",
    initialMedicineName = "",
    initialSigna = "3 x 1 Sehari Sesudah Makan",
    initialNotes = "",
}: MedicineLabelDialogProps) {
    const getSetting = useSettingsStore((state) => state.getSetting);
    const apotekName = getSetting("app_name", "Apotek Mitra Farma");
    const apotekAddress = getSetting("app_address", "Indonesia");
    const apotekSia = getSetting("app_sia_number", "SIA: 503/Apt/2026");

    const [waktuMinum, setWaktuMinum] = useState<string>("Sesudah Makan");

    const methods = useForm<LabelFormValues>({
        defaultValues: {
            patientName: initialPatientName,
            medicineName: initialMedicineName,
            signa: initialSigna,
            notes: initialNotes,
        },
    });

    const { control } = methods;
    const patientName = useWatch({ control, name: "patientName" });
    const medicineName = useWatch({ control, name: "medicineName" });
    const signa = useWatch({ control, name: "signa" });
    const notes = useWatch({ control, name: "notes" });

    const todayDate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconTag size={18} className="text-emerald-500" />
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Cetak Etiket Obat (Label Thermal)
                    </span>
                </div>
            }
            className="sm:max-w-lg"
            scrollable={true}
        >
            <div className="space-y-4">
                    {/* Live Preview Sticker (50x30mm ratio) */}
                    <div>
                        <Label className="text-[11px] font-bold text-slate-500 block mb-1.5">
                            Pratinjau Stiker Etiket (Label Thermal)
                        </Label>
                        <div
                            id="etiket-print-area"
                            className="bg-white border-2 border-slate-900 text-slate-900 p-3 rounded-lg shadow-sm font-sans max-w-sm mx-auto select-none"
                        >
                            {/* Etiket Header */}
                            <div className="text-center pb-1 border-b border-slate-900 mb-1.5">
                                <h4 className="font-black text-xs uppercase tracking-wider">
                                    {apotekName}
                                </h4>
                                <p className="text-[8px] text-slate-600 truncate">{apotekAddress}</p>
                                <p className="text-[7.5px] font-mono text-slate-500">{apotekSia}</p>
                            </div>

                            {/* Meta Date & Patient */}
                            <div className="flex justify-between items-center text-[9px] pb-1 border-b border-slate-200 mb-1.5">
                                <span>Tgl: {todayDate}</span>
                                <span className="font-bold">
                                    Pasien: <strong className="uppercase">{patientName || "(Umum / OTC)"}</strong>
                                </span>
                            </div>

                            {/* Medicine Name */}
                            <div className="text-center my-1.5">
                                <p className="text-[11px] font-extrabold text-slate-900 uppercase">
                                    {medicineName || "Obat Racikan / Puyer"}
                                </p>
                            </div>

                            {/* Signa Big Bold */}
                            <div className="bg-slate-100 border border-slate-300 rounded p-1.5 text-center my-1.5">
                                <p className="text-xs font-black tracking-wide text-slate-900 uppercase">
                                    {signa}
                                </p>
                                <p className="text-[9px] font-bold text-emerald-800 mt-0.5 uppercase">
                                    {waktuMinum}
                                </p>
                            </div>

                            {/* Notes / Warning */}
                            {notes && (
                                <p className="text-[8px] text-center text-slate-600 italic mt-1">
                                    * {notes}
                                </p>
                            )}

                            <div className="text-center pt-1 mt-1 border-t border-slate-200">
                                <p className="text-[7.5px] text-slate-400 font-mono">
                                    SEMOGA LEKAS SEMBUH
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Edit Etiket with Reusable FormProvider and FormInput */}
                    <FormProvider {...methods}>
                        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <FormInput<LabelFormValues>
                                    name="patientName"
                                    label="Nama Pasien"
                                    placeholder="Nama Pasien..."
                                />

                                <FormInput<LabelFormValues>
                                    name="medicineName"
                                    label="Nama Obat / Racikan"
                                    placeholder="Contoh: Puyer Batuk Anak"
                                />

                                <div className="sm:col-span-2">
                                    <FormInput<LabelFormValues>
                                        name="signa"
                                        label="Aturan Pakai (Signa)"
                                        placeholder="3 x 1 Sehari"
                                    />
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Keterangan Waktu Minum
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            "Sesudah Makan",
                                            "Sebelum Makan",
                                            "Bersama Makan",
                                            "Pagi Hari",
                                            "Malam Hari Sebelum Tidur",
                                            "Bila Demam / Sakit (PRN)",
                                        ].map((w) => (
                                            <button
                                                key={w}
                                                type="button"
                                                onClick={() => setWaktuMinum(w)}
                                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                                    waktuMinum === w
                                                        ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                                                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                                                }`}
                                            >
                                                {w}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <FormInput<LabelFormValues>
                                        name="notes"
                                        label="Catatan Khusus (Opsional)"
                                        placeholder="Habiskan / Kocok dahulu..."
                                    />
                                </div>
                            </div>
                        </div>
                    </FormProvider>
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-8 text-xs cursor-pointer"
                    >
                        Tutup
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handlePrint}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                        <IconPrinter size={14} />
                        <span>Cetak Stiker Etiket</span>
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
}
