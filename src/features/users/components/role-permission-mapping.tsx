"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    IconShield,
    IconBuildingStore,
    IconUserCheck,
    IconDeviceLaptop,
    IconKey,
    IconSearch,
    IconLock,
    IconLoader,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
    useRolesList,
    usePermissionsList,
    useAssignPermissionToRole,
    useRevokePermissionFromRole,
} from "../api/roles-permissions-api";

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
        label: "Kelola Pengguna",
        desc: "Mengatur user kasir/supervisor, hak akses role, serta menonaktifkan akun karyawan.",
    },
    view_users: {
        label: "Lihat Pengguna",
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
        desc: "Melihat, merevisi, atau membatalkan transaksi penjualan dan pesanan yang sudah tercatat.",
    },
    view_reports: {
        label: "Lihat Laporan Penjualan",
        desc: "Mengakses dashboard statistik, ringkasan shift, dan riwayat laporan penjualan harian.",
    },
    create_sales: {
        label: "Melakukan Penjualan (POS)",
        desc: "Menggunakan layar kasir checkout, memproses pembayaran, dan membuka cash drawer.",
    },
    view_sales: {
        label: "Lihat Transaksi Penjualan",
        desc: "Melihat riwayat dan detail transaksi penjualan tanpa hak mengubah atau membatalkan.",
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
};

const ROLE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    admin: IconShield,
    manajer_toko: IconBuildingStore,
    supervisor: IconUserCheck,
    kasir: IconDeviceLaptop,
};

export function RolePermissionMapping() {
    const { data: roles, isLoading: rolesLoading, isError: rolesError } = useRolesList();
    const { data: permissions, isLoading: permissionsLoading, isError: permissionsError } = usePermissionsList();

    const assignMutation = useAssignPermissionToRole();
    const revokeMutation = useRevokePermissionFromRole();

    const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});

    // Derive activeRoleName: use selectedRoleName if valid, otherwise default to first role name
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

    // Filter permissions by search query
    const filteredPermissions = permissions?.filter((p) => {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left Column: Roles Cards */}
            <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    Pilih Peran Pengguna
                </span>
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
                                onClick={() => setSelectedRoleName(role.name)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${isSelected
                                    ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                                    : "bg-white hover:bg-slate-50/50 border-slate-100 shadow-sm"
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex gap-3 items-center">
                                        <div
                                            className={`p-2.5 rounded-xl ${isSelected
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-slate-50 text-slate-500"
                                                }`}
                                        >
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-extrabold text-slate-900 capitalize">
                                                {meta.label}
                                            </h4>
                                            <span className="text-[9px] text-slate-400 font-mono">
                                                guard: {role.guard_name}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isSelected
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {count} Akses
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3.5 leading-relaxed">
                                    {meta.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Permissions Toggle Panel */}
            <div className="md:col-span-2">
                <Card className="border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden py-0">
                    <CardHeader className="border-b border-slate-50 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <IconKey size={18} className="text-emerald-500" />
                                    <span>
                                        Konfigurasi Hak Akses:{" "}
                                        <span className="text-emerald-600 capitalize">
                                             {ROLE_METADATA[activeRoleName || ""]?.label || activeRoleName}
                                        </span>
                                    </span>
                                </CardTitle>
                                <CardDescription className="text-[11px] text-slate-400 mt-0.5">
                                    Aktifkan atau matikan hak akses spesifik di bawah ini. Perubahan akan langsung disimpan.
                                </CardDescription>
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full md:w-64">
                                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                                    <IconSearch size={14} />
                                </span>
                                <Input
                                    type="text"
                                    placeholder="Cari hak akses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8.5 pl-9 text-[11px] border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredPermissions && filteredPermissions.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {filteredPermissions.map((perm) => {
                                    const meta = PERMISSION_METADATA[perm.name] || {
                                        label: perm.name.replace("_", " "),
                                        desc: "Hak akses sistem tambahan.",
                                    };
                                    const isAssigned = selectedRole?.permissions.some(
                                        (p) => p.name === perm.name
                                    ) || false;
                                    const isPending = pendingToggles[perm.name];

                                    return (
                                        <div
                                            key={perm.id}
                                            className={`flex items-center justify-between p-5 transition-colors ${isAssigned ? "bg-slate-50/20" : "bg-transparent"
                                                }`}
                                        >
                                            <div className="flex gap-4 items-start pr-4">
                                                <div
                                                    className={`p-2 rounded-lg mt-0.5 ${isAssigned
                                                        ? "bg-emerald/10 text-emerald"
                                                        : "bg-slate-50 text-slate-400"
                                                        }`}
                                                >
                                                    <IconKey size={16} />
                                                </div>
                                                <div>
                                                    <h5 className="text-xs font-extrabold text-slate-900">
                                                        {meta.label}
                                                    </h5>
                                                    <span className="text-[9px] text-slate-400 font-mono">
                                                        Sistem ID: {perm.name}
                                                    </span>
                                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-xl">
                                                        {meta.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {isPending && (
                                                    <IconLoader
                                                        size={14}
                                                        className="text-emerald-500 animate-spin"
                                                    />
                                                )}
                                                <Switch
                                                    checked={isAssigned}
                                                    onCheckedChange={() => handleToggle(perm.name, isAssigned)}
                                                    disabled={
                                                        isPending ||
                                                        assignMutation.isPending ||
                                                        revokeMutation.isPending
                                                    }
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-400">
                                <p className="text-[11px]">Tidak ada hak akses ditemukan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
