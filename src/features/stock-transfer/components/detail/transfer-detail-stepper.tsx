"use client";

import React from "react";
import { IconCircleX } from "@tabler/icons-react";
import { TRANSFER_STATUS } from "../../constants";
import type { StockTransfer } from "../../types";

interface TransferDetailStepperProps {
  status: StockTransfer["status"];
}

export function TransferDetailStepper({ status }: TransferDetailStepperProps) {
  const isCancelled = status === TRANSFER_STATUS.CANCELLED;
  const stepIndex =
    status === TRANSFER_STATUS.DRAFT
      ? 1
      : status === TRANSFER_STATUS.IN_TRANSIT
      ? 2
      : status === TRANSFER_STATUS.RECEIVED
      ? 3
      : 0;

  if (isCancelled) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-3">
        <IconCircleX size={20} className="text-rose-600 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-rose-900">Transfer Stok Dibatalkan</h4>
          <p className="text-[11px] text-rose-700">Transaksi pengiriman stok ini telah dibatalkan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="grid grid-cols-3 gap-2 relative">
        {/* Step 1 */}
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl border ${
            stepIndex >= 1
              ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
              : "bg-slate-50 border-slate-100 text-slate-400"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              stepIndex >= 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            1
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold">Draft Disiapkan</span>
            <span className="text-[10px] opacity-75">Toko Pengirim</span>
          </div>
        </div>

        {/* Step 2 */}
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl border ${
            stepIndex >= 2
              ? "bg-blue-50/50 border-blue-200 text-blue-800"
              : "bg-slate-50 border-slate-100 text-slate-400"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              stepIndex >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            2
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold">Dalam Pengiriman</span>
            <span className="text-[10px] opacity-75">Stok Dipotong</span>
          </div>
        </div>

        {/* Step 3 */}
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl border ${
            stepIndex >= 3
              ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
              : "bg-slate-50 border-slate-100 text-slate-400"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              stepIndex >= 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            3
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold">Diterima & Selesai</span>
            <span className="text-[10px] opacity-75">Stok Ditambahkan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
