"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import type { Product } from "@/features/master/products/types";
import { apiGet } from "@/shared/api/api-client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { ProductBomResponse } from "@/features/manufacturing/product-bom/types";
import {
    useCalculateBom,
    useCalculateHppPreview,
    useCreateProduction,
    useProductionDetail,
    useUpdateProduction,
} from "../api/production-api";
import {
    productionCreateSchema,
    type ProductionAdditionalCostInput,
    type ProductionCreateInput,
    type ProductionMaterialInput,
    type ProductionOutputInput,
} from "../schemas/production-schema";

interface UseProductionCreateProps {
    productionUid?: string;
}

export function useProductionCreate({ productionUid }: UseProductionCreateProps = {}) {
    const router = useAppRouter();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasManagePermission =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const isEdit = Boolean(productionUid);
    const { data: detailRes, isLoading: isDetailLoading } = useProductionDetail(productionUid);
    const existingProduction = detailRes?.data;

    const createMutation = useCreateProduction();
    const updateMutation = useUpdateProduction();
    const calculateBomMutation = useCalculateBom();
    const calculatePreviewMutation = useCalculateHppPreview();

    // Cache of products scanned/added via BarcodeInput on demand
    const [scannedProductsMap, setScannedProductsMap] = useState<Record<string, Product>>({});
    const [hppPreviewOutputs, setHppPreviewOutputs] = useState<Record<string, number>>({});
    const [isSyncingBom, setIsSyncingBom] = useState(false);
    const syncDebounceRef = useRef<NodeJS.Timeout | null>(null);

    const todayDate = new Date().toISOString().split("T")[0];

    const methods = useForm<ProductionCreateInput>({
        resolver: zodResolver(productionCreateSchema) as Resolver<ProductionCreateInput>,
        defaultValues: {
            tanggal_mulai: todayDate,
            tanggal_selesai: null,
            tanggal: todayDate,
            status: "draft",
            metode_alokasi: "actual_hybrid",
            catatan: "",
            materials: [],
            additional_costs: [],
            outputs: [],
        },
    });

    const { control, handleSubmit, setValue, reset } = methods;

    // Populate form if editing existing production draft
    const hasInitializedRef = useRef(false);
    useEffect(() => {
        if (existingProduction && !hasInitializedRef.current) {
            hasInitializedRef.current = true;

            const newProductsMap: Record<string, Product> = {};

            const materials: ProductionMaterialInput[] = (existingProduction.materials || []).map((m) => {
                if (m.product) {
                    newProductsMap[m.product_uid] = m.product;
                }
                return {
                    product_uid: m.product_uid,
                    kuantitas: Number(m.kuantitas) || 1,
                    harga_satuan: m.harga_satuan ?? 0,
                };
            });

            const rawCosts = existingProduction.additional_costs || existingProduction.additionalCosts || [];
            const additional_costs: ProductionAdditionalCostInput[] = rawCosts.map((c) => ({
                nama_biaya: c.nama_biaya,
                nominal: Number(c.nominal) || 0,
            }));

            const outputs: ProductionOutputInput[] = (existingProduction.outputs || []).map((o) => {
                if (o.product) {
                    newProductsMap[o.product_uid] = o.product;
                }
                return {
                    product_uid: o.product_uid,
                    kuantitas: Number(o.kuantitas) || 1,
                    hpp_satuan: o.hpp_satuan ?? 0,
                    update_harga_jual: o.update_harga_jual ?? false,
                    harga_jual_baru: o.harga_jual_baru ?? null,
                    margin_baru: o.margin_baru ?? null,
                };
            });

            setScannedProductsMap((prev) => ({ ...prev, ...newProductsMap }));

            reset({
                tanggal_mulai: existingProduction.tanggal_mulai || existingProduction.tanggal || todayDate,
                tanggal_selesai: existingProduction.tanggal_selesai || null,
                tanggal: existingProduction.tanggal || todayDate,
                status: existingProduction.status === "completed" ? "completed" : "draft",
                metode_alokasi: existingProduction.metode_alokasi || "actual_hybrid",
                catatan: existingProduction.catatan || "",
                materials,
                additional_costs,
                outputs,
            });
        }
    }, [existingProduction, reset, todayDate]);

    const materialsArray = useFieldArray({
        control,
        name: "materials",
    });

    const additionalCostsArray = useFieldArray({
        control,
        name: "additional_costs",
    });

    const outputsArray = useFieldArray({
        control,
        name: "outputs",
    });

    const watchedMaterialsRaw = useWatch({ control, name: "materials" });
    const watchedAdditionalCostsRaw = useWatch({ control, name: "additional_costs" });
    const watchedOutputsRaw = useWatch({ control, name: "outputs" });

    const rawWatchedMaterials = useMemo(
        () => watchedMaterialsRaw || [],
        [watchedMaterialsRaw]
    );
    const rawWatchedAdditionalCosts = useMemo(
        () => watchedAdditionalCostsRaw || [],
        [watchedAdditionalCostsRaw]
    );
    const rawWatchedOutputs = useMemo(
        () => watchedOutputsRaw || [],
        [watchedOutputsRaw]
    );

    // Focus state after scan
    const [lastScannedMaterialUid, setLastScannedMaterialUid] = useState<string | null>(null);
    const [lastScannedOutputUid, setLastScannedOutputUid] = useState<string | null>(null);

    // Live calculation: Total Biaya Bahan Baku
    const totalBiayaBahan = useMemo(() => {
        return rawWatchedMaterials.reduce((sum: number, item: ProductionMaterialInput) => {
            const qty = Number(item?.kuantitas) || 0;
            const price = Number(item?.harga_satuan) || 0;
            return sum + qty * price;
        }, 0);
    }, [rawWatchedMaterials]);

    // Live calculation: Total Biaya Tambahan Langsung
    const totalBiayaTambahan = useMemo(() => {
        return rawWatchedAdditionalCosts.reduce((sum: number, item: ProductionAdditionalCostInput) => {
            return sum + (Number(item?.nominal) || 0);
        }, 0);
    }, [rawWatchedAdditionalCosts]);

    // Total Bersih (Bahan + Biaya Tambahan)
    const totalBersih = useMemo(() => {
        return totalBiayaBahan + totalBiayaTambahan;
    }, [totalBiayaBahan, totalBiayaTambahan]);

    // Live calculation: Total Output Qty & Total HPP Alokasi
    const totalOutputQty = useMemo(() => {
        return rawWatchedOutputs.reduce(
            (sum: number, item: ProductionOutputInput) => sum + (Number(item?.kuantitas) || 0),
            0
        );
    }, [rawWatchedOutputs]);

    const totalAlokasiHpp = useMemo(() => {
        return rawWatchedOutputs.reduce((sum: number, item: ProductionOutputInput) => {
            const qty = Number(item?.kuantitas) || 0;
            const hpp = Number(item?.hpp_satuan) || 0;
            return sum + qty * hpp;
        }, 0);
    }, [rawWatchedOutputs]);

    // Handler when raw material is scanned or selected via BarcodeInput
    const handleMaterialProductFound = (product: Product) => {
        setScannedProductsMap((prev) => ({ ...prev, [product.uid]: product }));

        const existingIndex = rawWatchedMaterials.findIndex(
            (m: ProductionMaterialInput) => m.product_uid === product.uid
        );

        if (existingIndex > -1) {
            const currentQty = Number(rawWatchedMaterials[existingIndex]?.kuantitas) || 0;
            setValue(`materials.${existingIndex}.kuantitas`, currentQty + 1, {
                shouldDirty: true,
                shouldValidate: true,
            });
            toast.info(`Kuantitas bahan "${product.nama}" bertambah (+1)`);
        } else {
            materialsArray.append({
                product_uid: product.uid,
                kuantitas: 1,
                harga_satuan: product.harga_beli ?? 0,
            });
            toast.success(`Bahan baku "${product.nama}" ditambahkan ke list`);
        }
        setLastScannedMaterialUid(product.uid);
    };

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (syncDebounceRef.current) {
                clearTimeout(syncDebounceRef.current);
            }
        };
    }, []);

    // Helper to calculate / sync raw materials from BoM detail
    const syncMaterialsFromOutputs = async (
        targetOutputs: ProductionOutputInput[],
        showNotification = false
    ) => {
        const validOutputs = targetOutputs.filter(
            (o) => o.product_uid && Number(o.kuantitas) > 0
        );

        if (validOutputs.length === 0) {
            setValue("materials", [], { shouldValidate: true, shouldDirty: true });
            return;
        }

        setIsSyncingBom(true);
        try {
            let loadedMaterials: Array<{
                material_product_uid: string;
                nama: string;
                barcode?: string | null;
                satuan?: string | null;
                stok_tersedia?: number;
                harga_satuan: number;
                total_kebutuhan: number;
            }> = [];

            // Attempt 1: Call calculate-bom backend endpoint
            try {
                const res = await calculateBomMutation.mutateAsync({
                    outputs: validOutputs.map((o) => ({
                        product_uid: o.product_uid,
                        kuantitas: Number(o.kuantitas),
                    })),
                });

                if (res.data?.materials && res.data.materials.length > 0) {
                    loadedMaterials = res.data.materials.map((m) => ({
                        material_product_uid: m.material_product_uid,
                        nama: m.nama,
                        barcode: m.barcode,
                        satuan: m.satuan,
                        stok_tersedia: m.stok_tersedia,
                        harga_satuan: m.harga_satuan,
                        total_kebutuhan: m.total_kebutuhan,
                    }));
                }
            } catch {
                // If calculate-bom fails or returns 404/500, fallback to individual product boms
            }

            // Attempt 2 (Fallback): Query each product's BoM detail directly
            if (loadedMaterials.length === 0) {
                const materialMap: Record<
                    string,
                    {
                        material_product_uid: string;
                        nama: string;
                        barcode?: string | null;
                        satuan?: string | null;
                        stok_tersedia?: number;
                        harga_satuan: number;
                        total_kebutuhan: number;
                    }
                > = {};

                for (const out of validOutputs) {
                    try {
                        const bomDetailRes = await apiGet<ApiResponse<ProductBomResponse>>(
                            ENDPOINTS.PRODUCT_BOMS.LIST(out.product_uid)
                        );
                        const boms = bomDetailRes.data?.boms || [];
                        const outQty = Number(out.kuantitas) || 1;

                        for (const b of boms) {
                            const matUid = b.material_product_uid;
                            const waste = Number(b.toleransi_waste_pct) || 0;
                            const wasteMultiplier = 1 + waste / 100;
                            const needed = Number(
                                ((Number(b.kuantitas_standar) || 0) * outQty * wasteMultiplier).toFixed(4)
                            );
                            const p = b.material_product;

                            if (!materialMap[matUid]) {
                                materialMap[matUid] = {
                                    material_product_uid: matUid,
                                    nama: p?.nama || "Bahan Baku",
                                    barcode: p?.barcode || null,
                                    satuan: p?.satuan || null,
                                    stok_tersedia: p?.stok ?? 0,
                                    harga_satuan: p?.harga_beli ?? 0,
                                    total_kebutuhan: needed,
                                };
                            } else {
                                materialMap[matUid].total_kebutuhan = Number(
                                    (materialMap[matUid].total_kebutuhan + needed).toFixed(4)
                                );
                            }
                        }
                    } catch {
                        // ignore single fetch error
                    }
                }
                loadedMaterials = Object.values(materialMap);
            }

            if (loadedMaterials.length === 0) {
                if (showNotification) {
                    toast.warning("Barang jadi yang dipilih belum memiliki rincian resep BoM.");
                }
                return;
            }

            // Update product cache for stock and names
            const newProductsMap: Record<string, Product> = {};
            loadedMaterials.forEach((m) => {
                newProductsMap[m.material_product_uid] = {
                    uid: m.material_product_uid,
                    nama: m.nama,
                    barcode: m.barcode || "",
                    satuan: m.satuan || null,
                    stok: m.stok_tersedia,
                    harga_beli: m.harga_satuan,
                    is_raw_material: true,
                } as unknown as Product;
            });
            setScannedProductsMap((prev) => ({ ...prev, ...newProductsMap }));

            // Update form materials list automatically
            const newMaterials: ProductionMaterialInput[] = loadedMaterials.map((m) => ({
                product_uid: m.material_product_uid,
                kuantitas: m.total_kebutuhan,
                harga_satuan: m.harga_satuan,
            }));

            setValue("materials", newMaterials, {
                shouldValidate: true,
                shouldDirty: true,
            });

            if (showNotification) {
                toast.success(
                    `Bahan baku otomatis terisi dari resep BoM (${loadedMaterials.length} bahan dimuat).`
                );
            }
        } catch (err: unknown) {
            const error = err as { message?: string };
            if (showNotification) {
                toast.error(error?.message || "Gagal memuat resep BoM.");
            }
        } finally {
            setIsSyncingBom(false);
        }
    };

    const debouncedSyncMaterials = (outputs: ProductionOutputInput[]) => {
        if (syncDebounceRef.current) {
            clearTimeout(syncDebounceRef.current);
        }
        syncDebounceRef.current = setTimeout(() => {
            syncMaterialsFromOutputs(outputs, false);
        }, 350);
    };

    // Handler when finished good is scanned or selected via BarcodeInput
    const handleOutputProductFound = async (product: Product) => {
        setScannedProductsMap((prev) => ({ ...prev, [product.uid]: product }));

        const existingIndex = rawWatchedOutputs.findIndex(
            (o: ProductionOutputInput) => o.product_uid === product.uid
        );

        let updatedOutputs: ProductionOutputInput[];
        if (existingIndex > -1) {
            const currentQty = Number(rawWatchedOutputs[existingIndex]?.kuantitas) || 0;
            const nextQty = currentQty + 1;
            setValue(`outputs.${existingIndex}.kuantitas`, nextQty, {
                shouldDirty: true,
                shouldValidate: true,
            });
            toast.info(`Kuantitas hasil "${product.nama}" bertambah (+1)`);
            updatedOutputs = rawWatchedOutputs.map((o, i) =>
                i === existingIndex ? { ...o, kuantitas: nextQty } : o
            );
        } else {
            const newOutput: ProductionOutputInput = {
                product_uid: product.uid,
                kuantitas: 1,
                hpp_satuan: 0,
                update_harga_jual: false,
                harga_jual_baru: null,
                margin_baru: null,
            };
            outputsArray.append(newOutput);
            toast.success(`Barang jadi "${product.nama}" ditambahkan ke list`);
            updatedOutputs = [...rawWatchedOutputs, newOutput];
        }
        setLastScannedOutputUid(product.uid);

        // Automatically populate raw materials from BoM detail
        await syncMaterialsFromOutputs(updatedOutputs, true);
    };

    // Handler to remove output and recalculate remaining BoM materials
    const handleRemoveOutputItem = async (index: number) => {
        const remaining = rawWatchedOutputs.filter((_, i) => i !== index);
        outputsArray.remove(index);
        await syncMaterialsFromOutputs(remaining, false);
    };

    // Handler when output quantity is adjusted
    const handleUpdateOutputQty = (index: number, newQty: number) => {
        setValue(`outputs.${index}.kuantitas`, newQty, {
            shouldDirty: true,
            shouldValidate: true,
        });
        const updated = rawWatchedOutputs.map((o, i) =>
            i === index ? { ...o, kuantitas: newQty } : o
        );
        debouncedSyncMaterials(updated);
    };

    // Manual recalculate materials needed from BoM
    const handleCalculateBom = async () => {
        const validOutputs = rawWatchedOutputs.filter(
            (o) => o.product_uid && Number(o.kuantitas) > 0
        );

        if (validOutputs.length === 0) {
            toast.error("Pilih minimal 1 barang jadi dengan kuantitas > 0 untuk menghitung kebutuhan bahan dari BoM.");
            return;
        }

        await syncMaterialsFromOutputs(rawWatchedOutputs, true);
    };

    // Live preview simulation for HPP
    const handleCalculatePreview = async () => {
        const currentValues = methods.getValues();
        if (currentValues.materials.length === 0 || currentValues.outputs.length === 0) {
            toast.error("Tambahkan minimal 1 bahan baku dan 1 barang jadi untuk simulasi HPP.");
            return;
        }

        try {
            const res = await calculatePreviewMutation.mutateAsync({
                ...currentValues,
                metode_alokasi: "actual_hybrid",
                status: "draft",
            });

            if (res.data?.outputs) {
                const previewMap: Record<string, number> = {};
                res.data.outputs.forEach((o, idx) => {
                    previewMap[o.product_uid] = o.hpp_satuan;
                    setValue(`outputs.${idx}.hpp_satuan`, o.hpp_satuan, {
                        shouldValidate: true,
                        shouldDirty: true,
                    });
                });
                setHppPreviewOutputs(previewMap);
                toast.success("Simulasi alokasi HPP berhasil dihitung.");
            }
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error?.message || "Gagal melakukan simulasi alokasi HPP.");
        }
    };

    const handleAddAdditionalCost = () => {
        additionalCostsArray.append({ nama_biaya: "", nominal: 0 });
    };

    const handleRemoveAdditionalCost = (index: number) => {
        additionalCostsArray.remove(index);
    };

    const submitWithStatus = (
        data: ProductionCreateInput,
        targetStatus: "draft" | "completed"
    ) => {
        if (data.materials.length === 0) {
            toast.error("Minimal 1 bahan baku harus dimasukkan ke dalam daftar produksi.");
            return;
        }

        if (data.outputs.length === 0) {
            toast.error("Minimal 1 hasil barang jadi harus dimasukkan ke dalam daftar produksi.");
            return;
        }

        const payload: ProductionCreateInput = {
            ...data,
            status: targetStatus,
            metode_alokasi: "actual_hybrid",
            tanggal: data.tanggal_mulai || data.tanggal || todayDate,
            tanggal_mulai: data.tanggal_mulai || todayDate,
            tanggal_selesai:
                targetStatus === "completed"
                    ? data.tanggal_selesai || data.tanggal_mulai || todayDate
                    : data.tanggal_selesai || null,
            additional_costs: (data.additional_costs || []).map((c) => ({
                nama_biaya: c.nama_biaya,
                nominal: Number(c.nominal) || 0,
            })),
        };

        // Stock validation when completing/finalizing
        if (targetStatus === "completed") {
            for (const mat of payload.materials) {
                const prod = scannedProductsMap[mat.product_uid];
                if (prod && Number(mat.kuantitas) > (prod.stok ?? 0)) {
                    toast.error(
                        `Stok bahan baku "${prod.nama}" tidak mencukupi (Tersedia: ${prod.stok} unit, Diminta: ${mat.kuantitas}).`
                    );
                    return;
                }
            }
        }

        if (isEdit && productionUid) {
            updateMutation.mutate(
                { uid: productionUid, data: payload },
                {
                    onSuccess: (res) => {
                        toast.success(
                            res.message ||
                            (targetStatus === "draft"
                                ? "Draft produksi berhasil diperbarui!"
                                : "Produksi berhasil diselesaikan!")
                        );
                        router.push(ROUTES.ADMIN_PRODUCTION);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui transaksi produksi.");
                    },
                }
            );
        } else {
            createMutation.mutate(payload, {
                onSuccess: (res) => {
                    toast.success(
                        res.message ||
                        (targetStatus === "draft"
                            ? "Draft produksi berhasil disimpan!"
                            : "Transaksi produksi berhasil diselesaikan!")
                    );
                    router.push(ROUTES.ADMIN_PRODUCTION);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan transaksi produksi.");
                },
            });
        }
    };

    const onError = () => {
        toast.error("Harap periksa kelengkapan formulir produksi sebelum menyimpan.");
    };

    const handleSaveDraft = () => {
        handleSubmit((data) => submitWithStatus(data, "draft"), onError)();
    };

    const handleComplete = () => {
        handleSubmit((data) => submitWithStatus(data, "completed"), onError)();
    };

    const isPending = createMutation.isPending || updateMutation.isPending || isDetailLoading;

    return {
        methods,
        materialsArray,
        additionalCostsArray,
        outputsArray,
        scannedProductsMap,
        watchedMaterials: rawWatchedMaterials,
        watchedAdditionalCosts: rawWatchedAdditionalCosts,
        watchedOutputs: rawWatchedOutputs,
        totalBiayaBahan,
        totalBiayaTambahan,
        totalBersih,
        totalOutputQty,
        totalAlokasiHpp,
        lastScannedMaterialUid,
        setLastScannedMaterialUid,
        lastScannedOutputUid,
        setLastScannedOutputUid,
        handleMaterialProductFound,
        handleOutputProductFound,
        handleRemoveOutputItem,
        handleUpdateOutputQty,
        handleCalculateBom,
        isCalculatingBom: calculateBomMutation.isPending || isSyncingBom,
        handleCalculatePreview,
        isCalculatingPreview: calculatePreviewMutation.isPending,
        hppPreviewOutputs,
        handleAddAdditionalCost,
        handleRemoveAdditionalCost,
        handleSaveDraft,
        handleComplete,
        isPending,
        isEdit,
        existingProduction,
        isDetailLoading,
        hasManagePermission,
        router,
    };
}
