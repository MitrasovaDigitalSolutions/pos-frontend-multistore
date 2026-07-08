"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppRouter } from "@/hooks/use-app-router";
import { motion } from "framer-motion";
import { 
    IconSettings, 
    IconArrowLeft
} from "@tabler/icons-react";

interface UnderDevelopmentProps {
    title: string;
    description: string;
    icon?: ReactNode;
}

export function UnderDevelopment({ title, description, icon }: UnderDevelopmentProps) {
    const router = useAppRouter();

    return (
        <div className="flex-1 min-h-[85vh] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <motion.div 
                    animate={{
                        x: [0, 40, -20, 0],
                        y: [0, -30, 40, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl"
                />
                <motion.div 
                    animate={{
                        x: [0, -35, 35, 0],
                        y: [0, 45, -35, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl"
                />
            </div>

            {/* Container Motion Wrapper */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <Card className="border border-slate-100/80 bg-white/75 dark:bg-zinc-950/75 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        
                        {/* Animated Icon Beacon */}
                        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                            {/* Outer Spinning Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-950"
                            />
                            {/* Pulse background sphere */}
                            <motion.div
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-2.5 rounded-full bg-indigo-55 dark:bg-indigo-950/30"
                            />
                            {/* Beacon Center */}
                            <div className="relative z-10">
                                {icon ? (
                                    <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
                                ) : (
                                    <IconSettings className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-[spin_6s_linear_infinite]" />
                                )}
                            </div>
                            {/* Tiny pulsing dot badge */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-1.5 right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm"
                            />
                        </div>

                        {/* Title and Tag */}
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30 mb-3 block shadow-sm">
                            Segera Hadir (Under Construction)
                        </span>
                        
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                            {title}
                        </h2>
                        
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mt-2.5">
                            {description}
                        </p>

                        {/* Interactive Buttons */}
                        <div className="w-full mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={() => router.push("/admin")}
                                className="w-full sm:w-48 flex items-center justify-center gap-2 h-11 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 rounded-xl transition-all duration-200 group shadow-sm active:scale-98"
                            >
                                <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Dashboard
                            </button>
                        </div>

                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
