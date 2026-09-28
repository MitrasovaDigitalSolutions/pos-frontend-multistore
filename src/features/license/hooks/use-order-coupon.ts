import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { UseFormSetValue } from "react-hook-form";
import type { CouponCheckResult, BillingPeriod } from "../types";
import type { OrderLicenseInput } from "../schemas/license-schema";
import { useLicenseCheckCouponMutation } from "../api/license-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";

// ─── Params ──────────────────────────────────────────────────────────────────

interface UseOrderCouponParams {
    open: boolean;
    billingPeriod: BillingPeriod;
    includeBase: boolean;
    selectedAddonIds: string[];
    includeServer: boolean;
    serverPackageId: string | null;
    grossTotal: number;
    setValue: UseFormSetValue<OrderLicenseInput>;
}

// ─── Return Type ─────────────────────────────────────────────────────────────

export interface OrderCouponState {
    couponInput: string;
    setCouponInput: (val: string) => void;
    couponResult: CouponCheckResult | null;
    couponError: string | null;
    isCheckingCoupon: boolean;
    couponDiscount: number;
    handleApplyCoupon: () => Promise<void>;
    handleRemoveCoupon: () => void;
    /** Silently clear an applied coupon (for cart-change invalidation) */
    clearCoupon: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOrderCoupon({
    open,
    billingPeriod,
    includeBase,
    selectedAddonIds,
    includeServer,
    serverPackageId,
    grossTotal,
    setValue,
}: UseOrderCouponParams): OrderCouponState {
    const checkCouponMutation = useLicenseCheckCouponMutation();

    const [couponInput, setCouponInput] = useState("");
    const [couponResult, setCouponResult] = useState<CouponCheckResult | null>(
        null
    );
    const [couponError, setCouponError] = useState<string | null>(null);
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

    // Reset coupon state when dialog opens (derive-during-render, avoids setState in effect)
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setCouponInput("");
            setCouponResult(null);
            setCouponError(null);
        }
    }

    const couponDiscount = useMemo(() => {
        return couponResult
            ? Math.min(grossTotal, Number(couponResult.discount_amount) || 0)
            : 0;
    }, [couponResult, grossTotal]);

    /** Silently clear applied coupon — idempotent, safe to call even if no coupon is active */
    const clearCoupon = useCallback(() => {
        setCouponResult(null);
        setValue("coupon_code", undefined);
    }, [setValue]);

    const handleApplyCoupon = useCallback(async () => {
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
                addon_ids:
                    selectedAddonIds.length > 0
                        ? selectedAddonIds
                        : undefined,
                include_server: includeServer,
                server_package_id: serverPackageId || undefined,
            });

            const discount =
                Number(res?.discount_amount) ||
                Number(res?.coupon?.discount_amount) ||
                0;
            const appliedCode =
                res?.code || res?.coupon?.code || code;
            setCouponResult(res);
            setValue("coupon_code", appliedCode, {
                shouldValidate: true,
            });
            toast.success(
                `Kupon ${appliedCode} berhasil diterapkan! Hemat ${res?.formatted_discount || formatRupiah(discount)}`
            );
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Kupon tidak valid atau telah kedaluwarsa";
            setCouponError(msg);
            setCouponResult(null);
            setValue("coupon_code", undefined);
            toast.error(msg);
        } finally {
            setIsCheckingCoupon(false);
        }
    }, [
        couponInput,
        checkCouponMutation,
        billingPeriod,
        includeBase,
        selectedAddonIds,
        includeServer,
        serverPackageId,
        setValue,
    ]);

    const handleRemoveCoupon = useCallback(() => {
        setCouponResult(null);
        setCouponError(null);
        setCouponInput("");
        setValue("coupon_code", undefined);
        toast.info("Kupon promo dihapus.");
    }, [setValue]);

    return {
        couponInput,
        setCouponInput,
        couponResult,
        couponError,
        isCheckingCoupon,
        couponDiscount,
        handleApplyCoupon,
        handleRemoveCoupon,
        clearCoupon,
    };
}
