"use client";

import { AppButton } from "@/components/shared/app-button";
import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import type { OpnameItemLocal } from "@/stores/opname-items-store";
import {
  IconBarcode,
  IconMinus,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect } from "react";

interface OpnameItemsTableProps {
  items: OpnameItemLocal[];
  updateItem: (temp_uid: string, updates: Partial<OpnameItemLocal>) => void;
  removeItem: (temp_uid: string) => void;
}

interface RowInput {
  stok_fisik: number;
  alasan: string;
}

function TableRow({
  item,
  index,
  updateItem,
  removeItem,
}: {
  item: OpnameItemLocal;
  index: number;
  updateItem: (temp_uid: string, updates: Partial<OpnameItemLocal>) => void;
  removeItem: (temp_uid: string) => void;
}) {
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
      <tr
        id={`opname-item-${item.product_uid}`}
        className="hover:bg-slate-50/50 transition-colors border-b border-slate-100/70"
      >
        <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400">
          {index + 1}
        </td>

        <td className="py-2.5 px-3">
          <div className="space-y-0.5 max-w-xs sm:max-w-md">
            <p className="font-bold text-slate-900 text-xs leading-snug">
              {item.nama}
            </p>
            {item.barcode && (
              <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                <IconBarcode size={12} className="opacity-70" />
                {item.barcode}
              </span>
            )}
          </div>
        </td>

        <td className="py-2.5 px-3 text-center">
          <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
            {item.stok_sistem}
          </span>
        </td>

        <td className="py-2.5 px-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <AppButton
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() =>
                updateItem(item.temp_uid, {
                  stok_fisik: Math.max(0, item.stok_fisik - 1),
                })
              }
              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
            >
              <IconMinus size={12} />
            </AppButton>
            <div className="w-16">
              <FormNumberInput<RowInput>
                name="stok_fisik"
                onValueChange={(val) => {
                  updateItem(item.temp_uid, { stok_fisik: val || 0 });
                }}
                className="h-7 text-center rounded-lg border-slate-200 p-0 text-xs font-bold w-full"
              />
            </div>
            <AppButton
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() =>
                updateItem(item.temp_uid, { stok_fisik: item.stok_fisik + 1 })
              }
              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
            >
              <IconPlus size={12} />
            </AppButton>
          </div>
        </td>

        <td className="py-2.5 px-3 text-center">
          <span
            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
              diff === 0
                ? "bg-slate-100 text-slate-500"
                : diff > 0
                ? "bg-blue-100 text-blue-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {diff > 0 ? `+${diff}` : diff}
          </span>
        </td>

        <td className="py-2.5 px-3">
          <FormInput<RowInput>
            name="alasan"
            placeholder="Alasan selisih..."
            onChange={(e) => {
              updateItem(item.temp_uid, { alasan: e.target.value });
            }}
            className="h-7 border-slate-200 focus-visible:ring-emerald-600 rounded-lg text-xs"
          />
        </td>

        <td className="py-2.5 px-3 text-center">
          <AppButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => removeItem(item.temp_uid)}
            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hapus baris"
          >
            <IconTrash size={15} />
          </AppButton>
        </td>
      </tr>
    </FormProvider>
  );
}

export function OpnameItemsTable({
  items,
  updateItem,
  removeItem,
}: OpnameItemsTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          <tr>
            <th className="py-2.5 px-3 text-center w-12">No</th>
            <th className="py-2.5 px-3">Nama Produk & Barcode</th>
            <th className="py-2.5 px-3 text-center w-24">Stok Sistem</th>
            <th className="py-2.5 px-3 text-center w-36">Stok Fisik</th>
            <th className="py-2.5 px-3 text-center w-24">Selisih</th>
            <th className="py-2.5 px-3">Alasan Selisih</th>
            <th className="py-2.5 px-3 text-center w-12">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60">
          {items.map((item, index) => (
            <TableRow
              key={item.temp_uid}
              item={item}
              index={index}
              updateItem={updateItem}
              removeItem={removeItem}
            />
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="text-center py-10 text-slate-400 font-medium"
              >
                Belum ada barang dihitung. Scan barcode atau cari produk di
                atas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
