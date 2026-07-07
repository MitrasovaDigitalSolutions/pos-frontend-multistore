"use client";

import { useEffect, useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { ComparePricesResult } from "../../../api/purchase-api";

import type { Product } from "@/features/products/types";

export interface PriceAlertFormInput {
    items: {
        product_uid: string;
        update_harga_jual: boolean;
        margin_baru: number;
        harga_jual_baru: number;
    }[];
}

interface PriceAlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    priceAlerts: ComparePricesResult[];
    isFinalizing: boolean;
    getProductInfo: (productId: string | number) => Product | null;
    onCompleteWithoutPrices: () => void;
    onCompleteWithPrices: (formValues: PriceAlertFormInput) => void;
}

export function PriceAlertDialog({
    open,
    onOpenChange,
    priceAlerts,
    isFinalizing,
    getProductInfo,
    onCompleteWithoutPrices,
    onCompleteWithPrices,
}: PriceAlertDialogProps) {
    const alertFormMethods = useForm<PriceAlertFormInput>({
        defaultValues: {
            items: [],
        },
    });

    const formItems = useWatch({ name: "items", control: alertFormMethods.control });
    const prevItemsRef = useRef<PriceAlertFormInput["items"]>([]);

    useEffect(() => {
        if (open && priceAlerts.length > 0) {
            const initialItems = priceAlerts.map((alert) => {
                const productInfo = getProductInfo(alert.product_uid);
                const marginLama = productInfo?.margin ?? alert.margin_lama;
                const buyPriceNew = alert.harga_beli_baru;
                const calculatedHargaJualSaran = Math.round(buyPriceNew * (1 + (marginLama || 0) / 100));

                return {
                    product_uid: alert.product_uid,
                    update_harga_jual: false,
                    margin_baru: marginLama,
                    harga_jual_baru: calculatedHargaJualSaran,
                };
            });
            prevItemsRef.current = JSON.parse(JSON.stringify(initialItems));
            alertFormMethods.reset({ items: initialItems });
        }
    }, [open, priceAlerts, alertFormMethods, getProductInfo]);

    useEffect(() => {
        if (!formItems || formItems.length === 0) return;

        const activeId = document.activeElement?.id;

        formItems.forEach((item, idx) => {
            const prev = prevItemsRef.current[idx];
            if (!prev) return;

            const alert = priceAlerts.find((a) => a.product_uid === item.product_uid);
            if (!alert) return;

            const buyPrice = alert.harga_beli_baru;

            if (activeId === `items.${idx}.margin_baru`) {
                if (item.margin_baru !== prev.margin_baru) {
                    const calculatedHargaJual = Math.round(buyPrice * (1 + (item.margin_baru || 0) / 100));
                    if (item.harga_jual_baru !== calculatedHargaJual) {
                        alertFormMethods.setValue(`items.${idx}.harga_jual_baru`, calculatedHargaJual);
                    }
                }
            } else if (activeId === `items.${idx}.harga_jual_baru`) {
                if (item.harga_jual_baru !== prev.harga_jual_baru) {
                    const calculatedMargin = buyPrice > 0 ? (((item.harga_jual_baru || 0) / buyPrice) - 1) * 100 : 0;
                    const roundedMargin = Math.round(calculatedMargin * 100) / 100;
                    if (item.margin_baru !== roundedMargin) {
                        alertFormMethods.setValue(`items.${idx}.margin_baru`, roundedMargin);
                    }
                }
            }
        });

        prevItemsRef.current = JSON.parse(JSON.stringify(formItems));
    }, [formItems, priceAlerts, alertFormMethods]);

    const handleUseSaran = (idx: number, alert: ComparePricesResult) => {
        const productInfo = getProductInfo(alert.product_uid);
        const marginLama = productInfo?.margin ?? alert.margin_lama;
        const buyPriceNew = alert.harga_beli_baru;
        const calculatedHargaJualSaran = Math.round(buyPriceNew * (1 + (marginLama || 0) / 100));

        alertFormMethods.setValue(`items.${idx}.margin_baru`, marginLama);
        alertFormMethods.setValue(`items.${idx}.harga_jual_baru`, calculatedHargaJualSaran);
        alertFormMethods.setValue(`items.${idx}.update_harga_jual`, true);
    };

    const handleFormSubmit = () => {
        const formValues = alertFormMethods.getValues();
        onCompleteWithPrices(formValues);
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <span className="flex items-center gap-2">
                    <IconAlertTriangle className="text-amber-500" size={20} />
                    <span>Peringatan Perubahan Harga Beli</span>
                </span>
            }
            className="sm:max-w-4xl font-sans"
        >
            <FormProvider {...alertFormMethods}>
                <div className="space-y-4 my-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Sistem mendeteksi adanya perubahan harga beli dari supplier dibandingkan dengan harga beli master/PO. Silakan tinjau perubahan berikut dan Anda dapat memperbarui harga jual atau margin produk secara langsung:
                    </p>

                    <div className="border border-slate-100 rounded-xl overflow-x-auto overflow-y-auto max-h-[350px]">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="p-3">Nama Produk</th>
                                    <th className="p-3 text-right">Harga Beli</th>
                                    <th className="p-3 text-center w-36">Update Harga Jual?</th>
                                    <th className="p-3 text-left w-64">Margin & Harga Jual Baru</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium">
                                {priceAlerts.map((alert, idx) => {
                                    const isUpdateActive = formItems && formItems[idx]?.update_harga_jual;
                                    const productInfo = getProductInfo(alert.product_uid);
                                    const hargaBeliLama = productInfo?.harga_beli ?? alert.harga_beli_lama;
                                    const hargaJualLama = productInfo?.harga ?? alert.harga_jual_lama;
                                    const marginLama = productInfo?.margin ?? alert.margin_lama;
                                    const selisihHargaBeli = alert.harga_beli_baru - hargaBeliLama;
                                    const buyPriceNew = alert.harga_beli_baru;
                                    const calculatedHargaJualSaran = Math.round(buyPriceNew * (1 + (marginLama || 0) / 100));

                                    return (
                                        <tr key={alert.product_uid} className="hover:bg-slate-50/50">
                                            <td className="p-3">
                                                <p className="font-semibold text-slate-900">{alert.nama}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    Jual Lama: {formatRupiah(hargaJualLama)} (Margin: {marginLama}%)
                                                </p>
                                            </td>
                                            <td className="p-3 text-right whitespace-nowrap">
                                                <div className="font-mono text-slate-400 line-through text-[10px]">
                                                    {formatRupiah(hargaBeliLama)}
                                                </div>
                                                <div className="font-mono font-bold text-amber-700">
                                                    {formatRupiah(alert.harga_beli_baru)}
                                                </div>
                                                <div className="text-[10px] text-rose-600 font-bold font-mono">
                                                    {selisihHargaBeli > 0 ? `+${formatRupiah(selisihHargaBeli)}` : formatRupiah(selisihHargaBeli)}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    id={`update-price-${alert.product_uid}`}
                                                    {...alertFormMethods.register(`items.${idx}.update_harga_jual`)}
                                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-3">
                                                {isUpdateActive ? (
                                                    <div className="space-y-1.5 animate-fade-in">
                                                        <div className="flex gap-2 items-center">
                                                            <div className="space-y-0.5">
                                                                <span className="text-[9px] text-slate-400 font-bold block">Margin %</span>
                                                                <FormNumberInput<PriceAlertFormInput>
                                                                    name={`items.${idx}.margin_baru`}
                                                                    className="w-16 h-8 text-center"
                                                                />
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <span className="text-[9px] text-slate-400 font-bold block">Harga Jual (Rp)</span>
                                                                <FormNominalInput<PriceAlertFormInput>
                                                                    name={`items.${idx}.harga_jual_baru`}
                                                                    className="w-28 h-8 px-2 text-right"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUseSaran(idx, alert)}
                                                                className="px-2 h-8 text-[9px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg self-end cursor-pointer border border-slate-200"
                                                            >
                                                                Saran
                                                            </button>
                                                        </div>
                                                        <div className="text-[10px] text-emerald-600 font-semibold">
                                                            Saran: {formatRupiah(calculatedHargaJualSaran)} (Margin {marginLama}%)
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            alertFormMethods.setValue(`items.${idx}.update_harga_jual`, true);
                                                        }}
                                                        className="px-3 py-1.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer border border-emerald-100/50"
                                                    >
                                                        Ubah Harga Jual
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100 shrink-0 bg-white">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={isFinalizing}
                        className="px-5 h-10 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors"
                    >
                        Batal & Sesuaikan
                    </button>
                    <Button
                        type="button"
                        onClick={onCompleteWithoutPrices}
                        disabled={isFinalizing}
                        className="px-5 h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer border-none"
                    >
                        {isFinalizing ? "Memproses..." : "Tetap Selesaikan (Tanpa Update Harga Jual)"}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleFormSubmit}
                        disabled={isFinalizing}
                        className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer border-none"
                    >
                        {isFinalizing ? "Memproses..." : "Selesaikan & Terapkan Harga Baru"}
                    </Button>
                </div>
            </FormProvider>
        </BaseDialog>
    );
}
