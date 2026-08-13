"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormSelect } from "@/components/forms/form-select";
import { Input } from "@/components/ui/input";
import { useSupplierCreateModal } from "@/features/master/suppliers/hooks/use-supplier-create-modal";
import { useSupplierSelectConfig } from "@/features/master/suppliers/hooks/use-supplier-select";
import type { Supplier } from "@/features/master/suppliers/types";
import { IconClipboardPlus } from "@tabler/icons-react";
import { FormProvider, useFormContext, useWatch } from "react-hook-form";
import type { ConsignmentReceivingFormValues } from "../../schemas/consignment-schema";

interface ConsignmentHeaderCardProps {
  isPending?: boolean;
}

export function ConsignmentHeaderCard({ isPending = false }: ConsignmentHeaderCardProps) {
  const form = useFormContext<ConsignmentReceivingFormValues>();
  const supplierUid = useWatch({
    control: form.control,
    name: "supplier_uid",
  });

  const supplierSelectConfig = useSupplierSelectConfig({
    targetUid: supplierUid || undefined,
  });

  const { openSupplierModal, SupplierModal } = useSupplierCreateModal({
    onSupplierCreated: (supplier) => {
      form.setValue("supplier_uid", supplier.uid);
      if (supplier.nama) {
        form.setValue("supplier", supplier.nama);
      }
    },
  });

  return (
    <FormProvider {...form}>
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
          <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/30">
            <IconClipboardPlus size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Informasi Penerimaan Konsinyasi
            </h4>
            <p className="text-[10px] text-slate-400">
              Lengkapi info supplier & tanggal penerimaan
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Supplier Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Supplier / Pemasok *
            </label>
            <FormSelect<ConsignmentReceivingFormValues, Supplier>
              name="supplier_uid"
              {...supplierSelectConfig}
              placeholder="-- Pilih Supplier --"
              disabled={isPending}
              onCreateOption={openSupplierModal}
            />
          </div>

          {/* Tanggal Penerimaan */}
          <FormDatePicker<ConsignmentReceivingFormValues>
            name="tanggal_terima"
            label="Tanggal Penerimaan *"
            disabled={isPending}
          />

          {/* Tanggal Jatuh Tempo */}
          <FormDatePicker<ConsignmentReceivingFormValues>
            name="tanggal_jatuh_tempo"
            label="Tanggal Jatuh Tempo *"
            disabled={isPending}
          />

          {/* Catatan Penerimaan */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Catatan Penerimaan
            </label>
            <Input
              type="text"
              placeholder="Catatan tambahan (opsional)..."
              className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
              disabled={isPending}
              {...form.register("catatan")}
            />
          </div>
        </div>

        {/* Inline Supplier Creation Dialog */}
        {SupplierModal}
      </div>
    </FormProvider>
  );
}
