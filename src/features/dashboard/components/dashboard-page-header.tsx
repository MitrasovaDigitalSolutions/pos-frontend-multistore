"use client";

import { IconCalendarEvent } from "@tabler/icons-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardPageHeaderProps {
  from: string;
  setFrom: (val: string) => void;
  to: string;
  setTo: (val: string) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
}

export function DashboardPageHeader({
  from,
  setFrom,
  to,
  setTo,
  paymentMethod,
  setPaymentMethod,
}: DashboardPageHeaderProps) {
  const formattedDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 leading-tight">
          Overview
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <IconCalendarEvent size={11} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 tracking-wide">
            HARI INI: {formattedDate}
          </span>
        </div>
      </div>

      {/* Right: Date and Payment Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* <DatePicker
          placeholder="Dari Tanggal..."
          className="w-40"
          value={from}
          onChange={setFrom}
        />
        <DatePicker
          placeholder="Sampai Tanggal..."
          className="w-40"
          value={to}
          onChange={setTo}
        /> */}

        {/* Payment Method Select */}
        {/* <div className="w-40">
          <Select
            value={paymentMethod}
            onValueChange={(val) => setPaymentMethod(val || "")}
          >
            <SelectTrigger className="h-11 w-full border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl text-[13px] bg-white">
              <SelectValue placeholder="Semua Pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Pembayaran</SelectItem>
              <SelectItem value="cash">Tunai (Cash)</SelectItem>
              <SelectItem value="card">Kartu (Card)</SelectItem>
              <SelectItem value="split">Split Bill</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>
    </div>
  );
}
