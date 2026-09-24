"use client";

import * as React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useAppRouter } from "@/hooks/use-app-router";
import { toast } from "sonner";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { LoginCard } from "./login-card";
import { LoginStoreDialog } from "./login-store-dialog";
import type { LoginInput } from "../schemas/login-schema";
import { AUTH_APP_NAME, AUTH_APP_VERSION } from "../constants/auth-constants";
import { LicenseGateDialog } from "@/features/license/components/license-gate-dialog";
import type { LicenseStatus } from "@/features/license/types";
import type { Store } from "@/types/auth";
import { ENDPOINTS } from "@/shared/api/endpoints";

/** Fetch license status directly (not via React Query) to avoid mounting query context issues. */
async function fetchLicenseStatus(accessToken: string): Promise<LicenseStatus | null> {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
    const syncEndpoint = `/api${ENDPOINTS.LICENSE.SYNC}`;
    const statusEndpoint = `/api${ENDPOINTS.LICENSE.STATUS}`;

    const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
    };

    // 1. Always hit sync endpoint first before hitting status
    try {
        const syncController = new AbortController();
        const syncTimeoutId = setTimeout(() => syncController.abort(), 6000);
        await fetch(`${apiBase}${syncEndpoint}`, {
            method: "POST",
            headers,
            signal: syncController.signal,
        });
        clearTimeout(syncTimeoutId);
    } catch (err) {
        console.warn("Auto-sync prior to license status failed:", err);
    }

    // 2. Fetch latest status
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
    try {
        const res = await fetch(`${apiBase}${statusEndpoint}`, {
            headers,
            signal: controller.signal,
        });
        if (!res.ok) return null;
        const body = await res.json() as { data?: LicenseStatus };
        return body.data ?? null;
    } catch {
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
}

export function LoginForm() {
    const router = useAppRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const setActiveStore = useActiveStoreStore((s) => s.setActiveStore);
    const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
    const [dialogStores, setDialogStores] = useState<Store[]>([]);

    // ─── License Gate State ───────────────────────────────────────────────────
    const [licenseGateOpen, setLicenseGateOpen] = useState(false);
    const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
    const isCheckingLicenseRef = useRef(false);
    const isSubmittingRef = useRef(false);
    const pendingTokenRef = useRef("");
    const pendingRolesRef = useRef<string[]>([]);

    /**
     * Check license and either proceed to redirect or show the blocking gate dialog.
     * Grace period (can_operate = true) is allowed through — only hard-blocked statuses
     * (expired, suspended, not_activated) and network errors show the gate.
     */
    const checkLicenseAndRedirect = useCallback(async (targetPath: string, accessToken: string) => {
        if (isCheckingLicenseRef.current) return;
        isCheckingLicenseRef.current = true;

        try {
            const ls = await fetchLicenseStatus(accessToken);

            // Fail-closed: if null (network error/timeout) block with gate dialog
            if (!ls || !ls.can_operate) {
                isCheckingLicenseRef.current = false;
                isSubmittingRef.current = false;
                setLicenseStatus(ls);
                setLicenseGateOpen(true);
                return;
            }

            // License OK (active or grace_period) — proceed to target
            router.push(targetPath);
        } catch {
            isCheckingLicenseRef.current = false;
            isSubmittingRef.current = false;
            setLicenseStatus(null);
            setLicenseGateOpen(true);
        }
    }, [router]);

    // Handle already-authenticated users visiting /login directly
    useEffect(() => {
        if (
            status === "authenticated" &&
            session?.user &&
            !isSubmittingRef.current &&
            !licenseGateOpen &&
            !isStoreDialogOpen
        ) {
            const userRoles = session.user.roles ?? [];
            const targetPath = (
                userRoles.includes("admin") ||
                userRoles.includes("manajer_toko") ||
                userRoles.includes("supervisor")
            ) ? "/admin" : "/checkout";

            router.replace(targetPath);
        }
    }, [status, session, router, licenseGateOpen, isStoreDialogOpen]);

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        isSubmittingRef.current = true;

        try {
            const res = await signIn("credentials", {
                username: data.username,
                password: data.password,
                redirect: false,
            });

            if (res?.error) {
                isSubmittingRef.current = false;
                const errorMessage = res.error === "CredentialsSignin"
                    ? "Username atau password salah. Silakan coba lagi."
                    : res.error === "Configuration"
                        ? "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
                        : res.error;
                toast.error(errorMessage);
                return;
            }

            toast.success("Login berhasil! Selamat bekerja.");

            // Fetch the freshly authenticated session
            let freshSession = await getSession();
            if (!freshSession?.user) {
                await new Promise((resolve) => setTimeout(resolve, 150));
                freshSession = await getSession();
            }

            const currentUser = freshSession?.user ?? session?.user;
            const stores = currentUser?.stores ?? [];
            const userRoles = currentUser?.roles ?? [];
            const token = freshSession?.accessToken ?? session?.accessToken ?? "";

            pendingTokenRef.current = token;
            pendingRolesRef.current = userRoles;

            if (stores.length === 0) {
                isSubmittingRef.current = false;
                toast.error("Akun Anda tidak memiliki akses ke toko manapun. Hubungi Admin.");
                return;
            }

            const targetPath = (
                userRoles.includes("admin") ||
                userRoles.includes("manajer_toko") ||
                userRoles.includes("supervisor")
            ) ? "/admin" : "/checkout";

            if (stores.length === 1) {
                const soleStore = stores[0];
                setActiveStore(soleStore.uid);
                toast.info(`Masuk sebagai Karyawan di ${soleStore.nama}`);
                await checkLicenseAndRedirect(targetPath, token);
                return;
            }

            // User has multiple stores — prompt store selection dialog
            setDialogStores(stores);
            setIsStoreDialogOpen(true);
        } catch {
            isSubmittingRef.current = false;
            toast.error("Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const onConfirmStore = (data: { storeUid: string }) => {
        if (!data.storeUid) {
            toast.error("Toko wajib dipilih!");
            return;
        }

        const availableStores = dialogStores.length > 0 ? dialogStores : (session?.user?.stores ?? []);
        const selectedStore = availableStores.find((s) => s.uid === data.storeUid);
        if (!selectedStore) {
            toast.error("Toko tidak valid.");
            return;
        }

        setIsStoreDialogOpen(false);
        setActiveStore(data.storeUid);

        toast.info(`Masuk sebagai Karyawan di ${selectedStore.nama}`);

        const userRoles = session?.user?.roles ?? pendingRolesRef.current ?? [];
        const targetPath = (
            userRoles.includes("admin") ||
            userRoles.includes("manajer_toko") ||
            userRoles.includes("supervisor")
        ) ? "/admin" : "/checkout";

        const token = session?.accessToken ?? pendingTokenRef.current ?? "";
        void checkLicenseAndRedirect(targetPath, token);
    };

    // Gate dialog is purely informational — navigation is handled inside the dialog itself.

    return (
        <div className="h-screen w-full flex flex-col justify-between p-4 md:p-6 bg-slate-50 relative overflow-hidden">
            {/* Ambient glows behind form (visible on all screens for premium touch) */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-500/5 to-teal-500/5 z-0" />
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none z-0" />

            {/* Center Card Container */}
            <div className="w-full max-w-[420px] mx-auto space-y-4 animate-fade-in py-2 my-auto z-10">
                <LoginCard
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />

                {/* Helper Help Text */}
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                        Butuh bantuan masuk atau lupa password? Hubungi supervisor atau administrator toko Anda.
                    </p>
                </div>
            </div>

            <LoginStoreDialog
                open={isStoreDialogOpen}
                stores={dialogStores.length > 0 ? dialogStores : (session?.user?.stores ?? [])}
                onConfirm={onConfirmStore}
            />

            {/* License Gate — blocking, non-closeable. Navigates user to /licenses. */}
            <LicenseGateDialog
                open={licenseGateOpen}
                licenseStatus={licenseStatus}
            />

            {/* Global Footer Section */}
            <div className="w-full text-center text-[11px] text-slate-400 border-t border-slate-200/50 pt-3 z-10 flex justify-between items-center max-w-5xl mx-auto font-mono">
                <span>© {new Date().getFullYear()} {AUTH_APP_NAME}</span>
                <span>{AUTH_APP_VERSION}</span>
            </div>
        </div>
    );
}
