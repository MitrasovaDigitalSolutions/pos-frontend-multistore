"use client";

import { useState } from "react";
import { IconLayoutDashboard, IconLogout, IconShield } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useAppRouter } from "@/hooks/use-app-router";
import { signOut } from "@/lib/auth-helpers";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLicenseStatusQuery } from "../api/license-api";

interface LicenseTopNavProps {
    showBackToDashboard?: boolean;
}

export function LicenseTopNav({ showBackToDashboard }: LicenseTopNavProps) {
    const { data: session } = useSession();
    const router = useAppRouter();
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const { data: licenseStatus } = useLicenseStatusQuery();
    const isOperable = Boolean(
        licenseStatus?.can_operate &&
        (licenseStatus?.status === "active" || licenseStatus?.is_grace_period)
    );

    const canGoToDashboard = showBackToDashboard !== undefined ? showBackToDashboard : isOperable;

    const userName = session?.user?.name ?? session?.user?.email ?? "Admin";

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xs">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-13 flex items-center justify-between gap-4">
                    {/* Left: Logo + Brand */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-2xs">
                            <IconShield size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-800 leading-tight tracking-tight">
                                Mitrasova POS
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold leading-tight">
                                Kelola Langganan
                            </p>
                        </div>
                    </div>

                    {/* Right: User info + actions */}
                    <div className="flex items-center gap-2">
                        {/* User name chip */}
                        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 rounded-lg px-2.5 py-1">
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <span className="text-[8px] font-bold uppercase">
                                    {userName.charAt(0)}
                                </span>
                            </div>
                            <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                                {userName}
                            </span>
                        </div>

                        {/* Back to Dashboard — only renders when license is active and valid */}
                        {canGoToDashboard && (
                            <button
                                type="button"
                                onClick={() => router.push("/admin")}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200/80 border border-slate-200/80 text-slate-700 hover:text-slate-900 transition-colors duration-150 cursor-pointer text-xs font-bold"
                            >
                                <IconLayoutDashboard size={13} />
                                <span>Dashboard Admin</span>
                            </button>
                        )}

                        {/* Logout with Confirmation Warning */}
                        <button
                            type="button"
                            onClick={() => setIsLogoutConfirmOpen(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 active:bg-rose-200/80 border border-rose-200/70 text-rose-600 hover:text-rose-700 transition-colors duration-150 cursor-pointer text-xs font-bold"
                        >
                            <IconLogout size={13} />
                            <span className="hidden sm:inline">Keluar</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Warning Modal */}
            <ConfirmDialog
                open={isLogoutConfirmOpen}
                onOpenChange={setIsLogoutConfirmOpen}
                title="Keluar dari Akun"
                description="Apakah Anda yakin ingin keluar dari sistem Mitrasova POS?"
                confirmText="Ya, Keluar"
                cancelText="Batal"
                variant="danger"
                isLoading={isLoggingOut}
                onConfirm={async () => {
                    setIsLoggingOut(true);
                    await signOut({ callbackUrl: "/login" });
                }}
            />
        </>
    );
}
