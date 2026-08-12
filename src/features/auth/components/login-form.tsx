"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useAppRouter } from "@/hooks/use-app-router";
import { toast } from "sonner";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { LoginCard } from "./login-card";
import { LoginStoreDialog } from "./login-store-dialog";
import type { LoginInput } from "../schemas/login-schema";
import { AUTH_APP_NAME, AUTH_APP_VERSION } from "../constants/auth-constants";

export function LoginForm() {
    const router = useAppRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const { activeStoreUid, setActiveStore } = useActiveStoreStore();
    const [justLoggedIn, setJustLoggedIn] = useState(false);
    const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

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
                    toast.info(`Masuk sebagai Karyawan di ${soleStore.nama}`);
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
                toast.info(`Masuk sebagai Karyawan di ${currentStore.nama}`);
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

        toast.info(`Masuk sebagai Karyawan di ${selectedStore.nama}`);

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
            <div className="w-full text-center text-[11px] text-slate-400 border-t border-slate-200/50 pt-3 z-10 flex justify-between items-center max-w-5xl mx-auto font-mono">
                <span>© {new Date().getFullYear()} {AUTH_APP_NAME}</span>
                <span>{AUTH_APP_VERSION}</span>
            </div>
        </div>
    );
}
