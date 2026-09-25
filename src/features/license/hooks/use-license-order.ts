import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { CatalogProduct, CouponCheckResult, ProrateItem, ServerPackage } from "../types";
import {
    orderLicenseSchema,
    type OrderLicenseInput,
} from "../schemas/license-schema";
import {
    useLicenseOrderMutation,
    useLicenseCheckCouponMutation,
    useLicenseProrateQuery,
} from "../api/license-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface UseLicenseOrderParams {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog?: CatalogProduct[];
    serverPackages?: ServerPackage[];
    productCode?: string;
    initialAddonId?: string;
    isOperable?: boolean;
}

export function useLicenseOrder({
    open,
    onOpenChange,
    catalog = [],
    serverPackages = [],
    productCode,
    initialAddonId,
    isOperable = true,
}: UseLicenseOrderParams) {
    const safeCatalog = useMemo(() => (Array.isArray(catalog) ? catalog : []), [catalog]);
    const safeServerPackages = useMemo(
        () => (Array.isArray(serverPackages) ? serverPackages : []),
        [serverPackages]
    );
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

    const selectedServer =
        safeServerPackages.find((s) => s.id === serverPackageId) ?? null;

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

    // Reset and sync initial form state whenever dialog opens (default server starts empty)
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
    const allAddonIds = useMemo(() => addons.map((a) => a.id), [addons]);

    const { data: prorateData, isLoading: isProrateLoading } = useLicenseProrateQuery(
        allAddonIds,
        {
            enabled: open && isOperable && allAddonIds.length > 0,
        },
    );

    const prorateMap = useMemo(() => {
        const map = new Map<string, ProrateItem>();
        if (!prorateData?.items) return map;
        for (const item of prorateData.items) {
            if (item.addon_id) map.set(item.addon_id, item);
            if (item.code) map.set(item.code, item);
        }
        return map;
    }, [prorateData]);

    const isProrated = isOperable && !includeBase && billingPeriod === "monthly";

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
        .reduce((sum, a) => {
            if (isProrated) {
                const prorateItem = prorateMap.get(a.id) ?? prorateMap.get(a.code);
                return sum + (prorateItem ? prorateItem.price : a.harga_bulanan);
            }
            return sum + a.harga_bulanan;
        }, 0);

    const addonsAnnual = addons
        .filter((a) => selectedAddonIds.includes(a.id))
        .reduce((sum, a) => sum + a.harga_tahunan, 0);

    // Server package pricing (only added if include_server is active and has a cost)
    const isCloudServer = Boolean(
        selectedServer &&
        selectedServer.code !== "on_premise" &&
        selectedServer.harga_bulanan > 0
    );
    const serverMonthlyPrice = isCloudServer && includeServer ? (selectedServer?.harga_bulanan ?? 0) : 0;
    const serverAnnualPrice = isCloudServer && includeServer ? (selectedServer?.harga_tahunan ?? 0) : 0;
    const currentServerPrice =
        billingPeriod === "annual" ? serverAnnualPrice : serverMonthlyPrice;

    // Total combines addons + base product (if selected) + server (if selected)
    const totalMonthly =
        addonsMonthly +
        (includeBase ? baseMonthlyPrice : 0) +
        serverMonthlyPrice;

    const totalAnnual =
        addonsAnnual +
        (includeBase ? baseAnnualPrice : 0) +
        serverAnnualPrice;

    const grossTotal = billingPeriod === "monthly" ? totalMonthly : totalAnnual;
    const couponDiscount = couponResult ? Math.min(grossTotal, Number(couponResult.discount_amount) || 0) : 0;
    const displayTotal = Math.max(0, grossTotal - couponDiscount);

    const displayAddonsTotal =
        billingPeriod === "monthly" ? addonsMonthly : addonsAnnual;
    const currentBasePrice =
        billingPeriod === "monthly" ? baseMonthlyPrice : baseAnnualPrice;

    const selectServerPackage = (packageId: string | null) => {
        if (!packageId) {
            setValue("server_package_id", null, { shouldValidate: true });
            setValue("include_server", false, { shouldValidate: true });
            if (couponResult) {
                setCouponResult(null);
                setValue("coupon_code", undefined);
            }
            return;
        }
        const pkg = safeServerPackages.find((s) => s.id === packageId);
        if (!pkg || pkg.code === "on_premise" || pkg.harga_bulanan === 0) {
            setValue("server_package_id", packageId, { shouldValidate: true });
            setValue("include_server", false, { shouldValidate: true });
        } else {
            setValue("server_package_id", packageId, { shouldValidate: true });
            setValue("include_server", true, { shouldValidate: true });
        }
        if (couponResult) {
            setCouponResult(null);
            setValue("coupon_code", undefined);
        }
    };

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
                prorate: isProrated,
            });

            const discount = Number(res?.discount_amount) || Number(res?.coupon?.discount_amount) || 0;
            const appliedCode = res?.code || res?.coupon?.code || code;
            setCouponResult(res);
            setValue("coupon_code", appliedCode, { shouldValidate: true });
            toast.success(
                `Kupon ${appliedCode} berhasil diterapkan! Hemat ${res?.formatted_discount || formatRupiah(discount)}`
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
                prorate: isProrated,
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
        selectedServer,
        serverPackages: safeServerPackages,
        serverMonthlyPrice,
        serverAnnualPrice,
        currentServerPrice,
        selectServerPackage,
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
        isProrated,
        prorateMap,
        prorateData,
        isProrateLoading,
    };
}
