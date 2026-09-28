import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CatalogAddon, CatalogProduct, ServerPackage } from "../types";
import {
    orderLicenseSchema,
    type OrderLicenseInput,
} from "../schemas/license-schema";

// ─── Stable empty array reference to avoid re-renders ────────────────────────
const EMPTY_ADDON_IDS: string[] = [];

// ─── Default form values factory ─────────────────────────────────────────────
function getDefaultValues(initialAddonId?: string): OrderLicenseInput {
    return {
        billing_period: "monthly",
        include_base_product: false,
        addon_ids: initialAddonId ? [initialAddonId] : [],
        coupon_code: "",
        include_server: false,
        server_package_id: null,
        prorate: false,
        custom_days: null,
    };
}

// ─── Params ──────────────────────────────────────────────────────────────────

interface UseOrderFormParams {
    open: boolean;
    catalog: CatalogProduct[];
    serverPackages: ServerPackage[];
    productCode?: string;
    initialAddonId?: string;
    isOperable?: boolean;
}

// ─── Return Type ─────────────────────────────────────────────────────────────

export interface OrderFormState {
    methods: ReturnType<typeof useForm<OrderLicenseInput>>;
    targetProduct: CatalogProduct | undefined;
    addons: CatalogAddon[];
    billingPeriod: "monthly" | "annual";
    selectedAddonIds: string[];
    includeBase: boolean;
    includeServer: boolean;
    serverPackageId: string | null;
    selectedServer: ServerPackage | null;
    customDays: number | null;
    safeServerPackages: ServerPackage[];
    isProrated: boolean;
    withRenewal: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOrderForm({
    open,
    catalog,
    serverPackages,
    productCode,
    initialAddonId,
    isOperable = true,
}: UseOrderFormParams): OrderFormState {
    // ─── Safe arrays ─────────────────────────────────────────────────────
    const safeCatalog = useMemo(
        () => (Array.isArray(catalog) ? catalog : []),
        [catalog]
    );
    const safeServerPackages = useMemo(
        () => (Array.isArray(serverPackages) ? serverPackages : []),
        [serverPackages]
    );

    // ─── Product / addon derivation ──────────────────────────────────────
    const targetProduct = useMemo(
        () =>
            productCode
                ? safeCatalog.find(
                      (p) =>
                          p?.code?.toLowerCase() === productCode.toLowerCase()
                  )
                : safeCatalog[0],
        [safeCatalog, productCode]
    );

    const addons = useMemo(
        () => targetProduct?.addons ?? [],
        [targetProduct]
    );

    // ─── Form ────────────────────────────────────────────────────────────
    const methods = useForm<OrderLicenseInput>({
        resolver: zodResolver(orderLicenseSchema),
        defaultValues: getDefaultValues(initialAddonId),
    });

    const { control, reset } = methods;

    // ─── Watched values ──────────────────────────────────────────────────
    const billingPeriod =
        (useWatch({ control, name: "billing_period" }) as
            | "monthly"
            | "annual") ?? "monthly";

    const watchedAddonIds = useWatch({ control, name: "addon_ids" });
    const selectedAddonIds = useMemo(
        () => watchedAddonIds ?? EMPTY_ADDON_IDS,
        [watchedAddonIds]
    );

    const includeBase =
        useWatch({ control, name: "include_base_product" }) ?? false;
    const includeServer =
        useWatch({ control, name: "include_server" }) ?? false;
    const serverPackageId =
        useWatch({ control, name: "server_package_id" }) ?? null;
    const customDays =
        useWatch({ control, name: "custom_days" }) ?? null;

    // ─── Derived ─────────────────────────────────────────────────────────
    const selectedServer =
        safeServerPackages.find((s) => s.id === serverPackageId) ?? null;

    const isProrated = isOperable;
    const withRenewal = includeBase;

    // ─── Reset form on dialog open ───────────────────────────────────────
    // form.reset() is react-hook-form's API, not React setState
    useEffect(() => {
        if (open) {
            reset(getDefaultValues(initialAddonId));
        }
    }, [open, initialAddonId, reset]);

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
        safeServerPackages,
        customDays,
        isProrated,
        withRenewal,
    };
}
