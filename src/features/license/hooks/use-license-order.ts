import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { CatalogProduct, CouponCheckResult } from "../types";
import {
    orderLicenseSchema,
    type OrderLicenseInput,
} from "../schemas/license-schema";
import {
    useLicenseOrderMutation,
    useLicenseCheckCouponMutation,
} from "../api/license-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface UseLicenseOrderParams {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog?: CatalogProduct[];
    productCode?: string;
    initialAddonId?: string;
}

export function useLicenseOrder({
    open,
    onOpenChange,
    catalog = [],
    productCode,
    initialAddonId,
}: UseLicenseOrderParams) {
    const safeCatalog = Array.isArray(catalog) ? catalog : [];
    const { mutate, isPending } = useLicenseOrderMutation();
    const checkCouponMutation = useLicenseCheckCouponMutation();

    const [couponInput, setCouponInput] = useState("");
    const [couponResult, setCouponResult] = useState<CouponCheckResult | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

    const targetProduct = productCode
        ? safeCatalog.find((p) => p?.code?.toLowerCase() === productCode.toLowerCase())
        : safeCatalog[0];

    const methods = useForm<OrderLicenseInput>({
        resolver: zodResolver(orderLicenseSchema),
        defaultValues: {
            billing_period: "monthly",
            include_base_product: false,
            addon_ids: initialAddonId ? [initialAddonId] : [],
            coupon_code: "",
            include_server: false,
            server_package_id: null,
        },
    });

    const { setValue, handleSubmit, reset, control } = methods;

    const billingPeriod =
        useWatch({ control, name: "billing_period" }) ?? "monthly";
    const selectedAddonIds = useWatch({ control, name: "addon_ids" }) ?? [];
    const includeBase =
        useWatch({ control, name: "include_base_product" }) ?? false;
    const includeServer =
        useWatch({ control, name: "include_server" }) ?? false;
    const serverPackageId =
        useWatch({ control, name: "server_package_id" }) ?? null;

    // Reset coupon state during render when open prop changes (avoids setState in effect)
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setCouponInput("");
            setCouponResult(null);
            setCouponError(null);
        }
    }

    // Reset and sync initial form state whenever dialog opens
    useEffect(() => {
        if (open) {
            reset({
                billing_period: "monthly",
                include_base_product: false,
                addon_ids: initialAddonId ? [initialAddonId] : [],
                coupon_code: "",
                include_server: false,
                server_package_id: null,
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
        // If coupon was applied, clear it since cart items changed
        if (couponResult) {
            setCouponResult(null);
            setValue("coupon_code", undefined);
        }
    };

    const selectAllAddons = () => {
        setValue(
            "addon_ids",
            addons.map((a) => a.id),
            { shouldValidate: true },
        );
        if (couponResult) {
            setCouponResult(null);
            setValue("coupon_code", undefined);
        }
    };

    const clearAllAddons = () => {
        setValue("addon_ids", [], { shouldValidate: true });
        if (couponResult) {
            setCouponResult(null);
            setValue("coupon_code", undefined);
        }
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

    const grossTotal = billingPeriod === "monthly" ? totalMonthly : totalAnnual;
    const couponDiscount = couponResult ? Math.min(grossTotal, Number(couponResult.discount_amount) || 0) : 0;
    const displayTotal = Math.max(0, grossTotal - couponDiscount);

    const displayAddonsTotal =
        billingPeriod === "monthly" ? addonsMonthly : addonsAnnual;
    const currentBasePrice =
        billingPeriod === "monthly" ? baseMonthlyPrice : baseAnnualPrice;

    // Check Coupon Handler
    const handleApplyCoupon = async () => {
        const code = couponInput.trim();
        if (!code) {
            setCouponError("Masukkan kode kupon terlebih dahulu");
            return;
        }

        setIsCheckingCoupon(true);
        setCouponError(null);

        try {
            const res = await checkCouponMutation.mutateAsync({
                coupon_code: code,
                billing_period: billingPeriod,
                include_base_product: includeBase,
                addon_ids: selectedAddonIds,
                include_server: includeServer,
                server_package_id: serverPackageId || undefined,
            });

            const discount = Number(res?.discount_amount) || 0;
            setCouponResult(res);
            setValue("coupon_code", code, { shouldValidate: true });
            toast.success(
                `Kupon ${res.code} berhasil diterapkan! Hemat ${formatRupiah(discount)}`
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Kupon tidak valid atau telah kedaluwarsa";
            setCouponError(msg);
            setCouponResult(null);
            setValue("coupon_code", undefined);
            toast.error(msg);
        } finally {
            setIsCheckingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponResult(null);
        setCouponError(null);
        setCouponInput("");
        setValue("coupon_code", undefined);
        toast.info("Kupon promo dihapus.");
    };

    const onSubmit = handleSubmit((data: OrderLicenseInput) => {
        mutate(
            {
                billing_period: data.billing_period,
                include_base_product: data.include_base_product,
                addon_ids: data.addon_ids,
                coupon_code: couponResult?.code ?? data.coupon_code ?? undefined,
                include_server: data.include_server,
                server_package_id: data.server_package_id ?? undefined,
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
        includeServer,
        serverPackageId,
        grossTotal,
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
        // Coupon handlers & state
        couponInput,
        setCouponInput,
        couponResult,
        couponError,
        isCheckingCoupon,
        couponDiscount,
        handleApplyCoupon,
        handleRemoveCoupon,
        isPending,
        onSubmit,
    };
}
