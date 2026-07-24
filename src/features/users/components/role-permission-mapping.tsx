import { AppButton } from "@/components/shared/app-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    IconAlertCircle,
    IconBox,
    IconBuildingStore,
    IconCoin,
    IconDeviceLaptop,
    IconFileText,
    IconKey,
    IconLock,
    IconPackage,
    IconSearch,
    IconSettings,
    IconShield,
    IconShoppingCart,
    IconUserCheck,
    IconUsers
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import {
    useAssignPermissionToRole,
    usePermissionsList,
    useRevokePermissionFromRole,
    useRolesList,
} from "../api/roles-permissions-api";
import { Permission } from "../types";
import { RolePermissionCategory } from "./role-permission-category";
import { PermissionCategoryType } from "./role-permission-types";

const ROLE_METADATA: Record<string, { label: string; desc: string }> = {
    admin: {
        label: "Administrator",
        desc: "Akses penuh ke semua fitur, modul, dan pengaturan sistem.",
    },
    manajer_toko: {
        label: "Manajer Toko",
        desc: "Mengelola stok barang, meninjau laporan penjualan, dan supervisi toko.",
    },
    supervisor: {
        label: "Supervisor",
        desc: "Memantau kasir, melakukan stock opname, dan penyesuaian inventori.",
    },
    kasir: {
        label: "Kasir / Staff",
        desc: "Fokus pada layar transaksi penjualan (POS) dan pembukaan shift kasir.",
    },
};

const PERMISSION_METADATA: Record<string, { label: string; desc: string }> = {
    manage_users: {
        label: "Kelola Karyawan",
        desc: "Mengatur user kasir/supervisor, hak akses role, serta menonaktifkan akun karyawan.",
    },
    view_users: {
        label: "Lihat Karyawan",
        desc: "Melihat daftar karyawan dan informasi perannya tanpa hak untuk melakukan modifikasi.",
    },
    manage_products: {
        label: "Kelola Master Produk",
        desc: "Menambah, mengubah, dan menghapus data barang, kategori, serta harga jual.",
    },
    view_products: {
        label: "Lihat Master Produk",
        desc: "Melihat katalog produk, harga jual, barcode, dan data pendukung tanpa hak mengubah.",
    },
    manage_sales: {
        label: "Kelola Transaksi Penjualan",
        desc: "Melihat, merevisi, atau mengelola transaksi penjualan dan pesanan yang sudah tercatat.",
    },
    view_reports: {
        label: "Lihat Laporan Penjualan & Keuangan",
        desc: "Mengakses dashboard statistik, ringkasan shift, dan riwayat laporan penjualan/keuangan.",
    },
    create_sales: {
        label: "Melakukan Penjualan (POS)",
        desc: "Menggunakan layar kasir checkout, memproses pembayaran, dan membuka cash drawer.",
    },
    view_sales: {
        label: "Lihat Transaksi Penjualan",
        desc: "Melihat riwayat dan detail transaksi penjualan tanpa hak mengubah atau membatalkan.",
    },
    void_sales: {
        label: "Void / Pembatalan Transaksi",
        desc: "Melakukan void atau pembatalan transaksi penjualan di kasir / riwayat transaksi.",
    },
    manage_inventory: {
        label: "Kelola Stok & Inventori",
        desc: "Melakukan stock opname fisik, penerimaan barang masuk, serta penyesuaian stok.",
    },
    view_inventory: {
        label: "Lihat Stok & Inventori",
        desc: "Memantau sisa stok barang, daftar produk, dan mutasi inventori tanpa hak mengubah.",
    },
    manage_suppliers: {
        label: "Kelola Supplier",
        desc: "Menambah, mengedit, dan menghapus master data supplier/pemasok barang.",
    },
    view_suppliers: {
        label: "Lihat Supplier",
        desc: "Melihat daftar supplier dan informasi kontak distributor tanpa hak mengubah.",
    },
    manage_members: {
        label: "Kelola Member",
        desc: "Menambah, mengedit, dan menghapus master data member loyalitas pelanggan.",
    },
    view_members: {
        label: "Lihat Member",
        desc: "Melihat daftar member dan poin loyalitas pelanggan tanpa hak mengubah.",
    },
    view_audit_logs: {
        label: "Lihat Audit Logs",
        desc: "Mengakses catatan riwayat log aktivitas sistem dan audit keamanan.",
    },
    operate_cash_drawer: {
        label: "Operasikan Cash Drawer",
        desc: "Membuka laci kas, mencatat saldo awal/akhir shift, kas masuk dan kas keluar.",
    },
    manage_cash_drawer: {
        label: "Kelola Cash Drawer",
        desc: "Mengatur limit kas laci, melakukan audit cash drawer, dan meriset sesi kasir.",
    },
    view_cash_drawer: {
        label: "Lihat Laporan Cash Drawer",
        desc: "Melihat laporan aktivitas, riwayat buka/tutup, dan selisih saldo cash drawer.",
    },
    view_purchase: {
        label: "Lihat Pembelian (PO)",
        desc: "Melihat riwayat pemesanan barang, penerimaan, retur, dan pembayaran ke supplier.",
    },
    manage_purchase: {
        label: "Kelola Pembelian (PO)",
        desc: "Membuat, merevisi, dan memproses transaksi pembelian (PO), penerimaan barang, dan pembayaran.",
    },
    manage_cash_accounts: {
        label: "Kelola Kas & Bank",
        desc: "Melakukan transfer antar kas, penyesuaian debit manual, dan kredit manual saldo kas.",
    },
    manage_expenses: {
        label: "Kelola Pengeluaran",
        desc: "Menambah, mengedit, dan menghapus pengeluaran operasional toko.",
    },
    view_expenses: {
        label: "Lihat Pengeluaran",
        desc: "Melihat riwayat dan rincian pengeluaran operasional toko tanpa hak mengubah.",
    },
    manage_chart_of_accounts: {
        label: "Kelola Chart of Accounts (COA)",
        desc: "Menambah, mengedit, dan mengatur bagan akun perkiraan (COA) akuntansi.",
    },
    view_chart_of_accounts: {
        label: "Lihat Chart of Accounts (COA)",
        desc: "Melihat daftar bagan akun perkiraan (COA) akuntansi dan saldo akun.",
    },
    manage_settings: {
        label: "Kelola Pengaturan Toko & Sistem",
        desc: "Mengatur identitas toko, PPN, sistem poin member, kas default, dan printer.",
    },
    manage_stores: {
        label: "Kelola Cabang & Toko",
        desc: "Menambah, mengedit, dan mengatur profil serta konfigurasi cabang toko.",
    },
    view_stores: {
        label: "Lihat Cabang & Toko",
        desc: "Melihat daftar cabang toko dan informasi operasional cabang.",
    },
    manage_manual_journals: {
        label: "Kelola Jurnal Manual",
        desc: "Membuat dan memposting ayat jurnal umum manual pada sistem akuntansi.",
    },
    view_manual_journals: {
        label: "Lihat Jurnal Manual",
        desc: "Melihat riwayat dan rincian entri jurnal manual akuntansi.",
    },
    manage_stock_transfers: {
        label: "Kelola Transfer Stok",
        desc: "Membuat dan memproses pengiriman/pemindahan stok antar cabang atau gudang.",
    },
    view_stock_transfers: {
        label: "Lihat Transfer Stok",
        desc: "Melihat riwayat dan status pemindahan stok barang antar cabang toko/gudang.",
    },
};

const ROLE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    admin: IconShield,
    manajer_toko: IconBuildingStore,
    supervisor: IconUserCheck,
    kasir: IconDeviceLaptop,
};

// Define Permission Categories for grouped view
interface StaticPermissionCategory {
    id: string;
    label: string;
    desc: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    colorClass: string;
    permissions: string[];
}

const PERMISSION_CATEGORIES: StaticPermissionCategory[] = [
    {
        id: "users",
        label: "Manajemen Pengguna & Cabang",
        desc: "Mengatur data karyawan, member loyalitas pelanggan, cabang toko, serta hak akses role.",
        icon: IconUsers,
        colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/20",
        permissions: ["manage_users", "view_users", "manage_members", "view_members", "manage_stores", "view_stores"],
    },
    {
        id: "products",
        label: "Master Produk & Katalog",
        desc: "Menambah, mengubah, dan menghapus data barang, kategori, merek, serta harga jual.",
        icon: IconPackage,
        colorClass: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/20",
        permissions: ["manage_products", "view_products"],
    },
    {
        id: "sales",
        label: "Transaksi & POS Harian",
        desc: "Layar kasir checkout POS, pembayaran, void/batal transaksi, dan riwayat penjualan.",
        icon: IconShoppingCart,
        colorClass: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/20",
        permissions: ["create_sales", "view_sales", "manage_sales", "void_sales"],
    },
    {
        id: "purchase",
        label: "Pembelian & Pemasok (Supplier)",
        desc: "Pemesanan barang (PO), penerimaan barang, pembayaran supplier, retur, dan data distributor.",
        icon: IconFileText,
        colorClass: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20",
        permissions: ["view_purchase", "manage_purchase", "manage_suppliers", "view_suppliers"],
    },
    {
        id: "inventory",
        label: "Stok & Mutasi Inventori",
        desc: "Stock opname fisik, penyesuaian stok, kartu stok, serta transfer stok antar cabang.",
        icon: IconBox,
        colorClass: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20",
        permissions: ["manage_inventory", "view_inventory", "manage_stock_transfers", "view_stock_transfers"],
    },
    {
        id: "cash_drawer",
        label: "Laci Kas, Rekening & Pengeluaran",
        desc: "Operasional shift kasir, saldo awal/akhir laci, kas masuk/keluar, transfer kas, dan pencatatan pengeluaran toko.",
        icon: IconCoin,
        colorClass: "text-teal-600 bg-teal-50 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/20",
        permissions: ["operate_cash_drawer", "manage_cash_drawer", "view_cash_drawer", "manage_cash_accounts", "manage_expenses", "view_expenses"],
    },
    {
        id: "accounting",
        label: "Akuntansi, COA & Jurnal Manual",
        desc: "Bagan akun perkiraan (Chart of Accounts), pembuatan entri jurnal manual, neraca, dan buku besar.",
        icon: IconBuildingStore,
        colorClass: "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/20",
        permissions: ["manage_chart_of_accounts", "view_chart_of_accounts", "manage_manual_journals", "view_manual_journals"],
    },
    {
        id: "reports_settings",
        label: "Pengaturan, Laporan & Audit",
        desc: "Pengaturan toko & printer, dashboard laporan statistik, serta log riwayat audit aktivitas.",
        icon: IconSettings,
        colorClass: "text-violet-600 bg-violet-50 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/20",
        permissions: ["manage_settings", "view_reports", "view_audit_logs"],
    },
];

export function RolePermissionMapping() {
    const { data: roles, isLoading: rolesLoading, isError: rolesError } = useRolesList();
    const { data: permissions, isLoading: permissionsLoading, isError: permissionsError } = usePermissionsList();

    const assignMutation = useAssignPermissionToRole();
    const revokeMutation = useRevokePermissionFromRole();

    const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [bulkLoadingCategories, setBulkLoadingCategories] = useState<Record<string, boolean>>({});

    // Derive activeRoleName: use selectedRoleName if valuid, otherwise default to first role name
    const activeRoleName = (roles && roles.some((r) => r.name === selectedRoleName))
        ? selectedRoleName
        : (roles && roles.length > 0 ? roles[0].name : null);

    const isLoading = rolesLoading || permissionsLoading;
    const isError = rolesError || permissionsError;

    const selectedRole = roles?.find((r) => r.name === activeRoleName);

    const handleToggle = async (permissionName: string, isAssigned: boolean) => {
        if (!activeRoleName) return;

        // Optimistic-like local loading per toggle
        setPendingToggles((prev) => ({ ...prev, [permissionName]: true }));

        const label = PERMISSION_METADATA[permissionName]?.label || permissionName;

        if (isAssigned) {
            revokeMutation.mutate(
                { role: activeRoleName, permission: permissionName },
                {
                    onSuccess: () => {
                        toast.success(`Akses '${label}' berhasil dicabut dari ${ROLE_METADATA[activeRoleName]?.label || activeRoleName}.`);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal mencabut hak akses.");
                    },
                    onSettled: () => {
                        setPendingToggles((prev) => ({ ...prev, [permissionName]: false }));
                    },
                }
            );
        } else {
            assignMutation.mutate(
                { role: activeRoleName, permission: permissionName },
                {
                    onSuccess: () => {
                        toast.success(`Akses '${label}' berhasil diberikan ke ${ROLE_METADATA[activeRoleName]?.label || activeRoleName}.`);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memberikan hak akses.");
                    },
                    onSettled: () => {
                        setPendingToggles((prev) => ({ ...prev, [permissionName]: false }));
                    },
                }
            );
        }
    };

    // Bulk assign/revoke for a specific category
    const handleBulkAction = async (
        catId: string,
        permissionsInCat: Permission[],
        action: "assign" | "revoke"
    ) => {
        if (!activeRoleName) return;

        setBulkLoadingCategories((prev) => ({ ...prev, [catId]: true }));
        const actionLabel = action === "assign" ? "diberikan" : "dicabut";

        try {
            const targets = permissionsInCat.filter((perm) => {
                const isAssigned = selectedRole?.permissions.some((p) => p.name === perm.name) || false;
                return action === "assign" ? !isAssigned : isAssigned;
            });

            if (targets.length === 0) {
                toast.info(`Semua hak akses kategori ini sudah dalam kondisi ${actionLabel}.`);
                return;
            }

            // Perform updates concurrently
            await Promise.all(
                targets.map((perm) => {
                    const params = { role: activeRoleName, permission: perm.name };
                    return action === "assign"
                        ? assignMutation.mutateAsync(params)
                        : revokeMutation.mutateAsync(params);
                })
            );

            toast.success(`Berhasil memperbarui ${targets.length} hak akses pada kategori ini.`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Gagal melakukan pembaruan massal.";
            toast.error(message);
        } finally {
            setBulkLoadingCategories((prev) => ({ ...prev, [catId]: false }));
        }
    };

    // Expand & Collapse Helpers
    const handleExpandAll = (categoriesList: PermissionCategoryType[]) => {
        const expanded: Record<string, boolean> = {};
        categoriesList.forEach((cat) => {
            expanded[cat.id] = true;
        });
        setExpandedCategories(expanded);
    };

    const handleCollapseAll = (categoriesList: PermissionCategoryType[]) => {
        const expanded: Record<string, boolean> = {};
        categoriesList.forEach((cat) => {
            expanded[cat.id] = false;
        });
        setExpandedCategories(expanded);
    };

    const isCategoryExpanded = (catId: string) => {
        return expandedCategories[catId] !== false; // expanded by default
    };

    const toggleCategory = (catId: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [catId]: prev[catId] === false ? true : false,
        }));
    };

    // Build categories structure from fetched permissions
    const mappedPermissionNames = new Set(PERMISSION_CATEGORIES.flatMap((c) => c.permissions));
    const unmappedPermissions = permissions?.filter((p) => !mappedPermissionNames.has(p.name)) || [];

    const categoriesWithPermissions: PermissionCategoryType[] = [
        ...PERMISSION_CATEGORIES.map((cat) => ({
            ...cat,
            items: permissions?.filter((p) => cat.permissions.includes(p.name)) || [],
        })),
    ];

    if (unmappedPermissions.length > 0) {
        categoriesWithPermissions.push({
            id: "other",
            label: "Hak Akses Lainnya",
            desc: "Hak akses sistem tambahan atau kustom yang terdaftar.",
            icon: IconSettings,
            colorClass: "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/30",
            permissions: unmappedPermissions.map((p) => p.name),
            items: unmappedPermissions,
        });
    }

    // Filter categories and permissions inside them based on the search query
    const filteredCategories = categoriesWithPermissions
        .map((cat) => {
            const filteredItems = cat.items.filter((p) => {
                const meta = PERMISSION_METADATA[p.name];
                const friendlyLabel = meta?.label || p.name;
                const description = meta?.desc || "";
                const query = searchQuery.toLowerCase();

                return (
                    friendlyLabel.toLowerCase().includes(query) ||
                    p.name.toLowerCase().includes(query) ||
                    description.toLowerCase().includes(query)
                );
            });

            return {
                ...cat,
                items: filteredItems,
            };
        })
        .filter((cat) => cat.items.length > 0);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                <IconLock size={40} className="mx-auto text-rose-400 mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Gagal Memuat Data</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                    Silakan periksa koneksi internet Anda atau hubungi administrator sistem.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Roles Cards Sidebar */}
            <div className="lg:col-span-4 space-y-3.5">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Pilih Peran Pengguna
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                        {roles?.length || 0} Peran Tersedia
                    </span>
                </div>
                <div className="space-y-3">
                    {roles?.map((role) => {
                        const meta = ROLE_METADATA[role.name] || {
                            label: role.name.replace("_", " "),
                            desc: "Hak akses yang ditentukan oleh sistem.",
                        };
                        const Icon = ROLE_ICONS[role.name] || IconUserCheck;
                        const isSelected = activeRoleName === role.name;
                        const count = role.permissions.length;

                        return (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => setSelectedRoleName(role.name)}
                                className={cn(
                                    "w-full text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer block relative overflow-hidden group outline-none",
                                    isSelected
                                        ? "bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-2 border-emerald-500 shadow-md ring-4 ring-emerald-500/10"
                                        : "bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-slate-300 shadow-xs"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-2xl" />
                                )}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                isSelected
                                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/60"
                                            )}
                                        >
                                            <Icon size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 capitalize truncate">
                                                {meta.label}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                                guard: {role.guard_name}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={cn(
                                            "text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 leading-none whitespace-nowrap",
                                            isSelected
                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                                                : "bg-slate-100 text-slate-600 border border-slate-200/60"
                                        )}
                                    >
                                        {count} Akses
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed font-normal">
                                    {meta.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Permissions Toggle Panel */}
            <div className="lg:col-span-8">
                <Card className="border-slate-200/80 rounded-2xl shadow-sm bg-white overflow-hidden py-0">
                    <CardHeader className="border-b border-slate-100 p-6 bg-slate-50/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
                                        <IconKey size={18} />
                                    </div>
                                    <span>
                                        Konfigurasi Hak Akses:{" "}
                                        <span className="text-emerald-600 capitalize">
                                            {ROLE_METADATA[activeRoleName || ""]?.label || activeRoleName}
                                        </span>
                                    </span>
                                </CardTitle>
                                <CardDescription className="text-[11px] text-slate-400 mt-1 pl-10">
                                    Aktifkan atau matikan hak akses spesifik di bawah ini. Perubahan akan langsung disimpan secara otomatis.
                                </CardDescription>
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full sm:w-64 shrink-0">
                                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                                    <IconSearch size={14} />
                                </span>
                                <Input
                                    type="text"
                                    placeholder="Cari hak akses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 pl-9 text-[11px] border-slate-200 focus-visible:ring-emerald-600 rounded-xl bg-white shadow-xs"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    {/* Expand / Collapse All Controls */}
                    <div className="flex justify-between items-center px-6 py-3 bg-slate-50/70 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Daftar Kategori Modul
                        </span>
                        <div className="flex items-center gap-2">
                            <AppButton
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleExpandAll(categoriesWithPermissions)}
                                className="text-[10px] font-bold text-slate-600 hover:text-emerald-600 hover:bg-white flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs h-auto"
                            >
                                Buka Semua
                            </AppButton>
                            <AppButton
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleCollapseAll(categoriesWithPermissions)}
                                className="text-[10px] font-bold text-slate-600 hover:text-emerald-600 hover:bg-white flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs h-auto"
                            >
                                Tutup Semua
                            </AppButton>
                        </div>
                    </div>

                    <CardContent className="p-0 divide-y divide-slate-100">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => {
                                const isExpanded = searchQuery.trim() !== "" || isCategoryExpanded(cat.id);
                                const isBulkLoading = bulkLoadingCategories[cat.id];

                                return (
                                    <RolePermissionCategory
                                        key={cat.id}
                                        category={cat}
                                        selectedRole={selectedRole}
                                        searchQuery={searchQuery}
                                        isExpanded={isExpanded}
                                        isBulkLoading={isBulkLoading}
                                        pendingToggles={pendingToggles}
                                        isMutating={assignMutation.isPending || revokeMutation.isPending}
                                        permissionMetadata={PERMISSION_METADATA}
                                        onToggleCategory={() => toggleCategory(cat.id)}
                                        onTogglePermission={handleToggle}
                                        onBulkAction={(action) => handleBulkAction(cat.id, cat.items, action)}
                                    />
                                );
                            })
                        ) : (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                                <IconAlertCircle size={28} className="text-slate-300" />
                                <p className="text-[11px]">Tidak ada hak akses ditemukan untuk pencarian &ldquo;{searchQuery}&rdquo;.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
