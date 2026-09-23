import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CatalogProduct } from "../types";
import {
    orderLicenseSchema,
    type OrderLicenseInput,
} from "../schemas/license-schema";
import { useLicenseOrderMutation } from "../api/license-api";

interface UseLicenseOrderParams {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog: CatalogProduct[];
    productCode?: string;
    initialAddonId?: string;
}

export function useLicenseOrder({
    open,
    onOpenChange,
    catalog,
    productCode,
    initialAddonId,
}: UseLicenseOrderParams) {
    const { mutate, isPending } = useLicenseOrderMutation();

    const targetProduct = productCode
        ? catalog.find((p) => p.code.toLowerCase() === productCode.toLowerCase())
        : catalog[0];

    const methods = useForm<OrderLicenseInput>({
        resolver: zodResolver(orderLicenseSchema),
        defaultValues: {
            billing_period: "monthly",
            include_base_product: false,
            addon_ids: initialAddonId ? [initialAddonId] : [],
        },
    });

    const { setValue, handleSubmit, reset, control } = methods;

    const billingPeriod =
        useWatch({ control, name: "billing_period" }) ?? "monthly";
    const selectedAddonIds = useWatch({ control, name: "addon_ids" }) ?? [];
    const includeBase =
        useWatch({ control, name: "include_base_product" }) ?? false;

    // Reset and sync initial state whenever dialog opens
    useEffect(() => {
        if (open) {
            reset({
                billing_period: "monthly",
                include_base_product: false,
                addon_ids: initialAddonId ? [initialAddonId] : [],
            });
        }
    }, [open, initialAddonId, reset]);

    const addons = targetProduct?.addons || [];

    const toggleAddon = (id: string) => {
        const current = selectedAddonIds;
        const updated = current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id];
        setValue("addon_ids", updated, { shouldValidate: true });
    };

    const selectAllAddons = () => {
        setValue(
            "addon_ids",
            addons.map((a) => a.id),
            { shouldValidate: true },
        );
    };

    const clearAllAddons = () => {
        setValue("addon_ids", [], { shouldValidate: true });
    };

    // Base product pricing directly from BE (defaults to 0 if not provided by BE)
    const baseMonthlyPrice = targetProduct?.harga_bulanan ?? 0;
    const baseAnnualPrice = targetProduct?.harga_tahunan ?? 0;

    // Calculate subtotal for addons
    const addonsMonthly = addons
        .filter((a) => selectedAddonIds.includes(a.id))
        .reduce((sum, a) => sum + a.harga_bulanan, 0);

    const addonsAnnual = addons
        .filter((a) => selectedAddonIds.includes(a.id))
        .reduce((sum, a) => sum + a.harga_tahunan, 0);

    // Total combines addons + base product (if selected)
    const totalMonthly = addonsMonthly + (includeBase ? baseMonthlyPrice : 0);
    const totalAnnual = addonsAnnual + (includeBase ? baseAnnualPrice : 0);

    const displayTotal = billingPeriod === "monthly" ? totalMonthly : totalAnnual;
    const displayAddonsTotal =
        billingPeriod === "monthly" ? addonsMonthly : addonsAnnual;
    const currentBasePrice =
        billingPeriod === "monthly" ? baseMonthlyPrice : baseAnnualPrice;

    const onSubmit = handleSubmit((data: OrderLicenseInput) => {
        mutate(
            {
                billing_period: data.billing_period,
                include_base_product: data.include_base_product,
                addon_ids: data.addon_ids,
            },
            {
                onSuccess: () => onOpenChange(false),
            },
        );
    });

    return {
        methods,
        targetProduct,
        addons,
        billingPeriod,
        selectedAddonIds,
        includeBase,
        displayTotal,
        totalMonthly,
        totalAnnual,
        addonsMonthly,
        addonsAnnual,
        displayAddonsTotal,
        baseMonthlyPrice,
        baseAnnualPrice,
        currentBasePrice,
        toggleAddon,
        selectAllAddons,
        clearAllAddons,
        isPending,
        onSubmit,
    };
}
