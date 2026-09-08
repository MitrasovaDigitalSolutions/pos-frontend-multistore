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
    const { data: flatAccounts = [], isLoading: isLoadingCoa } = useFlatChartOfAccounts({ is_postable: true });

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
        mode: "onChange",
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
            akumulasi_penyusutan_awal: 0,
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

    const watchedNilaiResidu = (useWatch({
        control: createForm.control,
        name: "nilai_residu",
        defaultValue: 0,
    }) || 0) as number;

    const watchedAkumulasiAwal = (useWatch({
        control: createForm.control,
        name: "akumulasi_penyusutan_awal",
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

    const categoryAkumulasiCoa = useMemo(() => {
        if (!selectedCategory) return null;
        return selectedCategory.coa_akumulasi_penyusutan || selectedCategory.coaAkumulasiPenyusutan || null;
    }, [selectedCategory]);

    const categoryQuota = selectedCategory?.quota;

    const isHargaExceedingQuota = useMemo(() => {
        if (watchedSumber !== "existing" || !categoryQuota) return false;
        return watchedHarga > categoryQuota.harga_perolehan_tersedia;
    }, [watchedSumber, categoryQuota, watchedHarga]);

    const isAkumulasiExceedingQuota = useMemo(() => {
        if (watchedSumber !== "existing" || !categoryQuota) return false;
        return watchedAkumulasiAwal > categoryQuota.akumulasi_penyusutan_tersedia;
    }, [watchedSumber, categoryQuota, watchedAkumulasiAwal]);

    const maxAllowedSusutAwal = useMemo(() => {
        return Math.max(0, watchedHarga - (watchedNilaiResidu || 0));
    }, [watchedHarga, watchedNilaiResidu]);

    const isAkumulasiExceedingHarga = useMemo(() => {
        if (watchedSumber !== "existing") return false;
        if (watchedHarga <= 0 && watchedAkumulasiAwal > 0) return true;
        return watchedAkumulasiAwal > maxAllowedSusutAwal;
    }, [watchedSumber, watchedHarga, watchedAkumulasiAwal, maxAllowedSusutAwal]);

    const estimatedNilaiBukuAwal = useMemo(() => {
        if (watchedSumber === "existing") {
            return watchedHarga - watchedAkumulasiAwal;
        }
        return watchedHarga;
    }, [watchedSumber, watchedHarga, watchedAkumulasiAwal]);

    const isCashInsufficient = useMemo(() => {
        if (isEdit || watchedSumber !== "kas" || !selectedCashAccount) return false;
        return (Number(selectedCashAccount.saldo) || 0) < watchedHarga;
    }, [isEdit, watchedSumber, selectedCashAccount, watchedHarga]);

    const handleCreateSubmit = (values: CreateAssetSchemaInput) => {
        const payload = { ...values };
        if (payload.sumber_perolehan === "existing") {
            payload.cash_account_uid = null;
            payload.offset_coa_uid = null;
        }
        createAssetMutation.mutate(payload, {
            onSuccess: () => {
                toast.success(
                    payload.sumber_perolehan === "existing"
                        ? "Mapping aset saldo awal berhasil dicatat."
                        : "Perolehan aset berhasil dicatat."
                );
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
        categoryAkumulasiCoa,
        categoryQuota,
        selectedCashAccount,
        selectedOffsetCoa,
        watchedSumber,
        watchedHarga,
        watchedNilaiResidu,
        watchedAkumulasiAwal,
        estimatedNilaiBukuAwal,
        maxAllowedSusutAwal,
        isCashInsufficient,
        isHargaExceedingQuota,
        isAkumulasiExceedingQuota,
        isAkumulasiExceedingHarga,
        isLoadingCash,
        isLoadingCoa,
        handleCreateSubmit,
        handleUpdateSubmit,
    };
}
