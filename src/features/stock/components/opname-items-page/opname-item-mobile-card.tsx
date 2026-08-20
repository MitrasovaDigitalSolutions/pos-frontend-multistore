"use client";

import { AppButton } from "@/components/shared/app-button";
import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { IconBarcode, IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect } from "react";
import type { OpnameItemLocal } from "@/stores/opname-items-store";

interface OpnameItemMobileCardProps {
  item: OpnameItemLocal;
  index: number;
  updateItem: (temp_uid: string, updates: Partial<OpnameItemLocal>) => void;
  removeItem: (temp_uid: string) => void;
}

interface RowInput {
  stok_fisik: number;
  alasan: string;
}

export function OpnameItemMobileCard({
  item,
  index,
  updateItem,
  removeItem,
}: OpnameItemMobileCardProps) {
  const methods = useForm<RowInput>({
    defaultValues: {
      stok_fisik: item.stok_fisik,
      alasan: item.alasan || "Opname rutin",
    },
  });

  const { reset } = methods;

  useEffect(() => {
    reset({
      stok_fisik: item.stok_fisik,
      alasan: item.alasan || "Opname rutin",
    });
  }, [item.stok_fisik, item.alasan, reset]);

  const diff = item.stok_fisik - item.stok_sistem;

  return (
    <FormProvider {...methods}>
      <div
        id={`opname-card-${item.product_uid}`}
        className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs space-y-3"
      >
        {/* ── Header: Index, Product Name, Barcode & Delete ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div className="min-w-0 space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                {item.nama}
              </h4>
              <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-400 font-medium">
                {item.barcode && (
                  <span className="font-mono flex items-center gap-0.5">
                    <IconBarcode size={12} className="opacity-70" />
                    {item.barcode}
                  </span>
                )}
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-semibold font-sans">
                  Sistem: {item.stok_sistem} pcs
                </span>
              </div>
            </div>
          </div>

          <AppButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => removeItem(item.temp_uid)}
            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
            title="Hapus produk"
          >
            <IconTrash size={16} />
          </AppButton>
        </div>

        {/* ── Grid: Stok Fisik & Selisih ── */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-50">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Stok Fisik
            </label>
            <div className="flex items-center gap-1">
              <AppButton
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  updateItem(item.temp_uid, {
                    stok_fisik: Math.max(0, item.stok_fisik - 1),
                  })
                }
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                <IconMinus size={13} />
              </AppButton>
              <div className="flex-1">
                <FormNumberInput<RowInput>
                  name="stok_fisik"
                  onValueChange={(val) => {
                    updateItem(item.temp_uid, { stok_fisik: val || 0 });
                  }}
                  className="h-8 text-center rounded-xl border-slate-200 p-0 text-xs font-bold w-full"
                />
              </div>
              <AppButton
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  updateItem(item.temp_uid, { stok_fisik: item.stok_fisik + 1 })
                }
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                <IconPlus size={13} />
              </AppButton>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right block">
              Selisih
            </label>
            <div
              className={`h-8 flex items-center justify-end px-3 rounded-xl font-mono font-bold text-xs ${
                diff === 0
                  ? "bg-slate-50 text-slate-400 border border-slate-100"
                  : diff > 0
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              {diff > 0 ? `+${diff}` : diff} pcs
            </div>
          </div>
        </div>

        {/* ── Alasan Selisih ── */}
        <div className="space-y-1 pt-1 border-t border-slate-50">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Alasan Selisih
          </label>
          <FormInput<RowInput>
            name="alasan"
            placeholder="Alasan selisih..."
            onChange={(e) => {
              updateItem(item.temp_uid, { alasan: e.target.value });
            }}
            className="h-8 border-slate-200 focus-visible:ring-emerald-600 rounded-xl text-xs"
          />
        </div>
      </div>
    </FormProvider>
  );
}
