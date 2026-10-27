"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAppRouter } from "@/hooks/use-app-router";
import { ROUTES } from "@/constants/routes";
import { PHARMACY_DEFAULTS } from "../constants/pharmacy-constants";
import { usePharmacyCheckoutStore } from "./use-pharmacy-checkout-store";
import {
    useCreatePrescriptionTemplate,
    usePrescriptionTemplateDetail,
} from "../api/pharmacy-api";
import {
    compoundedItemFormSchema,
    type CompoundedItemFormValues,
} from "../schemas/compounded-item-schema";
import type { CompoundedIngredient, CompoundedItem, PrescriptionTemplate } from "../types";
import type { Product } from "@/features/master/products/types";
import { formatDosisKalkulasi } from "../utils/pharmacy-calc";

export function useCompoundingForm(draftId?: string, templateId?: string) {
    const router = useAppRouter();
    const existingItems = usePharmacyCheckoutStore((s) => s.compoundedItems);
    const addCompoundedItem = usePharmacyCheckoutStore((s) => s.addCompoundedItem);
    const updateCompoundedItem = usePharmacyCheckoutStore((s) => s.updateCompoundedItem);

    const existingDraft = draftId
        ? existingItems.find((item) => item.uid === draftId)
        : null;

    const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
    const [isSavingToMaster, setIsSavingToMaster] = useState(false);
    const [appliedTemplate, setAppliedTemplate] = useState<PrescriptionTemplate | null>(null);
    const [isLockedToTemplate, setIsLockedToTemplate] = useState<boolean>(false);
    const hasLoadedTemplateRef = useRef(false);

    const createTemplateMutation = useCreatePrescriptionTemplate();
    const { data: templateDetailResponse } = usePrescriptionTemplateDetail(templateId);

    const methods = useForm<CompoundedItemFormValues>({
        resolver: zodResolver(compoundedItemFormSchema) as Resolver<CompoundedItemFormValues>,
        defaultValues: {
            nama_racikan: existingDraft?.nama_racikan || "",
            jenis_racikan: existingDraft?.jenis_racikan || "puyer",
            jumlah_kemasan: existingDraft?.jumlah_kemasan || 10,
            aturan_pakai: existingDraft?.aturan_pakai || "",
            notes: existingDraft?.notes || "",
            tuslah_fee: existingDraft?.tuslah_fee ?? PHARMACY_DEFAULTS.DEFAULT_TUSLAH_FEE,
            embalase_fee: existingDraft?.embalase_fee ?? PHARMACY_DEFAULTS.DEFAULT_EMBALASE_FEE,
            total_harga: existingDraft?.total_harga || 0,
            ingredients: existingDraft?.ingredients || [],
        },
    });

    const { control, setValue, handleSubmit } = methods;

    const ingredients = useWatch({ control, name: "ingredients" }) || [];
    const jumlahKemasan = useWatch({ control, name: "jumlah_kemasan" }) || 10;
    const tuslahFee = useWatch({ control, name: "tuslah_fee" }) || 0;
    const embalaseFee = useWatch({ control, name: "embalase_fee" }) || 0;
    const namaRacikan = useWatch({ control, name: "nama_racikan" }) || "";
    const aturanPakai = useWatch({ control, name: "aturan_pakai" }) || "";

    // Calculation logic
    const subtotalIngredients = ingredients.reduce((acc, curr) => acc + curr.subtotal, 0);
    const totalHarga = subtotalIngredients + tuslahFee + embalaseFee;

    const isSaveDisabled =
        !namaRacikan.trim() ||
        !aturanPakai.trim() ||
        ingredients.length === 0 ||
        totalHarga <= 0;

    // Apply template logic (Template ingredients are per 1 kemasan; scale by jumlah_kemasan)
    const handleSelectTemplate = useCallback((template: PrescriptionTemplate) => {
        setValue("nama_racikan", template.nama_racikan, { shouldValidate: true });
        setValue("jenis_racikan", template.jenis_racikan || "puyer", { shouldValidate: true });
        setValue("aturan_pakai", template.aturan_pakai || "", { shouldValidate: true });
        setValue("tuslah_fee", template.tuslah_fee ?? PHARMACY_DEFAULTS.DEFAULT_TUSLAH_FEE, { shouldValidate: true });
        setValue("embalase_fee", template.embalase_fee ?? PHARMACY_DEFAULTS.DEFAULT_EMBALASE_FEE, { shouldValidate: true });

        const currentKemasan = Number(methods.getValues("jumlah_kemasan")) || 10;

        const mappedIngredients: CompoundedIngredient[] = (template.ingredients || []).map((ing) => {
            const price = ing.product?.harga || 0;
            const baseQty = Number(ing.kuantitas) || 1; // Formula per 1 kemasan
            const totalQty = Number((baseQty * currentKemasan).toFixed(4));
            return {
                product_uid: ing.product_uid,
                nama_produk: ing.nama_produk || ing.product?.nama || "Unknown",
                base_kuantitas: baseQty,
                kuantitas: totalQty,
                dosis_per_kemasan: ing.dosis || formatDosisKalkulasi(totalQty, currentKemasan, ing.product?.satuan),
                harga_satuan: price,
                subtotal: price * totalQty,
                stok_tersedia: ing.product?.stok ?? 0,
                satuan: ing.product?.satuan,
            };
        });

        setValue("ingredients", mappedIngredients, { shouldValidate: true });
        setAppliedTemplate(template);
        setIsLockedToTemplate(true);
        toast.success(`Template "${template.nama_racikan}" dimuat untuk ${currentKemasan} kemasan (terkunci standar)!`);
    }, [methods, setValue]);

    // Handle updating jumlah kemasan: automatically scales template ingredients when locked
    const handleUpdateJumlahKemasan = useCallback((newKemasan: number) => {
        const safeKemasan = Math.max(1, Math.round(newKemasan));
        setValue("jumlah_kemasan", safeKemasan, { shouldValidate: true });

        if (isLockedToTemplate && appliedTemplate) {
            const currentIngs = methods.getValues("ingredients") || [];
            if (currentIngs.length > 0) {
                const scaled = currentIngs.map((item) => {
                    const baseQty = item.base_kuantitas ?? 1;
                    const newTotalQty = Number((baseQty * safeKemasan).toFixed(4));
                    const subtotal = newTotalQty * item.harga_satuan;
                    const dosis = formatDosisKalkulasi(newTotalQty, safeKemasan, item.satuan);
                    return {
                        ...item,
                        base_kuantitas: baseQty,
                        kuantitas: newTotalQty,
                        subtotal,
                        dosis_per_kemasan: dosis,
                    };
                });
                setValue("ingredients", scaled, { shouldValidate: true });
            }
        }
    }, [isLockedToTemplate, appliedTemplate, methods, setValue]);

    // Unlock template to allow custom edits
    const handleUnlockTemplate = useCallback(() => {
        setIsLockedToTemplate(false);
        toast.info("Formula dibuka kunci. Anda sekarang dapat mengubah kuantitas bahan atau menambah obat lain.");
    }, []);

    // Re-lock and reset ingredients to standard template formula
    const handleRelockTemplate = useCallback(() => {
        if (!appliedTemplate) return;
        const currentKemasan = Number(methods.getValues("jumlah_kemasan")) || 10;
        const mappedIngredients: CompoundedIngredient[] = (appliedTemplate.ingredients || []).map((ing) => {
            const price = ing.product?.harga || 0;
            const baseQty = Number(ing.kuantitas) || 1;
            const totalQty = Number((baseQty * currentKemasan).toFixed(4));
            return {
                product_uid: ing.product_uid,
                nama_produk: ing.nama_produk || ing.product?.nama || "Unknown",
                base_kuantitas: baseQty,
                kuantitas: totalQty,
                dosis_per_kemasan: ing.dosis || formatDosisKalkulasi(totalQty, currentKemasan, ing.product?.satuan),
                harga_satuan: price,
                subtotal: price * totalQty,
                stok_tersedia: ing.product?.stok ?? 0,
                satuan: ing.product?.satuan,
            };
        });
        setValue("ingredients", mappedIngredients, { shouldValidate: true });
        setIsLockedToTemplate(true);
        toast.success(`Formula dikunci kembali sesuai template standar "${appliedTemplate.nama_racikan}".`);
    }, [appliedTemplate, methods, setValue]);

    // Auto load template when templateId is passed in URL
    useEffect(() => {
        if (!existingDraft && templateId && templateDetailResponse?.data && !hasLoadedTemplateRef.current) {
            hasLoadedTemplateRef.current = true;
            handleSelectTemplate(templateDetailResponse.data);
        }
    }, [templateDetailResponse, existingDraft, templateId, handleSelectTemplate]);

    // Ingredient actions with locked check
    const handleSelectProduct = (product: Product) => {
        if (isLockedToTemplate) {
            toast.error("Formula masih terkunci sesuai template standar. Silakan klik 'Kustomisasi Formula' untuk menambah bahan baru.");
            return;
        }

        const isAlreadyAdded = ingredients.some((i) => i.product_uid === product.uid);
        if (isAlreadyAdded) {
            toast.info(`"${product.nama}" sudah ada di racikan. Anda dapat mengubah kuantitas pada tabel.`);
            return;
        }

        const defaultQty = 1;
        const price = product.harga_jual || 0;

        const newIngredient: CompoundedIngredient = {
            product_uid: product.uid,
            nama_produk: product.nama,
            kuantitas: defaultQty,
            base_kuantitas: Number((defaultQty / jumlahKemasan).toFixed(4)),
            dosis_per_kemasan: formatDosisKalkulasi(defaultQty, jumlahKemasan, product.satuan || undefined),
            harga_satuan: price,
            subtotal: price * defaultQty,
            stok_tersedia: product.stok ?? 0,
            satuan: product.satuan || undefined,
        };

        setValue("ingredients", [...ingredients, newIngredient], { shouldValidate: true });
        toast.success(`"${product.nama}" ditambahkan ke racikan`);
    };

    const handleUpdateKuantitas = (index: number, kuantitas: number) => {
        if (isLockedToTemplate) {
            toast.error("Kuantitas bahan terkunci sesuai formula template. Silakan klik 'Kustomisasi Formula' terlebih dahulu.");
            return;
        }

        const safeQty = Math.max(0.01, kuantitas);
        const updated = ingredients.map((item, idx) => {
            if (idx !== index) return item;
            const subtotal = safeQty * item.harga_satuan;
            const dosis = formatDosisKalkulasi(safeQty, jumlahKemasan, item.satuan);
            return {
                ...item,
                kuantitas: safeQty,
                base_kuantitas: Number((safeQty / jumlahKemasan).toFixed(4)),
                subtotal,
                dosis_per_kemasan: dosis,
            };
        });
        setValue("ingredients", updated, { shouldValidate: true });
    };

    const handleUpdateDosis = (index: number, dosis: string) => {
        const updated = ingredients.map((item, idx) =>
            idx === index ? { ...item, dosis_per_kemasan: dosis } : item
        );
        setValue("ingredients", updated, { shouldValidate: true });
    };

    const handleRemoveIngredient = (index: number) => {
        if (isLockedToTemplate) {
            toast.error("Bahan template tidak dapat dihapus saat terkunci. Silakan klik 'Kustomisasi Formula' terlebih dahulu.");
            return;
        }

        const updated = ingredients.filter((_, idx) => idx !== index);
        setValue("ingredients", updated, { shouldValidate: true });
    };

    const onSubmit = (values: CompoundedItemFormValues) => {
        const compoundedItem: CompoundedItem = {
            uid: existingDraft?.uid || crypto.randomUUID(),
            nama_racikan: values.nama_racikan.trim(),
            jenis_racikan: values.jenis_racikan,
            jumlah_kemasan: values.jumlah_kemasan,
            aturan_pakai: values.aturan_pakai.trim(),
            tuslah_fee: values.tuslah_fee,
            embalase_fee: values.embalase_fee,
            total_harga: totalHarga,
            ingredients: values.ingredients,
            notes: values.notes?.trim() || null,
        };

        if (existingDraft) {
            updateCompoundedItem(existingDraft.uid, compoundedItem);
            toast.success(`Racikan "${compoundedItem.nama_racikan}" berhasil diperbarui`);
        } else {
            addCompoundedItem(compoundedItem);
            toast.success(`Racikan "${compoundedItem.nama_racikan}" dimasukkan ke keranjang kasir`);
        }

        router.push(ROUTES.CHECKOUT);
    };

    const handleSaveToMaster = async () => {
        const isValid = await methods.trigger(["nama_racikan", "aturan_pakai", "ingredients"]);
        if (!isValid || ingredients.length === 0) {
            toast.error("Lengkapi nama racikan, aturan pakai, dan minimal 1 bahan obat.");
            return;
        }

        setIsSavingToMaster(true);
        try {
            // Master template formula must represent 1 kemasan; normalize by dividing by jumlah_kemasan
            const normalizedIngredients = ingredients.map((ing) => {
                const qtyPerKemasan = ing.base_kuantitas ?? Number((ing.kuantitas / (jumlahKemasan || 1)).toFixed(4));
                return {
                    product_uid: ing.product_uid,
                    nama_produk: ing.nama_produk,
                    kuantitas: qtyPerKemasan,
                    dosis: ing.dosis_per_kemasan || null,
                };
            });

            await createTemplateMutation.mutateAsync({
                nama_racikan: namaRacikan.trim(),
                jenis_racikan: methods.getValues("jenis_racikan"),
                aturan_pakai: aturanPakai.trim() || null,
                tuslah_fee: tuslahFee,
                embalase_fee: embalaseFee,
                ingredients: normalizedIngredients,
            });
            toast.success(`Formula racikan "${namaRacikan}" (takaran per 1 kemasan) berhasil disimpan ke Master Template!`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Gagal menyimpan ke Master";
            toast.error(message);
        } finally {
            setIsSavingToMaster(false);
        }
    };

    const handleCancel = () => {
        if (existingDraft) {
            router.push(ROUTES.CHECKOUT);
        } else {
            router.push(ROUTES.CHECKOUT_COMPOUNDING);
        }
    };

    return {
        methods,
        ingredients,
        jumlahKemasan,
        tuslahFee,
        embalaseFee,
        subtotalIngredients,
        totalHarga,
        isSaveDisabled,
        isSavingToMaster,
        appliedTemplate,
        isLockedToTemplate,
        isTemplatePickerOpen,
        setIsTemplatePickerOpen,
        handleSelectProduct,
        handleUpdateKuantitas,
        handleUpdateDosis,
        handleRemoveIngredient,
        handleSelectTemplate,
        handleUpdateJumlahKemasan,
        handleUnlockTemplate,
        handleRelockTemplate,
        onSave: handleSubmit(onSubmit),
        onSaveToMaster: handleSaveToMaster,
        onCancel: handleCancel,
        isEditing: Boolean(existingDraft),
    };
}
