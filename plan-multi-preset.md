# PANDUAN LENGKAP IMPLEMENTASI FRONTEND: SISTEM MULTI-PRESET BISNIS
## (Retail, Konveksi / Manufaktur, Apotek / Farmasi)
### *Single Codebase POS & Central Licensing Portal*

> **Status Backend**: **SELESAI & SUDAH DIDEPLOY KE PRODUCTION VPS `43.173.15.154`**  
> - Portal Backend: `https://portal.mitrasovapos.my.id` (Migration executed, unit tests 100%)
> - POS Client Konveksi: `https://misetbackend.mitrasovapos.my.id` (Migration executed)
> - Gateway Nginx: Telah di-restart dan aktif kembali (HTTP 200 OK)
>
> **Target Tim Frontend**: 
> 1. Tim Frontend POS (`MitrasovaDigitalSolutions/pos-frontend-multistore`)
> 2. Tim Frontend Portal Admin (`MitrasovaDigitalSolutions/portal-mitrasova`)

---

# BAGIAN 1: PANDUAN POS FRONTEND (`pos-frontend-multistore`)

### 1.1. Konsep
Aplikasi POS beroperasi dalam 3 preset bisnis:
* `'retail'` (Default: Minimarket, Toko Retail umum)
* `'confectionery'` (Konveksi, Sablon Kaos, Manufaktur Garmen)
* `'pharmacy'` (Apotek, Toko Obat, Alkes)

Preset dikontrol langsung via lisensi dari portal. Kasir tidak memilih preset secara manual. Frontend menyimpan preset di `localStorage` melalui Zustand persist agar tetap berjalan konsisten saat offline.

### 1.2. Update Types Lisensi
**File:** `frontend/src/features/license/types/index.ts`

```typescript
export type BusinessPresetType = "retail" | "confectionery" | "pharmacy";

export interface LicenseStatus {
    has_license: boolean;
    license_key: string | null;
    status: LicenseEffectiveStatus;
    subscription_type: SubscriptionType | null;
    business_type: BusinessPresetType; // <-- FIELD BARU DARI BACKEND
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
```

### 1.3. Update Zustand Store & Persistence Offline
**File:** `frontend/src/stores/license-store.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BusinessPresetType, LicenseStatus } from "@/features/license/types";

interface LicenseStoreState {
    licenseStatus: LicenseStatus | null;
    businessType: BusinessPresetType;
    isLoading: boolean;
    lastSyncedAt: string | null;

    // Actions
    setLicenseStatus: (status: LicenseStatus | null) => void;
    setLoading: (isLoading: boolean) => void;
    clearLicense: () => void;

    // Helper Selectors
    getBusinessType: () => BusinessPresetType;
    isRetail: () => boolean;
    isConfectionery: () => boolean;
    isPharmacy: () => boolean;
    hasAddon: (addonCode: string) => boolean;
    hasAllAddons: (addonCodes: string[]) => boolean;
    hasAnyAddon: (addonCodes: string[]) => boolean;
    canOperate: () => boolean;
    isOperable: () => boolean;
    getActiveAddons: () => string[];
}

export const useLicenseStore = create<LicenseStoreState>()(
    persist(
        (set, get) => ({
            licenseStatus: null,
            businessType: "retail",
            isLoading: false,
            lastSyncedAt: null,

            setLicenseStatus: (status) => {
                const normalizedStatus = status
                    ? {
                          ...status,
                          active_addons: Array.isArray(status.active_addons)
                              ? status.active_addons.map((a) => a.toLowerCase())
                              : [],
                      }
                    : null;

                const activeType = status?.business_type || get().businessType || "retail";

                set({
                    licenseStatus: normalizedStatus,
                    businessType: activeType,
                    lastSyncedAt: status?.last_synced_at ?? new Date().toISOString(),
                });
            },

            setLoading: (isLoading) => set({ isLoading }),

            clearLicense: () => set({ licenseStatus: null, lastSyncedAt: null, businessType: "retail" }),

            getBusinessType: () => get().businessType || "retail",
            isRetail: () => (get().businessType || "retail") === "retail",
            isConfectionery: () => get().businessType === "confectionery",
            isPharmacy: () => get().businessType === "pharmacy",

            hasAddon: (addonCode: string) => {
                const status = get().licenseStatus;
                if (!status) return false;
                const isOperable = Boolean(
                    status.can_operate && (status.status === "active" || status.is_grace_period)
                );
                if (!isOperable) return false;
                const addons = Array.isArray(status.active_addons)
                    ? status.active_addons.map((a) => a.toLowerCase())
                    : [];
                return addons.includes(addonCode.toLowerCase());
            },

            hasAllAddons: (addonCodes: string[]) => {
                const { hasAddon } = get();
                return addonCodes.every((code) => hasAddon(code));
            },

            hasAnyAddon: (addonCodes: string[]) => {
                const { hasAddon } = get();
                return addonCodes.some((code) => hasAddon(code));
            },

            canOperate: () => {
                const status = get().licenseStatus;
                return Boolean(status && status.can_operate);
            },

            isOperable: () => {
                const status = get().licenseStatus;
                if (!status) return false;
                return Boolean(status.can_operate && (status.status === "active" || status.is_grace_period));
            },

            getActiveAddons: () => {
                const status = get().licenseStatus;
                return Array.isArray(status?.active_addons) ? status.active_addons : [];
            },
        }),
        {
            name: "app_license_storage",
            partialize: (state) => ({
                businessType: state.businessType,
                licenseStatus: state.licenseStatus,
            }),
        }
    )
);
```

### 1.4. Hook `useAppPreset()`
**File Baru:** `frontend/src/features/license/hooks/use-app-preset.ts`

```typescript
import { useLicenseStore } from "@/stores/license-store";

export function useAppPreset() {
    const businessType = useLicenseStore((s) => s.businessType);
    const isRetail = businessType === "retail";
    const isConfectionery = businessType === "confectionery";
    const isPharmacy = businessType === "pharmacy";

    return {
        businessType,
        isRetail,
        isConfectionery,
        isPharmacy,
    };
}
```

### 1.5. Filter Sidebar Navigasi Berdasarkan Preset
**File:** `frontend/src/components/layout/sidebar-config.ts`

1. Perluas `NavItem`:
```typescript
import type { BusinessPresetType } from "@/features/license/types";

export interface NavItem {
    id?: string;
    label: string;
    path?: string;
    tab?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string | number;
    badgeVariant?: "emerald" | "amber" | "rose" | "blue" | "slate";
    permission?: PermissionChecker;
    addon?: string;
    businessPresets?: BusinessPresetType[]; // <-- Tentukan di preset mana menu ini muncul
    storeScope?: "central" | "branch";
    children?: NavItem[];
}
```

2. Tambahkan `businessPresets: ["confectionery"]` pada Menu Manufaktur:
```typescript
{
    label: "Manufaktur",
    icon: IconBuildingFactory2,
    addon: "production",
    businessPresets: ["confectionery"], // <-- HANYA TAMPIL DI PRESET KONVEKSI
    children: [
        { label: "Produksi Harian", path: ROUTES.ADMIN_PRODUCTION },
        { label: "Resep BOM Produk", path: ROUTES.ADMIN_PRODUCT_BOM },
        { label: "Tipe Komponen BOM", path: ROUTES.ADMIN_BOM_COMPONENT_TYPES },
    ],
},
```

3. Update `filterNavItems()`:
```typescript
export function filterNavItems(
    items: NavItem[],
    roles: string[],
    permissions: string[],
    activeAddons?: string[] | null,
    isCentral?: boolean,
    currentBusinessType: BusinessPresetType = "retail"
): NavItem[] {
    return items
        .map((item) => {
            // Filter Preset Bisnis
            if (item.businessPresets && item.businessPresets.length > 0) {
                if (!item.businessPresets.includes(currentBusinessType)) {
                    return null;
                }
            }

            // Check storeScope
            if (item.storeScope) {
                if (item.storeScope === "central" && !isCentral) return null;
                if (item.storeScope === "branch" && isCentral) return null;
            }

            // Check permission
            const isAllowed = item.permission ? item.permission(roles, permissions) : true;
            if (!isAllowed) return null;

            // Check addon
            if (item.addon) {
                const userAddons = Array.isArray(activeAddons)
                    ? activeAddons.map((a) => a.toLowerCase())
                    : [];
                if (!userAddons.includes(item.addon.toLowerCase())) {
                    return null;
                }
            }

            // Recursive children
            if (item.children && item.children.length > 0) {
                const filteredChildren = filterNavItems(
                    item.children,
                    roles,
                    permissions,
                    activeAddons,
                    isCentral,
                    currentBusinessType
                );
                if (filteredChildren.length === 0) return null;
                return { ...item, children: filteredChildren };
            }

            return item;
        })
        .filter(Boolean) as NavItem[];
}
```

4. Di `admin-sidebar.tsx`:
```tsx
const businessType = useLicenseStore((s) => s.businessType);

// saat memanggil filterNavItems:
const visibleItems = filterNavItems(
    section.items,
    userRoles,
    userPermissions,
    activeAddons,
    isCentralStore,
    businessType // <-- Masukkan businessType
);
```

---

# BAGIAN 2: PANDUAN PORTAL ADMIN FRONTEND (`portal-mitrasova`)

### 2.1. Konsep
Di portal admin lisensi, admin/operator Mitrasova harus dapat:
1. Memilih Jenis Bisnis (`retail`, `confectionery`, `pharmacy`) saat membuat lisensi baru untuk klien.
2. Mengubah Jenis Bisnis pada lisensi yang sudah ada via dialog Edit Lisensi.
3. Melihat badge jenis bisnis pada tabel daftar lisensi dan overview detail lisensi.
4. Memfilter daftar lisensi berdasarkan jenis bisnis (`?business_type=retail|confectionery|pharmacy`).

### 2.2. Update Types Lisensi di Portal
**File:** `src/features/licenses/@types/license.d.ts`

```typescript
export type BusinessType = "retail" | "confectionery" | "pharmacy";

export interface License {
  id: string
  client_id: string
  product_id: string
  nama_instance: string
  domain_instance: string
  license_key: string
  license_secret?: string
  subscription_type: LicenseSubscriptionType
  business_type?: BusinessType // <-- TAMBAHKAN INI
  server_package_id?: string | null
  server_notes?: string | null
  server_type?: LicenseServerType
  status: LicenseStatus
  expires_at: string | null
  grace_period_days: number
  last_heartbeat_at: string | null
  last_ip_address: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  // ...
}

export interface LicenseQueryParams extends PaginationParams {
  client_id?: string
  product_id?: string
  product_code?: string
  business_type?: BusinessType | "all" // <-- TAMBAHKAN INI UNTUK FILTER
  status?: LicenseStatus | "all"
  subscription_type?: LicenseSubscriptionType | "all"
  server_package_id?: string
  addon_code?: string
  expiring_days?: number
  expires_from?: string
  expires_to?: string
  created_from?: string
  created_to?: string
  search?: string
  sort_by?: "created_at" | "expires_at" | "nama_instance" | "status"
  sort_order?: "asc" | "desc"
}

export interface CreateLicensePayload {
  client_id: string
  product_id: string
  nama_instance: string
  domain_instance?: string | null
  subscription_type: LicenseSubscriptionType
  business_type?: BusinessType // <-- TAMBAHKAN INI (default: 'retail')
  server_package_id: string
  server_notes?: string | null
  server_type?: string
  status?: LicenseStatus
  expires_at?: string | null
  grace_period_days?: number
  addon_ids?: string[]
  create_invoice?: boolean
  billing_period?: "monthly" | "annual"
  discount_amount?: number | string | null
  discount_description?: string | null
  coupon_code?: string | null
  metadata?: Record<string, unknown>
}

export interface UpdateLicensePayload {
  product_id?: string
  nama_instance?: string
  domain_instance?: string | null
  subscription_type?: LicenseSubscriptionType
  business_type?: BusinessType // <-- TAMBAHKAN INI
  server_package_id?: string
  server_notes?: string | null
  server_type?: LicenseServerType
  status?: LicenseStatus
  expires_at?: string | null
  grace_period_days?: number
  metadata?: Record<string, unknown>
}
```

### 2.3. Update Schema Validasi Zod
**File:** `src/features/licenses/validations/license.schema.ts`

```typescript
export const createLicenseSchema = z.object({
  client_id: z.string().min(1, "Klien wajib dipilih"),
  product_id: z.string().min(1, "Produk wajib dipilih"),
  nama_instance: z.string().min(1, "Nama instance wajib diisi"),
  domain_instance: z.string().optional().nullable(),
  subscription_type: z.enum(["monthly", "annual", "lifetime", "yearly", "trial"]),
  business_type: z.enum(["retail", "confectionery", "pharmacy"]).default("retail"), // <-- TAMBAHKAN INI
  server_package_id: z.string().min(1, "Paket server wajib dipilih"),
  server_notes: z.string().optional().nullable(),
  status: z.enum(["active", "suspended", "expired", "trial"]).default("active"),
  expires_at: z.string().optional().nullable(),
  grace_period_days: z.coerce.number().min(0).default(7),
  addon_ids: z.array(z.string()).default([]),
  create_invoice: z.boolean().default(false),
  billing_period: z.enum(["monthly", "annual"]).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  discount_description: z.string().optional().nullable(),
  coupon_code: z.string().optional().nullable(),
})

export const updateLicenseSchema = z.object({
  nama_instance: z.string().min(1, "Nama instance wajib diisi").optional(),
  domain_instance: z.string().optional().nullable(),
  subscription_type: z.enum(["monthly", "annual", "lifetime", "yearly", "trial"]).optional(),
  business_type: z.enum(["retail", "confectionery", "pharmacy"]).optional(), // <-- TAMBAHKAN INI
  server_package_id: z.string().optional(),
  server_notes: z.string().optional().nullable(),
  status: z.enum(["active", "suspended", "expired", "trial"]).optional(),
  expires_at: z.string().optional().nullable(),
  grace_period_days: z.coerce.number().min(0).optional(),
})
```

### 2.4. Form Input di Wizard Create License
**File:** `src/features/licenses/components/license-create-software-card.tsx`

Tambahkan pilihan `business_type` di bawah `subscription_type`:

```tsx
<div className="space-y-2">
  <Label htmlFor="business_type">Jenis Bisnis / Preset Toko</Label>
  <Select
    value={form.watch("business_type") || "retail"}
    onValueChange={(val) => form.setValue("business_type", val as any)}
  >
    <SelectTrigger id="business_type">
      <SelectValue placeholder="Pilih Jenis Bisnis" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="retail">Retail (Minimarket, Toko Kelontong, Fashion)</SelectItem>
      <SelectItem value="confectionery">Konveksi / Manufaktur (Jahit, Sablon, Produksi BOM)</SelectItem>
      <SelectItem value="pharmacy">Apotek / Farmasi (Obat, Resep Dokter, FEFO Batch)</SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    Preset ini menentukan modul yang aktif pada aplikasi kasir klien (misal: modul Manufaktur otomatis aktif jika memilih Konveksi).
  </p>
</div>
```

### 2.5. Badge di Tabel Lisensi & Filter Dropdown
**File:** `src/features/licenses/components/license-columns.tsx`

Tambahkan kolom atau badge `business_type`:
```tsx
{
  accessorKey: "business_type",
  header: "Preset",
  cell: ({ row }) => {
    const type = row.original.business_type || "retail";
    const labels = {
      retail: { label: "Retail", variant: "outline" },
      confectionery: { label: "Konveksi", variant: "secondary" },
      pharmacy: { label: "Apotek", variant: "default" },
    };
    const current = labels[type] || labels.retail;
    return <Badge variant={current.variant as any}>{current.label}</Badge>;
  },
}
```

**File:** `src/features/licenses/components/licenses-view.tsx`
Tambahkan filter preset:
```tsx
<Select
  value={filters.business_type || "all"}
  onValueChange={(val) => setFilters({ ...filters, business_type: val === "all" ? undefined : val })}
>
  <SelectTrigger className="w-[160px]">
    <SelectValue placeholder="Semua Preset" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Semua Preset</SelectItem>
    <SelectItem value="retail">Retail</SelectItem>
    <SelectItem value="confectionery">Konveksi</SelectItem>
    <SelectItem value="pharmacy">Apotek</SelectItem>
  </SelectContent>
</Select>
```

### 2.6. Dialog Edit Lisensi & Overview Detail
* **`license-form-dialog.tsx`**: Tambahkan field dropdown `business_type` agar admin bisa mengubah preset jika ada permintaan upgrade/migrasi toko dari klien.
* **`license-detail-overview-card.tsx`**: Tampilkan baris "Jenis Bisnis / Preset" dengan badge yang sesuai.

---

## 3. Checklist Verifikasi Akhir
1. [x] **Backend Portal**: Migration & API support `business_type` (Telah dideploy ke VPS `43.173.15.154`).
2. [x] **Backend POS Client**: Migration & HMAC verification support `business_type` (Telah dideploy ke VPS `43.173.15.154`).
3. [x] **Web Server Nginx**: Gateway di-restart dan seluruh rute aktif.
4. [ ] **Frontend Portal**: Implementasi form input, kolom tabel, dan filter `business_type`.
5. [ ] **Frontend POS**: Implementasi Zustand persist, hook `useAppPreset()`, dan filter menu navigasi sidebar.
