"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatToReadableDateTime } from "@/lib/date-utils";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
  IconBuildingStore,
  IconCalendar,
  IconNotes,
  IconTag,
  IconUser,
} from "@tabler/icons-react";
import { TRANSFER_TYPE_BADGES } from "../../constants";
import type { StockTransfer } from "../../types";

interface TransferDetailInfoCardsProps {
  transfer: StockTransfer;
}

export function TransferDetailInfoCards({ transfer }: TransferDetailInfoCardsProps) {
  const isKonsinyasi = transfer.tipe_transfer === "konsinyasi_internal";

  const totalNilaiPasok = isKonsinyasi
    ? (transfer.items || []).reduce((sum, item) => {
        const pasok = Number(
          item.harga_pasok_pusat ?? item.harga_beli_cabang ?? item.harga_pasok ?? 0
        );
        return sum + pasok * item.kuantitas;
      }, 0)
    : 0;

  const totalNilaiRetail = isKonsinyasi
    ? (transfer.items || []).reduce((sum, item) => {
        const retail = Number(
          item.harga_jual_pusat ??
            item.harga_jual_cabang ??
            item.harga_jual ??
            item.product?.harga_jual ??
            0
        );
        return sum + retail * item.kuantitas;
      }, 0)
    : 0;

  const totalKomisi = isKonsinyasi
    ? (transfer.items || []).reduce((sum, item) => {
        if (item.nominal_komisi !== undefined && item.nominal_komisi !== null) {
          return sum + Number(item.nominal_komisi) * item.kuantitas;
        }
        const pasok = Number(
          item.harga_pasok_pusat ?? item.harga_beli_cabang ?? item.harga_pasok ?? 0
        );
        const retail = Number(
          item.harga_jual_pusat ??
            item.harga_jual_cabang ??
            item.harga_jual ??
            item.product?.harga_jual ??
            0
        );
        return sum + Math.max(0, retail - pasok) * item.kuantitas;
      }, 0)
    : 0;

  const marginPercent =
    totalNilaiRetail > 0 ? Math.round((totalKomisi / totalNilaiRetail) * 100) : 0;
  const totalQty = (transfer.items || []).reduce((sum, item) => sum + item.kuantitas, 0);

  return (
    <div className="space-y-6">
      {/* Store Route Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <IconBuildingStore size={16} className="text-emerald-600" />
            <span>Rute Toko</span>
          </CardTitle>
          {transfer.tipe_transfer && TRANSFER_TYPE_BADGES[transfer.tipe_transfer] && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                TRANSFER_TYPE_BADGES[transfer.tipe_transfer].className
              }`}
            >
              {TRANSFER_TYPE_BADGES[transfer.tipe_transfer].label}
            </span>
          )}
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          {/* Toko Asal */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Toko Asal (Pengirim)</span>
              {transfer.source_store?.is_central !== undefined && (
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                  {transfer.source_store.is_central ? "Gudang Pusat" : "Cabang"}
                </span>
              )}
            </div>
            <span className="font-bold text-slate-900 text-sm block">{transfer.source_store?.nama || "—"}</span>
            {transfer.source_store?.alamat && (
              <span className="text-[11px] text-slate-500 block truncate mt-0.5">{transfer.source_store.alamat}</span>
            )}
            {transfer.source_user && (
              <span className="text-[11px] text-slate-400 block mt-1 flex items-center gap-1">
                <IconUser size={12} /> Disiapkan: {transfer.source_user.name}
                {transfer.source_user.username ? ` (@${transfer.source_user.username})` : ""}
              </span>
            )}
          </div>

          {/* Toko Tujuan */}
          <div className="border-t border-slate-50 pt-3">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Toko Tujuan (Penerima)</span>
              {transfer.destination_store?.is_central !== undefined && (
                <span className="text-[9px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.2 rounded">
                  {transfer.destination_store.is_central ? "Gudang Pusat" : "Cabang"}
                </span>
              )}
            </div>
            <span className="font-bold text-emerald-700 text-sm block">{transfer.destination_store?.nama || "—"}</span>
            {transfer.destination_store?.alamat && (
              <span className="text-[11px] text-slate-500 block truncate mt-0.5">{transfer.destination_store.alamat}</span>
            )}
            {transfer.destination_user ? (
              <span className="text-[11px] text-slate-400 block mt-1 flex items-center gap-1">
                <IconUser size={12} /> Diterima: {transfer.destination_user.name}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 italic block mt-1">
                (Menunggu penerimaan di cabang)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consignment Financial Card */}
      {isKonsinyasi && (
        <Card className="border-purple-100 shadow-sm rounded-2xl bg-gradient-to-br from-purple-50/40 to-white">
          <CardHeader className="pb-3 border-b border-purple-50">
            <CardTitle className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IconTag size={16} className="text-purple-600" />
                <span>Skema Konsinyasi Internal</span>
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                Off-Book
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Wajib Setor Pokok (Pasok):</span>
              <span className="font-bold text-purple-950 font-mono text-sm">{formatRupiah(totalNilaiPasok)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Estimasi Retail Cabang:</span>
              <span className="font-semibold text-slate-700 font-mono">{formatRupiah(totalNilaiRetail)}</span>
            </div>
            <div className="border-t border-purple-100/80 pt-2 flex justify-between items-center text-slate-700">
              <div>
                <span className="font-semibold text-emerald-700 block">Estimasi Komisi Cabang:</span>
                <span className="text-[10px] text-slate-400">Margin: {marginPercent}% ({totalQty} pcs)</span>
              </div>
              <span className="font-bold text-emerald-700 font-mono text-sm">+{formatRupiah(totalKomisi)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps & Info Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <IconCalendar size={16} className="text-emerald-600" />
            <span>Waktu & Catatan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Tanggal Kirim:</span>
            <span className="font-semibold text-slate-800">
              {transfer.tanggal_kirim
                ? formatToReadableDateTime(transfer.tanggal_kirim)
                : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Tanggal Terima:</span>
            <span className="font-semibold text-slate-800">
              {transfer.tanggal_terima
                ? formatToReadableDateTime(transfer.tanggal_terima)
                : "—"}
            </span>
          </div>

          {transfer.catatan && (
            <div className="pt-2 border-t border-slate-50 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <IconNotes size={12} /> Catatan Pengiriman
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                {transfer.catatan}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
