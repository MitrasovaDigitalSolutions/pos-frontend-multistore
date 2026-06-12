"use client";

import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconTools } from "@tabler/icons-react";
import { useAppRouter } from "@/hooks/use-app-router";
import Link from "next/link";

interface PlaceholderPageProps {
    title: string;
    description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
    const router = useAppRouter();

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="relative max-w-md w-full bg-white/60 backdrop-blur-lg border border-slate-100 rounded-3xl p-8 text-center shadow-xl space-y-6 overflow-hidden">
                {/* Background decorative glow */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

                {/* Animated Icon Container */}
                <div className="relative mx-auto w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group">
                    <IconTools size={36} className="transition-transform duration-500 group-hover:rotate-12" />
                </div>

                <div className="space-y-2 relative">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Fitur Baru
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 pt-2">
                        {title}
                    </h2>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center relative">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="w-full sm:w-auto h-11 px-5 border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                    >
                        <IconArrowLeft size={16} />
                        <span>Kembali</span>
                    </Button>
                    <Link href="/admin" className="w-full sm:w-auto" passHref>
                        <Button
                            className="w-full sm:w-auto h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                            Ke Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
