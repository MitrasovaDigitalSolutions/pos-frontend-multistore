"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { hasPermission, hasRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import type { Product } from "@/features/master/products/types";
import { useCreateProduction } from "../api/production-api";
import {
    productionCreateSchema,
    type ProductionCreateInput,
    type ProductionMaterialInput,
    type ProductionOutputInput,
} from "../schemas/production-schema";

export function useProductionCreate() {
    const router = useAppRouter();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    const hasManagePermission =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const createMutation = useCreateProduction();

    // Cache of products scanned/added via BarcodeInput on demand
    const [scannedProductsMap, setScannedProductsMap] = useState<Record<string, Product>>({});

    const todayDate = new Date().toISOString().split("T")[0];

    const methods = useForm<ProductionCreateInput>({
        resolver: zodResolver(productionCreateSchema) as Resolver<ProductionCreateInput>,
        defaultValues: {
            tanggal: todayDate,
            catatan: "",
            materials: [],
            outputs: [],
        },
    });

    const { control, handleSubmit, setValue } = methods;

    const materialsArray = useFieldArray({
        control,
        name: "materials",
    });

    const outputsArray = useFieldArray({
        control,
        name: "outputs",
    });

    const watchedMaterialsRaw = useWatch({ control, name: "materials" });
    const watchedOutputsRaw = useWatch({ control, name: "outputs" });

    const rawWatchedMaterials = useMemo(
        () => watchedMaterialsRaw || [],
        [watchedMaterialsRaw]
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

    // Handler when finished good is scanned or selected via BarcodeInput
    const handleOutputProductFound = (product: Product) => {
        setScannedProductsMap((prev) => ({ ...prev, [product.uid]: product }));

        const existingIndex = rawWatchedOutputs.findIndex(
            (o: ProductionOutputInput) => o.product_uid === product.uid
        );

        if (existingIndex > -1) {
            const currentQty = Number(rawWatchedOutputs[existingIndex]?.kuantitas) || 0;
            setValue(`outputs.${existingIndex}.kuantitas`, currentQty + 1, {
                shouldDirty: true,
                shouldValidate: true,
            });
            toast.info(`Kuantitas hasil "${product.nama}" bertambah (+1)`);
        } else {
            outputsArray.append({
                product_uid: product.uid,
                kuantitas: 1,
                hpp_satuan: product.harga_beli ?? 0,
                update_harga_jual: false,
                harga_jual_baru: null,
                margin_baru: null,
            });
            toast.success(`Barang jadi "${product.nama}" ditambahkan ke list`);
        }
        setLastScannedOutputUid(product.uid);
    };

    const onSubmit = (data: ProductionCreateInput) => {
        if (data.materials.length === 0) {
            toast.error("Minimal 1 bahan baku harus dimasukkan ke dalam daftar produksi.");
            return;
        }

        if (data.outputs.length === 0) {
            toast.error("Minimal 1 hasil barang jadi harus dimasukkan ke dalam daftar produksi.");
            return;
        }

        // Validation: Physical stock check for raw materials
        for (const mat of data.materials) {
            const prod = scannedProductsMap[mat.product_uid];
            if (prod && Number(mat.kuantitas) > (prod.stok ?? 0)) {
                toast.error(
                    `Stok bahan baku "${prod.nama}" tidak mencukupi (Tersedia: ${prod.stok} unit, Diminta: ${mat.kuantitas}).`
                );
                return;
            }
        }

        createMutation.mutate(data, {
            onSuccess: (res) => {
                toast.success(res.message || "Transaksi produksi berhasil disimpan!");
                router.push(ROUTES.ADMIN_PRODUCTION);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menyimpan transaksi produksi.");
            },
        });
    };

    const onError = () => {
        toast.error("Harap periksa kelengkapan formulir produksi sebelum menyimpan.");
    };

    const isPending = createMutation.isPending;

    return {
        methods,
        materialsArray,
        outputsArray,
        scannedProductsMap,
        watchedMaterials: rawWatchedMaterials,
        watchedOutputs: rawWatchedOutputs,
        totalBiayaBahan,
        totalOutputQty,
        totalAlokasiHpp,
        lastScannedMaterialUid,
        setLastScannedMaterialUid,
        lastScannedOutputUid,
        setLastScannedOutputUid,
        handleMaterialProductFound,
        handleOutputProductFound,
        onSubmit,
        onError,
        handleSubmit,
        isPending,
        hasManagePermission,
        router,
    };
}
