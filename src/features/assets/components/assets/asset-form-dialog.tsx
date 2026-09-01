"use client";

import React from "react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconBuildingWarehouse } from "@tabler/icons-react";
import { useAssetForm } from "../../hooks/use-asset-form";
import { AssetIdentityFields } from "./form/asset-identity-fields";
import { AssetFundingFields } from "./form/asset-funding-fields";
import { AssetFormEditView } from "./form/asset-form-edit-view";
import type { Asset, AssetCategory } from "../../types";

interface AssetFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingAsset?: Asset | null;
    categories: AssetCategory[];
}

export function AssetFormDialog({
    open,
    onOpenChange,
    editingAsset = null,
    categories,
}: AssetFormDialogProps) {
    const {
        isEdit,
        isPending,
        createForm,
        updateForm,
        categoryOptions,
        cashOptions,
        flatAccounts,
        categoryAssetCoa,
        selectedCashAccount,
        selectedOffsetCoa,
        isCashInsufficient,
        isLoadingCash,
        isLoadingCoa,
        handleCreateSubmit,
        handleUpdateSubmit,
    } = useAssetForm({
        editingAsset,
        categories,
        onOpenChange,
    });

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        <IconBuildingWarehouse className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 block">
                            {isEdit ? "Ubah Data Aset" : "Catat Perolehan Aset Baru"}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal block">
                            {isEdit
                                ? `Mengubah data identitas aset ${editingAsset?.nomor_aset}`
                                : "Kapitalisasi aset tetap baru beserta pengalokasian sumber dana perolehan"}
                        </span>
                    </div>
                </div>
            }
            className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl"
        >
            {isEdit && editingAsset ? (
                <AssetFormEditView
                    form={updateForm}
                    asset={editingAsset}
                    isPending={isPending}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            ) : (
                <form
                    onSubmit={createForm.handleSubmit(handleCreateSubmit)}
                    className="pt-2"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Kolom Kiri: Identitas & Nilai Kapitalisasi Aset */}
                        <div className="lg:col-span-7">
                            <AssetIdentityFields
                                form={createForm}
                                categoryOptions={categoryOptions}
                                categoryAssetCoa={categoryAssetCoa}
                                isPending={isPending}
                            />
                        </div>

                        {/* Kolom Kanan: Pembiayaan, Kas/CoA & Jurnal Otomatis */}
                        <div className="lg:col-span-5">
                            <AssetFundingFields
                                form={createForm}
                                cashOptions={cashOptions}
                                flatAccounts={flatAccounts}
                                selectedCashAccount={selectedCashAccount}
                                selectedOffsetCoa={selectedOffsetCoa}
                                categoryAssetCoa={categoryAssetCoa}
                                isCashInsufficient={isCashInsufficient}
                                isLoadingCash={isLoadingCash}
                                isLoadingCoa={isLoadingCoa}
                                isPending={isPending}
                                onCancel={() => onOpenChange(false)}
                            />
                        </div>
                    </div>
                </form>
            )}
        </BaseDialog>
    );
}
