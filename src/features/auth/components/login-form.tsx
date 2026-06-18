"use client";

import { useState, useEffect } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../schemas/login-schema";
import {
    IconUser,
    IconLock,
    IconEye,
    IconEyeOff,
    IconLoader2,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

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
            username: "admin_pos",
            password: "password",
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
        <div className="grow flex items-center justify-center bg-emerald-50/50 p-6 min-h-screen">
            <Card className="w-full max-w-100 shadow-xl border-slate-100 rounded-2xl animate-fade-in">
                <CardHeader className="text-center pb-8 pt-8">
                    <div className="mx-auto w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center mb-4 overflow-hidden p-2">
                        <img
                            src="/logo/logo.png"
                            alt="Mitra Buana Motor Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">
                        Mitra Buana Motor
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                        Sistem Point of Sale
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                    className="pl-10 h-11 bg-slate-50/50 focus-visible:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-emerald-600"
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
                                    className="pl-10 pr-10 h-11 bg-slate-50/50 focus-visible:bg-white text-slate-800 text-[13px] border-slate-200 focus-visible:ring-emerald-600"
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
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-md shadow-emerald-600/10 active:scale-[0.99] transition-all"
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
                <CardFooter className="flex flex-col items-center border-t border-slate-50 pt-6 pb-6 bg-slate-50/30 rounded-b-2xl">
                    <div className="text-[11px] text-slate-400 text-center">
                        Default Akun:{" "}
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-600 font-bold">
                            admin_pos
                        </code>{" "}
                        /{" "}
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-600 font-bold">
                            password
                        </code>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
