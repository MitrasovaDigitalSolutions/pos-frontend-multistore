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
import { cn } from "@/lib/utils";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";

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
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;
        setTimeout(() => {
            setCount(api.scrollSnapList().length);
            setCurrent(api.selectedScrollSnap());
        }, 0);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    // Autoplay: scroll to next slide every 4 seconds
    useEffect(() => {
        if (!api) return;
        const interval = setInterval(() => {
            if (api.canScrollNext()) {
                api.scrollNext();
            } else {
                api.scrollTo(0);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [api]);

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
        <div className="min-h-screen md:h-screen w-full flex flex-col md:flex-row bg-slate-50 relative overflow-hidden md:overflow-hidden">
            {/* Ambient glows behind form on right side (visible on all screens for premium touch) */}
            <div className="absolute top-1/4 right-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-[20%] w-[250px] h-[250px] rounded-full bg-teal-500/5 blur-[80px] pointer-events-none z-0" />
            <div className="absolute top-[-5%] left-[45%] w-[300px] h-[300px] rounded-full bg-emerald-500/3 blur-[90px] pointer-events-none z-0" />

            {/* Left Side: Branding & Features Showcase (Desktop Only) */}
            <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-slate-950 text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden shrink-0 z-10 border-r border-slate-900/50 h-full">
                {/* Decorative mesh gradient & grid lines */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/80 to-teal-950/60 z-0" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966907_1px,transparent_1px),linear-gradient(to_bottom,#05966907_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 opacity-40" />

                {/* Flowing abstract glow blobs on left side */}
                <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[130px] animate-pulse duration-[10000ms] z-0" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[110px] animate-pulse duration-[8000ms] delay-1000 z-0" />

                {/* Logo Section */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300" />
                        <MitrasovaLogo className="w-10 h-10 shrink-0 relative" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                        Mitrasova POS
                    </span>
                </div>

                {/* Content/Showcase Section */}
                <div className="my-auto space-y-6 relative z-10 max-w-lg py-4">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md">
                            ✨ Aplikasi Kasir & Kelola Toko
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.2] text-slate-100">
                            Kemudahan Kelola Transaksi <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                dan Pantau Bisnis Anda.
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            Mencatat pesanan kasir, mengelola stok inventaris, hingga pantau laporan penjualan harian secara real-time dari satu tempat.
                        </p>
                    </div>

                    {/* Features Carousel */}
                    <div className="w-full">
                        <Carousel setApi={setApi} className="w-full select-none">
                            <CarouselContent>
                                <CarouselItem>
                                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/[0.12] transition-all duration-300">
                                        <div className="flex gap-4 items-start group">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-all duration-300">
                                                <IconReceipt size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors duration-300">
                                                    Kasir Cepat & Pembayaran Fleksibel
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                                    Proses transaksi instan, dukung berbagai opsi pembayaran, dan cetak struk secara otomatis.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>

                                <CarouselItem>
                                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/[0.12] transition-all duration-300">
                                        <div className="flex gap-4 items-start group">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-all duration-300">
                                                <IconPackage size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors duration-300">
                                                    Manajemen Stok Real-Time
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                                    Jumlah stok otomatis terpotong setiap kali transaksi berhasil untuk menghindari selisih data.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>

                                <CarouselItem>
                                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/[0.12] transition-all duration-300">
                                        <div className="flex gap-4 items-start group">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-all duration-300">
                                                <IconTrendingUp size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors duration-300">
                                                    Laporan Penjualan Otomatis
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                                    Pantau total omzet, laba kotor, dan riwayat transaksi harian secara instan tanpa rekap manual.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            </CarouselContent>
                        </Carousel>

                        {/* Dot Indicators */}
                        <div className="flex justify-center gap-1.5 mt-4">
                            {Array.from({ length: count }).map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                                        current === index
                                            ? "w-6 bg-emerald-500"
                                            : "w-1.5 bg-slate-700 hover:bg-slate-600"
                                    )}
                                    onClick={() => api?.scrollTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="relative z-10 text-xs text-slate-500 flex justify-between items-center border-t border-white/[0.05] pt-4">
                    <span>© {new Date().getFullYear()} Mitrasova POS</span>
                    <span>v1.0.0</span>
                </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 min-h-screen md:min-h-0 md:h-full z-10 overflow-y-auto">
                <div className="w-full max-w-[400px] space-y-4 md:space-y-5 animate-fade-in py-6">
                    {/* Brand header on mobile only */}
                    <div className="flex flex-col items-center text-center md:hidden mb-2">
                        <div className="relative group mb-2">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
                            <div className="w-12 h-12 bg-white border border-emerald-100 shadow-md rounded-2xl flex items-center justify-center overflow-hidden p-2 relative">
                                <MitrasovaLogo className="w-full h-full" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mitrasova POS</h2>
                        <p className="text-xs text-slate-500 mt-1">Aplikasi Kasir & Kelola Toko</p>
                    </div>

                    <div className="space-y-1.5 text-center md:text-left">
                        <h2 className="hidden md:block text-3xl font-black text-slate-900 tracking-tight">
                            Selamat Datang Kembali
                        </h2>
                        <p className="text-xs text-slate-500">Silakan masuk dengan akun Anda untuk mulai mengelola transaksi toko.</p>
                    </div>

                    <Card className="shadow-[0_20px_50px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.06)] border border-slate-100 hover:border-emerald-500/20 transition-all duration-500 rounded-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-6 md:p-8">
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
                                            className="pl-10 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all duration-300 rounded-xl"
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
                                            className="pl-10 pr-10 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all duration-300 rounded-xl"
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
                                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg shadow-emerald-600/15 hover:shadow-emerald-600/25 active:scale-[0.98] transition-all duration-300"
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

                    <div className="text-center">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Butuh bantuan masuk atau lupa password? Hubungi supervisor atau administrator toko Anda.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
