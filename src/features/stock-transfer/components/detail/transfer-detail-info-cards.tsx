"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import {
  IconBuildingStore,
  IconCalendar,
  IconNotes,
  IconUser,
} from "@tabler/icons-react";
import type { StockTransfer } from "../../types";

interface TransferDetailInfoCardsProps {
  transfer: StockTransfer;
}

export function TransferDetailInfoCards({ transfer }: TransferDetailInfoCardsProps) {
  return (
    <div className="space-y-6">
      {/* Store Route Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <IconBuildingStore size={16} className="text-emerald-600" />
            <span>Rute Toko</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Toko Asal (Pengirim)</span>
            <span className="font-bold text-slate-900 text-sm">{transfer.source_store?.nama || "—"}</span>
            {transfer.source_user && (
              <span className="text-[11px] text-slate-400 block mt-0.5 flex items-center gap-1">
                <IconUser size={12} /> Disiapkan: {transfer.source_user.name}
              </span>
            )}
          </div>

          <div className="border-t border-slate-50 pt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Toko Tujuan (Penerima)</span>
            <span className="font-bold text-emerald-700 text-sm">{transfer.destination_store?.nama || "—"}</span>
            {transfer.destination_user && (
              <span className="text-[11px] text-slate-400 block mt-0.5 flex items-center gap-1">
                <IconUser size={12} /> Diterima: {transfer.destination_user.name}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

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
                ? formatDate(transfer.tanggal_kirim, "dd MMM yyyy, HH:mm")
                : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Tanggal Terima:</span>
            <span className="font-semibold text-slate-800">
              {transfer.tanggal_terima
                ? formatDate(transfer.tanggal_terima, "dd MMM yyyy, HH:mm")
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
