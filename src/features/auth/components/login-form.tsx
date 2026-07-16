"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useAppRouter } from "@/hooks/use-app-router";
import { toast } from "sonner";
import { settingsApi } from "@/features/settings/api/settings-api";
import { getImageUrl } from "@/lib/utils";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { LoginCard } from "./login-card";
import { LoginStoreDialog } from "./login-store-dialog";
import type { LoginInput } from "../schemas/login-schema";

export function LoginForm() {
    const router = useAppRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [appName, setAppName] = useState("Mitrasova POS");
    const [appLogo, setAppLogo] = useState("");
    const [isBrandingLoading, setIsBrandingLoading] = useState(true);

    const { activeStoreUid, setActiveStore } = useActiveStoreStore();
    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Load branding settings on mount
    useEffect(() => {
        let isMounted = true;
        const fetchBranding = async () => {
            setIsBrandingLoading(true);
            try {
                const [nameRes, logoRes] = await Promise.allSettled([
                    settingsApi.getByKey("app_name"),
                    settingsApi.getByKey("app_logo_url")
                ]);

                if (isMounted) {
                    if (nameRes.status === "fulfilled" && nameRes.value?.value && nameRes.value.value.trim() !== "") {
                        setAppName(nameRes.value.value);
                    }
                    if (logoRes.status === "fulfilled" && logoRes.value?.value && logoRes.value.value.trim() !== "") {
                        setAppLogo(getImageUrl(logoRes.value.value));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch branding settings", err);
            } finally {
                if (isMounted) {
                    setIsBrandingLoading(false);
                }
            }
        };
        fetchBranding();
        return () => {
            isMounted = false;
        };
    }, []);

    // Redirect user if they are already logged in
    useEffect(() => {
        if (status === "authenticated" && session?.user && !isRedirecting) {
            const stores = session.user.stores ?? [];

            if (stores.length === 0) {
                toast.error("Akun Anda tidak memiliki akses ke toko manapun. Hubungi Admin.");
                return;
            }

            const userRoles = session.user.roles;
            const targetPath = (
                userRoles.includes("admin") ||
                userRoles.includes("manajer_toko") ||
                userRoles.includes("supervisor")
            ) ? "/admin" : "/checkout";

            if (stores.length === 1) {
                const soleStore = stores[0];
                if (activeStoreUid !== soleStore.uid) {
                    setActiveStore(soleStore.uid);
                    toast.info(`Masuk sebagai Karyawan di Toko ${soleStore.nama}`);
                } else {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setIsRedirecting(true);
                    router.push(targetPath);
                }
                return;
            }

            // User has multiple stores
            const hasValidActiveStore = activeStoreUid && stores.some((s) => s.uid === activeStoreUid);
            if (hasValidActiveStore && !justLoggedIn) {
                const currentStore = stores.find((s) => s.uid === activeStoreUid)!;
                toast.info(`Masuk sebagai Karyawan di Toko ${currentStore.nama}`);
                setIsRedirecting(true);
                router.push(targetPath);
            } else {
                setIsStoreDialogOpen(true);
            }
        }
    }, [session, status, router, activeStoreUid, justLoggedIn, isRedirecting, setActiveStore]);

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        try {
            const res = await signIn("credentials", {
                username: data.username,
                password: data.password,
                redirect: false,
            });

            if (res?.error) {
                const errorMessage = res.error === "CredentialsSignin"
                    ? "Username atau password salah. Silakan coba lagi."
                    : res.error === "Configuration"
                        ? "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
                        : res.error;
                toast.error(errorMessage);
            } else {
                // Clear any leftover active store from localStorage to force re-selection
                setActiveStore(null);
                toast.success("Login berhasil! Selamat bekerja.");
                setJustLoggedIn(true);
            }
        } catch {
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

        const selectedStore = session?.user?.stores?.find((s) => s.uid === data.storeUid);
        if (!selectedStore) {
            toast.error("Toko tidak valid.");
            return;
        }

        setActiveStore(data.storeUid);
        setIsStoreDialogOpen(false);
        setJustLoggedIn(false);

        toast.info(`Masuk sebagai Karyawan di Toko ${selectedStore.nama}`);

        const userRoles = session?.user?.roles ?? [];
        const targetPath = (
            userRoles.includes("admin") ||
            userRoles.includes("manajer_toko") ||
            userRoles.includes("supervisor")
        ) ? "/admin" : "/checkout";
        
        setIsRedirecting(true);
        router.push(targetPath);
    };

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
                    appName={appName}
                    appLogo={appLogo}
                    isBrandingLoading={isBrandingLoading}
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
                stores={session?.user?.stores ?? []}
                onConfirm={onConfirmStore}
            />

            {/* Global Footer Section */}
            <div className="w-full text-center text-[11px] text-slate-400 border-t border-slate-200/50 pt-3 z-10 flex justify-between items-center max-w-5xl mx-auto">
                {isBrandingLoading ? (
                    <div className="h-3.5 bg-slate-100 rounded animate-pulse w-32" />
                ) : (
                    <span>© {new Date().getFullYear()} {appName}</span>
                )}
                <span>v1.0.0</span>
            </div>
        </div>
    );
}
