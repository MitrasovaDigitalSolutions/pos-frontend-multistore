"use client";

import { useFormContext } from "react-hook-form";
import { IconAlertTriangle } from "@tabler/icons-react";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";

interface ReceivingItemRowControlsProps {
  index: number;
  item: StockTransferItem;
  onReceiveItem?: (item: StockTransferItem, status: "received" | "rejected") => void;
  isProcessing: boolean;
}

export function ReceivingItemRowControls({
  index,
  item,
  onReceiveItem,
  isProcessing,
}: ReceivingItemRowControlsProps) {
  const { watch, setValue } = useFormContext<ReceiveFormValues>();
  const currentQty = watch(`items.${index}.kuantitas_diterima`);
  const status = watch(`items.${index}.status`) || "received";
  const isDifferent =
    currentQty !== undefined &&
    currentQty !== null &&
    Number(currentQty) !== Number(item.kuantitas);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center gap-1.5">
          <FormNumberInput<ReceiveFormValues>
            name={`items.${index}.kuantitas_diterima`}
            min={0}
            disabled={isProcessing}
            className={`h-8 w-24 text-xs text-center font-extrabold ${
              isDifferent
                ? "border-amber-400 bg-amber-50 text-amber-900 focus-visible:ring-amber-500"
                : "bg-white border-slate-200"
            }`}
          />
          {isDifferent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-amber-500 shrink-0 cursor-pointer">
                    <IconAlertTriangle size={15} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Jumlah diterima berbeda dari jumlah dikirim</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setValue(`items.${index}.status`, "received");
              setValue(`items.${index}.jenis_selisih`, null);
              if (onReceiveItem) onReceiveItem(item, "received");
            }}
            disabled={isProcessing}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
              status === "received"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isProcessing && status === "received" ? "Memproses..." : "Terima"}
          </button>
          {status !== "rejected" ? (
            <button
              type="button"
              onClick={() => setValue(`items.${index}.status`, "rejected")}
              disabled={isProcessing}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors text-slate-500 hover:text-slate-700 ${
                isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              Tolak
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onReceiveItem) onReceiveItem(item, "rejected");
              }}
              disabled={isProcessing || !watch(`items.${index}.jenis_selisih`)}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors bg-white text-rose-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            >
              {isProcessing ? "Memproses..." : "Konfirmasi Tolak"}
            </button>
          )}
        </div>
      </div>
      {(status === "rejected" || isDifferent) && (
        <FormSelect<ReceiveFormValues>
          name={`items.${index}.jenis_selisih`}
          options={[
            { label: "Pilih Alasan", value: "" },
            { label: "Salah Input", value: "salah_input" },
            { label: "Rusak", value: "rusak" },
            { label: "Hilang", value: "hilang" },
          ]}
          disabled={isProcessing}
          className="h-7 text-[10px] border-rose-300 bg-rose-50 text-rose-900"
        />
      )}
    </div>
  );
}
