"use client";

import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useAppRouter } from "@/hooks/use-app-router";
import { ROUTES } from "@/constants/routes";
import { useCreatePrescriptionTemplate } from "../api/pharmacy-api";
import { PHARMACY_DEFAULTS } from "../constants/pharmacy-constants";
import type { Product } from "@/features/master/products/types";

export interface TemplateIngredientFormItem {
    product_uid: string;
    nama_produk: string;
    kuantitas: number;
    dosis?: string;
    satuan?: string;
    harga?: number;
    subtotal?: number;
}

export interface TemplateFormValues {
    nama_racikan: string;
    jenis_racikan: string;
    aturan_pakai: string;
    tuslah_fee: number;
    embalase_fee: number;
    ingredients: TemplateIngredientFormItem[];
}

export function useTemplateForm(onSuccess?: () => void, onClose?: () => void) {
    const router = useAppRouter();
    const createMutation = useCreatePrescriptionTemplate();

    const methods = useForm<TemplateFormValues>({
        defaultValues: {
            nama_racikan: "",
            jenis_racikan: "puyer",
            aturan_pakai: "",
            tuslah_fee: PHARMACY_DEFAULTS.DEFAULT_TUSLAH_FEE,
            embalase_fee: PHARMACY_DEFAULTS.DEFAULT_EMBALASE_FEE,
            ingredients: [],
        },
    });

    const { control, handleSubmit, setValue, reset } = methods;
    const ingredients = useWatch({ control, name: "ingredients" }) || [];
    const namaRacikan = useWatch({ control, name: "nama_racikan" }) || "";
    const tuslahFee = useWatch({ control, name: "tuslah_fee" }) || 0;
    const embalaseFee = useWatch({ control, name: "embalase_fee" }) || 0;

    const subtotalIngredients = ingredients.reduce(
        (acc, curr) => acc + (curr.subtotal ?? (curr.harga || 0) * curr.kuantitas),
        0
    );
    const totalEstimasi = subtotalIngredients + Number(tuslahFee || 0) + Number(embalaseFee || 0);

    const isSaveDisabled =
        !namaRacikan.trim() || ingredients.length === 0 || createMutation.isPending;

    const handleAddProduct = (product: Product) => {
        const exists = ingredients.some((i) => i.product_uid === product.uid);
        if (exists) {
            toast.info(`"${product.nama}" sudah ada di komposisi racikan.`);
            return;
        }

        const price = product.harga || 0;
        const newItem: TemplateIngredientFormItem = {
            product_uid: product.uid,
            nama_produk: product.nama,
            kuantitas: 1,
            dosis: "",
            satuan: product.satuan || "satuan",
            harga: price,
            subtotal: price,
        };

        setValue("ingredients", [...ingredients, newItem], { shouldValidate: true });
        toast.success(`"${product.nama}" ditambahkan ke template`);
    };

    const handleUpdateQty = (index: number, kuantitas: number) => {
        const safeQty = Math.max(0.01, kuantitas);
        const updated = ingredients.map((item, idx) =>
            idx === index
                ? {
                      ...item,
                      kuantitas: safeQty,
                      subtotal: (item.harga || 0) * safeQty,
                  }
                : item
        );
        setValue("ingredients", updated, { shouldValidate: true });
    };

    const handleUpdateDosis = (index: number, dosis: string) => {
        const updated = ingredients.map((item, idx) =>
            idx === index ? { ...item, dosis } : item
        );
        setValue("ingredients", updated, { shouldValidate: true });
    };

    const handleRemove = (index: number) => {
        setValue(
            "ingredients",
            ingredients.filter((_, idx) => idx !== index),
            { shouldValidate: true }
        );
    };

    const onCancel = () => {
        if (onClose) {
            onClose();
        } else {
            router.push(ROUTES.ADMIN_PHARMACY_TEMPLATES);
        }
    };

    const onSubmit = (values: TemplateFormValues) => {
        if (!values.nama_racikan.trim()) {
            toast.error("Nama racikan wajib diisi");
            return;
        }

        if (values.ingredients.length === 0) {
            toast.error("Minimal harus ada 1 bahan obat penyusun template racikan");
            return;
        }

        createMutation.mutate(
            {
                nama_racikan: values.nama_racikan.trim(),
                jenis_racikan: values.jenis_racikan,
                aturan_pakai: values.aturan_pakai.trim() || null,
                tuslah_fee: Number(values.tuslah_fee) || 0,
                embalase_fee: Number(values.embalase_fee) || 0,
                ingredients: values.ingredients.map((ing) => ({
                    product_uid: ing.product_uid,
                    nama_produk: ing.nama_produk,
                    kuantitas: ing.kuantitas,
                    dosis: ing.dosis?.trim() || null,
                })),
            },
            {
                onSuccess: () => {
                    toast.success("Template racikan berhasil disimpan!");
                    reset();
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.push(ROUTES.ADMIN_PHARMACY_TEMPLATES);
                    }
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyimpan template racikan");
                },
            }
        );
    };

    return {
        methods,
        ingredients,
        subtotalIngredients,
        totalEstimasi,
        isSaveDisabled,
        handleAddProduct,
        handleUpdateQty,
        handleUpdateDosis,
        handleRemove,
        onCancel,
        onSave: handleSubmit(onSubmit),
        onSubmit: handleSubmit(onSubmit),
        isPending: createMutation.isPending,
        reset,
    };
}
