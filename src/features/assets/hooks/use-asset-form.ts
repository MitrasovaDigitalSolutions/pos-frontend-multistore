"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    createAssetSchema,
    updateAssetSchema,
    type CreateAssetSchemaInput,
    type UpdateAssetSchemaInput,
} from "../schemas/asset-schema";
import { useCreateAsset, useUpdateAsset } from "../api/assets-api";
import { useCashAccounts, type CashAccount } from "@/features/cash/api/cash-api";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Asset, AssetCategory } from "../types";

interface UseAssetFormProps {
    editingAsset?: Asset | null;
    categories: AssetCategory[];
    onOpenChange: (open: boolean) => void;
}

export function useAssetForm({
    editingAsset,
    categories,
    onOpenChange,
}: UseAssetFormProps) {
    const isEdit = !!editingAsset;
    const createAssetMutation = useCreateAsset();
    const updateAssetMutation = useUpdateAsset();

    const { data: cashAccounts = [], isLoading: isLoadingCash } = useCashAccounts();
    const { data: flatAccounts = [], isLoading: isLoadingCoa } = useFlatChartOfAccounts();

    // Filter valid cash accounts (exclude register/kasir)
    const validCashAccounts = useMemo(() => {
        return cashAccounts.filter((acc: CashAccount) => acc.tipe !== "register");
    }, [cashAccounts]);

    const cashOptions = useMemo(() => {
        return validCashAccounts.map((acc: CashAccount) => ({
            value: acc.uid,
            label: `${acc.nama} (Saldo: ${formatRupiah(Number(acc.saldo) || 0)})`,
        }));
    }, [validCashAccounts]);

    const categoryOptions = useMemo(() => {
        return categories.map((c) => ({
            value: c.uid,
            label: `[${c.kode || "-"}] ${c.nama}`,
        }));
    }, [categories]);



    const createForm = useForm<CreateAssetSchemaInput>({
        resolver: zodResolver(createAssetSchema),
        defaultValues: {
            nama: "",
            asset_category_uid: categories.length > 0 ? categories[0].uid : "",
            kode_aset: null,
            tanggal_perolehan: new Date().toISOString().split("T")[0],
            harga_perolehan: 0,
            nilai_residu: 0,
            sumber_perolehan: "kas",
            cash_account_uid: validCashAccounts.length > 0 ? validCashAccounts[0].uid : null,
            offset_coa_uid: null,
            catatan: null,
        },
    });

    const updateForm = useForm<UpdateAssetSchemaInput>({
        resolver: zodResolver(updateAssetSchema),
        defaultValues: {
            nama: editingAsset?.nama || "",
            kode_aset: editingAsset?.kode_aset || null,
            nilai_residu: editingAsset?.nilai_residu || 0,
            catatan: editingAsset?.catatan || null,
        },
    });

    const isPending = createAssetMutation.isPending || updateAssetMutation.isPending;

    // Use useWatch hook for safe React Compiler integration
    const watchedSumber = useWatch({
        control: createForm.control,
        name: "sumber_perolehan",
        defaultValue: "kas",
    });

    const watchedCategoryUid = useWatch({
        control: createForm.control,
        name: "asset_category_uid",
    });

    const watchedHarga = (useWatch({
        control: createForm.control,
        name: "harga_perolehan",
        defaultValue: 0,
    }) || 0) as number;

    const watchedCashUid = useWatch({
        control: createForm.control,
        name: "cash_account_uid",
    });

    const watchedOffsetCoaUid = useWatch({
        control: createForm.control,
        name: "offset_coa_uid",
    });

    const selectedCashAccount = useMemo(() => {
        if (!watchedCashUid) return null;
        return validCashAccounts.find((a: CashAccount) => a.uid === watchedCashUid) || null;
    }, [watchedCashUid, validCashAccounts]);

    const selectedOffsetCoa = useMemo(() => {
        if (!watchedOffsetCoaUid) return null;
        return flatAccounts.find((a) => a.uid === watchedOffsetCoaUid) || null;
    }, [watchedOffsetCoaUid, flatAccounts]);

    const selectedCategory = useMemo(() => {
        if (!watchedCategoryUid) return null;
        return categories.find((c) => c.uid === watchedCategoryUid) || null;
    }, [watchedCategoryUid, categories]);

    const categoryAssetCoa = useMemo(() => {
        if (!selectedCategory) return null;
        return selectedCategory.coa_asset || selectedCategory.coaAsset || null;
    }, [selectedCategory]);

    const isCashInsufficient = useMemo(() => {
        if (isEdit || watchedSumber !== "kas" || !selectedCashAccount) return false;
        return (Number(selectedCashAccount.saldo) || 0) < watchedHarga;
    }, [isEdit, watchedSumber, selectedCashAccount, watchedHarga]);

    const handleCreateSubmit = (values: CreateAssetSchemaInput) => {
        createAssetMutation.mutate(values, {
            onSuccess: () => {
                toast.success("Perolehan aset berhasil dicatat.");
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal mencatat perolehan aset.");
            },
        });
    };

    const handleUpdateSubmit = (values: UpdateAssetSchemaInput) => {
        if (!editingAsset) return;
        updateAssetMutation.mutate(
            {
                uid: editingAsset.uid,
                data: values,
            },
            {
                onSuccess: () => {
                    toast.success("Data aset berhasil diperbarui.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memperbarui data aset.");
                },
            }
        );
    };

    return {
        isEdit,
        isPending,
        createForm,
        updateForm,
        categoryOptions,
        cashOptions,
        flatAccounts,
        selectedCategory,
        categoryAssetCoa,
        selectedCashAccount,
        selectedOffsetCoa,
        watchedSumber,
        watchedHarga,
        isCashInsufficient,
        isLoadingCash,
        isLoadingCoa,
        handleCreateSubmit,
        handleUpdateSubmit,
    };
}
