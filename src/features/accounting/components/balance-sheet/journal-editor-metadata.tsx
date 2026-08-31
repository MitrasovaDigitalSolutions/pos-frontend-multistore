"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import type { ManualJournalSchemaInput } from "@/features/accounting/schemas/manual-journal-schema";

export function JournalEditorMetadata() {
    return (
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            <div className="sm:col-span-4 lg:col-span-3">
                <FormDatePicker<ManualJournalSchemaInput>
                    name="transaction_date"
                    label="Tanggal Transaksi *"
                    placeholder="Pilih tanggal..."
                    clearable={false}
                    size="sm"
                />
            </div>
            <div className="sm:col-span-8 lg:col-span-9">
                <FormInput<ManualJournalSchemaInput>
                    name="description"
                    label="Keterangan Jurnal *"
                    placeholder="Masukkan keterangan transaksi / penyesuaian keuangan..."
                    className="h-8 text-xs rounded-xl"
                />
            </div>
        </div>
    );
}
