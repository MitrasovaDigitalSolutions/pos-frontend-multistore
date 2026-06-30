"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppRouter } from "@/hooks/use-app-router";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconEye,
    IconEyeOff,
    IconLoader2,
    IconLock,
    IconUser,
} from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "../schemas/login-schema";
import { settingsApi } from "@/features/settings/api/settings-api";
import { getImageUrl } from "@/lib/utils";

function MitrasovaLogo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#logo-grad)" />
            <path
                d="M7 16V8.5L12 12.5L17 8.5V16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M12 13V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

export function LoginForm() {
    const router = useAppRouter();
    const { data: session, status } = useSession();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [appName, setAppName] = useState("Mitrasova POS");
    const [appLogo, setAppLogo] = useState("");
    const [isBrandingLoading, setIsBrandingLoading] = useState(true);

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

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    // Redirect user if they are already logged in
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const userRoles = session.user.roles;
            if (
                userRoles.includes("admin") ||
                userRoles.includes("manajer_toko") ||
                userRoles.includes("supervisor")
            ) {
                router.push("/admin");
            } else {
                router.push("/checkout");
            }
        }
    }, [session, status, router]);

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
                toast.success("Login berhasil! Selamat bekerja.");
                // Redirect is handled by the useEffect above
            }
        } catch {
            toast.error("Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col justify-between p-4 md:p-6 bg-slate-50 relative overflow-hidden">
            {/* Ambient glows behind form (visible on all screens for premium touch) */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-500/5 to-teal-500/5 z-0" />
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none z-0" />

            {/* Center Card Container */}
            <div className="w-full max-w-[420px] mx-auto space-y-4 animate-fade-in py-2 my-auto z-10">


                {/* Login Card */}
                <Card className="shadow-[0_20px_50px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.06)] border border-slate-100 hover:border-emerald-500/20 transition-all duration-500 rounded-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-5 md:p-6 space-y-4">
                        {/* Unified Branding Header */}
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                                <div className="w-12 h-12 bg-white border border-emerald-100 shadow-md rounded-2xl flex items-center justify-center relative overflow-hidden p-2">
                                    {isBrandingLoading ? (
                                        <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
                                    ) : appLogo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <MitrasovaLogo className="w-full h-full" />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5 w-full flex flex-col items-center">
                                {isBrandingLoading ? (
                                    <>
                                        <div className="h-5 bg-slate-100 rounded-md animate-pulse w-36" />
                                        <div className="h-3 bg-slate-50 rounded-md animate-pulse w-48" />
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{appName}</h2>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Aplikasi Kasir & Kelola Toko</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Username
                                </label>
                                <div className="relative group">
                                    <IconUser
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300"
                                        size={18}
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Masukkan username Anda"
                                        className="pl-10 h-10 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all duration-300 rounded-xl"
                                        disabled={isLoading}
                                        {...register("username")}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative group">
                                    <IconLock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300"
                                        size={18}
                                    />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan password Anda"
                                        className="pl-10 pr-10 h-10 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all duration-300 rounded-xl"
                                        disabled={isLoading}
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors duration-200"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <IconEyeOff size={18} />
                                        ) : (
                                            <IconEye size={18} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg shadow-emerald-600/15 hover:shadow-emerald-600/25 active:scale-[0.98] transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <IconLoader2
                                            className="animate-spin"
                                            size={18}
                                        />
                                        <span>Mohon tunggu...</span>
                                    </>
                                ) : (
                                    <span>Masuk</span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Helper Help Text */}
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                        Butuh bantuan masuk atau lupa password? Hubungi supervisor atau administrator toko Anda.
                    </p>
                </div>
            </div>

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
