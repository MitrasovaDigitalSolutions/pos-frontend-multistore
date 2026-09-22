// ─── License Feature Types ───────────────────────────────────────────────────

export type LicenseEffectiveStatus =
    | "active"
    | "grace_period"
    | "expired"
    | "suspended"
    | "not_activated";

/**
 * Response shape from GET /api/v1/license/status
 */
export interface LicenseStatus {
    has_license: boolean;
    license_key: string | null;
    status: LicenseEffectiveStatus;
    subscription_type: string | null;
    instance_name: string | null;
    domain_instance: string | null;
    expires_at: string | null;
    days_remaining: number | null;
    is_grace_period: boolean;
    grace_days_remaining: number;
    can_operate: boolean;
    active_addons: string[];
    last_synced_at: string | null;
}

export interface LicenseStatusResponse {
    status: "success" | "error";
    message: string;
    data: LicenseStatus;
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

export interface CatalogAddon {
    id: string;
    product_id: string;
    code: string;
    nama: string;
    description: string;
    harga_bulanan: number;
    harga_tahunan: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CatalogProduct {
    id: string;
    code: string;
    nama: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    addons: CatalogAddon[];
}

export interface CatalogResponse {
    status: "success" | "error";
    message: string;
    data: CatalogProduct[];
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export interface InvoiceItem {
    name: string;
    type: "addon" | "base_product" | string;
    code: string;
    addon_id?: string;
    qty: number;
    price: number;
    subtotal: number;
    period_months: number;
}

export interface Invoice {
    id: string;
    invoice_number: string;
    client_id?: string;
    license_id?: string;
    total_amount: number;
    amount?: number; // fallback for backward compatibility
    currency?: string;
    status: "paid" | "unpaid" | "cancelled" | string;
    payment_method: string | null;
    due_date: string | null;
    due_at?: string | null; // fallback for backward compatibility
    paid_at: string | null;
    notes: string | null;
    description?: string | null; // fallback for backward compatibility
    items?: InvoiceItem[];
    created_at: string;
    issued_at?: string; // fallback for backward compatibility
    updated_at?: string;
}

export interface InvoicesResponse {
    status: "success" | "error";
    message: string;
    data: Invoice[];
}

// ─── Activate ────────────────────────────────────────────────────────────────

export interface ActivatePayload {
    license_key: string;
    instance_name?: string;
}

export interface ActivateResponse {
    status: "success" | "error";
    message: string;
    data: LicenseStatus;
}

// ─── Sync ────────────────────────────────────────────────────────────────────

export interface SyncResponse {
    status: "success" | "error";
    message: string;
    data: LicenseStatus;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type BillingPeriod = "monthly" | "annual";

export interface OrderPayload {
    billing_period: BillingPeriod;
    include_base_product?: boolean;
    addon_ids?: string[];
}

export interface OrderResult {
    order_id?: string;
    payment_url?: string;
    [key: string]: unknown;
}

export interface OrderResponse {
    status: "success" | "error";
    message: string;
    data: OrderResult;
}
