"use client";

import { useEffect, useId } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import type { CommandOption } from "@/components/ui/command-select";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Product } from "@/features/master/products/types";
import { IconAlertCircle, IconTrash } from "@tabler/icons-react";
import type { ProductionCreateInput } from "../../schemas/production-schema";

interface OutputItemRowProps {
    index: number;
    options: CommandOption[];
    products: Product[];
    disabled: boolean;
    onRemove: (index: number) => void;
    autoRecommendedHpp?: number;
}

export function OutputItemRow({
    index,
    options,
    products,
    disabled,
    onRemove,
    autoRecommendedHpp,
}: OutputItemRowProps) {
    const { watch, setValue, getValues } = useFormContext<ProductionCreateInput>();

    const productUid = watch(`outputs.${index}.product_uid`);
    const kuantitas = watch(`outputs.${index}.kuantitas`) || 0;
    const hppSatuan = watch(`outputs.${index}.hpp_satuan`) || 0;
    const updateHargaJual = watch(`outputs.${index}.update_harga_jual`);
    const hargaJualBaru = watch(`outputs.${index}.harga_jual_baru`);
    const marginBaru = watch(`outputs.${index}.margin_baru`);

    const selectedProduct = products.find((p) => p.uid === productUid);
    const hargaBeliLama = selectedProduct?.harga_beli ?? 0;
    const hargaJualLama = selectedProduct?.harga ?? 0;
    const marginLama = selectedProduct?.margin ?? 0;

    const hargaJualSaran =
        marginLama > 0
            ? Math.round(Number(hppSatuan) * (1 + marginLama / 100))
            : hargaJualLama;

    const subtotalHpp = (Number(kuantitas) || 0) * (Number(hppSatuan) || 0);

    const hppFieldId = useId();
    const jualFieldId = useId();
    const marginFieldId = useId();

    // Two-way synchronization between Harga Jual Baru and Margin Baru
    useEffect(() => {
        const activeId = typeof document !== "undefined" ? document.activeElement?.id : undefined;

        if (activeId === hppFieldId || activeId === jualFieldId) {
            const hBeli = Number(hppSatuan) || 0;
            const hJual = Number(hargaJualBaru) || 0;
            if (hBeli > 0) {
                const calculatedMargin = ((hJual - hBeli) / hBeli) * 100;
                setValue(
                    `outputs.${index}.margin_baru` as FieldPath<ProductionCreateInput>,
                    parseFloat(calculatedMargin.toFixed(2))
                );
            } else {
                setValue(`outputs.${index}.margin_baru` as FieldPath<ProductionCreateInput>, 0);
            }
        }
    }, [hppSatuan, hargaJualBaru, index, setValue, hppFieldId, jualFieldId]);

    useEffect(() => {
        const activeId = typeof document !== "undefined" ? document.activeElement?.id : undefined;

        if (activeId === marginFieldId) {
            const hBeli = Number(hppSatuan) || 0;
            const mrg = Number(marginBaru) || 0;
            const calculatedHarga = hBeli * (1 + mrg / 100);
            setValue(
                `outputs.${index}.harga_jual_baru` as FieldPath<ProductionCreateInput>,
                Math.round(calculatedHarga)
            );
        }
    }, [marginBaru, hppSatuan, index, setValue, marginFieldId]);

    return (
        <div className="p-4 bg-emerald-50/30 border border-emerald-200/60 rounded-2xl space-y-4 shadow-2xs">
            <div className="grid grid-cols-12 gap-3 items-end">
                {/* Pilih Produk Jadi */}
                <div className="col-span-12 sm:col-span-4">
                    <FormSelect<ProductionCreateInput>
                        name={`outputs.${index}.product_uid` as FieldPath<ProductionCreateInput>}
                        options={options}
                        placeholder="Pilih Barang Jadi..."
                        searchPlaceholder="Ketik nama/barcode barang jadi..."
                        disabled={disabled}
                        label={`Barang Jadi #${index + 1}`}
                        onChange={(val) => {
                            const prod = products.find((p) => p.uid === val);
                            if (prod) {
                                const initialHpp = autoRecommendedHpp && autoRecommendedHpp > 0
                                    ? autoRecommendedHpp
                                    : (prod.harga_beli ?? 0);

                                setValue(
                                    `outputs.${index}.hpp_satuan` as FieldPath<ProductionCreateInput>,
                                    initialHpp
                                );
                                if (!kuantitas) {
                                    setValue(
                                        `outputs.${index}.kuantitas` as FieldPath<ProductionCreateInput>,
                                        1
                                    );
                                }

                                const isUpdating = getValues(
                                    `outputs.${index}.update_harga_jual` as FieldPath<ProductionCreateInput>
                                );
                                if (isUpdating) {
                                    const mrgLama = prod.margin ?? 0;
                                    const saran = mrgLama > 0
                                        ? Math.round(Number(initialHpp) * (1 + mrgLama / 100))
                                        : (prod.harga ?? 0);
                                    setValue(
                                        `outputs.${index}.harga_jual_baru` as FieldPath<ProductionCreateInput>,
                                        saran
                                    );
                                    setValue(
                                        `outputs.${index}.margin_baru` as FieldPath<ProductionCreateInput>,
                                        mrgLama
                                    );
                                }
                            }
                        }}
                    />
                </div>

                {/* Qty Hasil */}
                <div className="col-span-4 sm:col-span-2">
                    <FormNumberInput<ProductionCreateInput>
                        name={`outputs.${index}.kuantitas` as FieldPath<ProductionCreateInput>}
                        placeholder="Qty"
                        disabled={disabled}
                        label="Qty Jadi"
                        allowDecimal={false}
                    />
                </div>

                {/* HPP Satuan */}
                <div className="col-span-8 sm:col-span-3">
                    <FormNominalInput<ProductionCreateInput>
                        id={hppFieldId}
                        name={`outputs.${index}.hpp_satuan` as FieldPath<ProductionCreateInput>}
                        placeholder="Rp 0"
                        disabled={disabled}
                        label="HPP Satuan"
                    />
                </div>

                {/* Harga Jual Saat Ini */}
                <div className="col-span-8 sm:col-span-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Harga Jual Aktif
                        </label>
                        <Input
                            type="text"
                            value={selectedProduct ? formatRupiah(hargaJualLama) : "Rp 0"}
                            disabled={true}
                            className="h-10 text-xs border-slate-200 bg-slate-100/60 text-slate-500 rounded-xl cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Action Remove */}
                <div className="col-span-4 sm:col-span-1 flex justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onRemove(index)}
                        disabled={disabled}
                        className="h-10 w-10 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
                        title="Hapus Barang Jadi"
                    >
                        <IconTrash size={18} />
                    </Button>
                </div>
            </div>

            {selectedProduct && (
                <div className="pt-3 border-t border-emerald-100/80 flex flex-col gap-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">HPP Lama:</span>
                                <span className="font-semibold text-slate-700">
                                    {formatRupiah(hargaBeliLama)}
                                </span>
                            </div>
                            <span className="text-slate-200">|</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">Total Alokasi HPP:</span>
                                <span className="font-bold text-emerald-800 font-mono">
                                    {formatRupiah(subtotalHpp)}
                                </span>
                            </div>
                        </div>

                        {autoRecommendedHpp !== undefined && autoRecommendedHpp > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setValue(
                                        `outputs.${index}.hpp_satuan` as FieldPath<ProductionCreateInput>,
                                        autoRecommendedHpp
                                    );
                                }}
                                className="text-[10px] h-7 px-2.5 font-bold text-emerald-700 bg-emerald-100/60 hover:bg-emerald-200/60 rounded-lg cursor-pointer"
                            >
                                Terapkan Rekomendasi ({formatRupiah(autoRecommendedHpp)})
                            </Button>
                        )}
                    </div>

                    {/* Toggle Update Harga Jual */}
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id={`outputs.${index}.update_harga_jual`}
                            checked={!!updateHargaJual}
                            onChange={(e) => {
                                setValue(
                                    `outputs.${index}.update_harga_jual` as FieldPath<ProductionCreateInput>,
                                    e.target.checked
                                );
                                if (e.target.checked) {
                                    setValue(
                                        `outputs.${index}.harga_jual_baru` as FieldPath<ProductionCreateInput>,
                                        hargaJualSaran
                                    );
                                    setValue(
                                        `outputs.${index}.margin_baru` as FieldPath<ProductionCreateInput>,
                                        marginLama
                                    );
                                } else {
                                    setValue(
                                        `outputs.${index}.harga_jual_baru` as FieldPath<ProductionCreateInput>,
                                        null
                                    );
                                    setValue(
                                        `outputs.${index}.margin_baru` as FieldPath<ProductionCreateInput>,
                                        null
                                    );
                                }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                        />
                        <label
                            htmlFor={`outputs.${index}.update_harga_jual`}
                            className="text-xs font-bold text-slate-700 cursor-pointer select-none"
                        >
                            Sesuaikan Harga Jual &amp; Margin Produk Baru
                        </label>
                    </div>

                    {/* Pricing Adjustment Form */}
                    {updateHargaJual && (
                        <div className="grid grid-cols-12 gap-3 p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs mt-1">
                            <div className="col-span-12 flex items-center gap-2 px-3 py-2 bg-emerald-50/80 border-l-2 border-emerald-500 rounded-r-xl text-[11px] text-slate-600">
                                <IconAlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                    Rekomendasi Harga Jual Baru:{" "}
                                    <strong className="text-slate-800 font-bold">
                                        {formatRupiah(hargaJualSaran)}
                                    </strong>{" "}
                                    <span className="text-slate-400 font-medium">
                                        (Menjaga margin lama {marginLama}%)
                                    </span>
                                </span>
                            </div>

                            <div className="col-span-12 sm:col-span-6">
                                <FormNominalInput<ProductionCreateInput>
                                    id={jualFieldId}
                                    name={`outputs.${index}.harga_jual_baru` as FieldPath<ProductionCreateInput>}
                                    placeholder={`Contoh: ${hargaJualSaran}`}
                                    disabled={disabled}
                                    label="Harga Jual Baru"
                                />
                            </div>

                            <div className="col-span-12 sm:col-span-6">
                                <FormNumberInput<ProductionCreateInput>
                                    id={marginFieldId}
                                    name={`outputs.${index}.margin_baru` as FieldPath<ProductionCreateInput>}
                                    placeholder={`Contoh: ${marginLama}`}
                                    disabled={disabled}
                                    label="Margin Baru (%)"
                                    allowDecimal={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
