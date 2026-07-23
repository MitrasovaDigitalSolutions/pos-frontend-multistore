"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/shared/app-button";
import {
    IconEye,
    IconEyeOff,
    IconLock,
    IconUser,
} from "@tabler/icons-react";
import { loginSchema, type LoginInput } from "../schemas/login-schema";
import { MitrasovaLogo } from "./mitrasova-logo";

interface LoginCardProps {
    onSubmit: (data: LoginInput) => Promise<void>;
    isLoading: boolean;
    appName: string;
    appLogo: string;
    isBrandingLoading: boolean;
}

export function LoginCard({
    onSubmit,
    isLoading,
    appName,
    appLogo,
    isBrandingLoading,
}: LoginCardProps) {
    const [showPassword, setShowPassword] = useState(false);

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

    return (
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
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                            <AppButton
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors duration-200"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <IconEyeOff size={18} />
                                ) : (
                                    <IconEye size={18} />
                                )}
                            </AppButton>
                        </div>
                        {errors.password && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <AppButton
                        type="submit"
                        className="w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg shadow-emerald-600/15 hover:shadow-emerald-600/25 active:scale-[0.98] transition-all duration-300"
                        isLoading={isLoading}
                        loadingText="Mohon tunggu..."
                    >
                        Masuk
                    </AppButton>
                </form>
            </CardContent>
        </Card>
    );
}
