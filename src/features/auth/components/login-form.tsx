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
    IconReceipt,
    IconPackage,
    IconTrendingUp,
} from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "../schemas/login-schema";

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
                    ? "Username atau password salah."
                    : res.error === "Configuration"
                        ? "Gagal menghubungkan ke server atau terjadi kesalahan konfigurasi."
                        : res.error;
                toast.error(errorMessage);
            } else {
                toast.success("Login berhasil!");
                // Redirect is handled by the useEffect above
            }
        } catch {
            toast.error("Gagal menghubungkan ke server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row w-full bg-slate-50">
            {/* Left Side: Branding & Features Showcase (Desktop Only) */}
            <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-slate-950 text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden shrink-0">
                {/* Decorative mesh gradient & grid lines */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 z-0" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690c_1px,transparent_1px),linear-gradient(to_bottom,#0596690c_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 opacity-40" />
                <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse duration-[8000ms] z-0" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-teal-600/10 blur-[100px] z-0" />
                
                {/* Logo Section */}
                <div className="flex items-center gap-3 relative z-10">
                    <MitrasovaLogo className="w-10 h-10 shrink-0" />
                    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                        Mitrasova POS
                    </span>
                </div>

                {/* Content/Showcase Section */}
                <div className="my-auto space-y-8 relative z-10 max-w-lg">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">
                            ✨ Sistem Point of Sale Modern
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-100">
                            Kelola Penjualan <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                Lebih Cepat & Efisien.
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            Mitrasova POS menyederhanakan transaksi kasir, manajemen stok, dan laporan keuangan toko Anda dalam satu platform yang terintegrasi.
                        </p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-5 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 shadow-2xl">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                                <IconReceipt size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Layar Kasir Interaktif</h3>
                                <p className="text-xs text-slate-400 mt-1">Transaksi checkout instan dengan metode pembayaran fleksibel dan cetak struk otomatis.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                                <IconPackage size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Manajemen Stok & Inventori</h3>
                                <p className="text-xs text-slate-400 mt-1">Pantau pergerakan stok, lakukan penyesuaian barang secara real-time, dan cegah kehabisan stok.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                                <IconTrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Laporan Laba Rugi Real-Time</h3>
                                <p className="text-xs text-slate-400 mt-1">Dapatkan wawasan performa keuangan, pengeluaran kas, serta komisi sales secara otomatis.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="relative z-10 text-xs text-slate-500 flex justify-between items-center border-t border-white/[0.05] pt-6">
                    <span>© {new Date().getFullYear()} Mitrasova POS</span>
                    <span>v1.2.0</span>
                </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-gradient-to-b from-slate-50 to-slate-100/50 min-h-screen md:min-h-0">
                <div className="w-full max-w-[400px] space-y-6 animate-fade-in">
                    {/* Brand header on mobile only */}
                    <div className="flex flex-col items-center text-center md:hidden mb-4">
                        <div className="w-14 h-14 bg-white border border-emerald-100 shadow-md rounded-2xl flex items-center justify-center mb-3 overflow-hidden p-2">
                            <MitrasovaLogo className="w-full h-full" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mitrasova POS</h2>
                        <p className="text-xs text-slate-500 mt-1">Sistem Point of Sale Modern</p>
                    </div>

                    <div className="space-y-1.5 text-center md:text-left">
                        <h2 className="hidden md:block text-3xl font-black text-slate-900 tracking-tight">
                            Selamat Datang
                        </h2>
                        <p className="text-xs text-slate-500">
                            Masukkan detail akun Anda untuk masuk ke sistem kasir dan administrasi.
                        </p>
                    </div>

                    <Card className="shadow-2xl shadow-slate-200/50 border-slate-100 rounded-2xl bg-white overflow-hidden">
                        <CardContent className="p-6 md:p-8">
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Username / Email
                                    </label>
                                    <div className="relative">
                                        <IconUser
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={18}
                                        />
                                        <Input
                                            type="text"
                                            placeholder="Masukkan username..."
                                            className="pl-10 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 transition-all rounded-xl"
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
                                    <div className="relative">
                                        <IconLock
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            size={18}
                                        />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Masukkan password..."
                                            className="pl-10 pr-10 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 transition-all rounded-xl"
                                            disabled={isLoading}
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
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
                                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-md shadow-emerald-600/10 active:scale-[0.99] transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <IconLoader2
                                                className="animate-spin"
                                                size={18}
                                            />
                                            <span>Menghubungkan...</span>
                                        </>
                                    ) : (
                                        <span>Masuk Ke Aplikasi</span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <p className="text-[11px] text-slate-400">
                            Butuh bantuan akses? Hubungi Admin Sistem.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
